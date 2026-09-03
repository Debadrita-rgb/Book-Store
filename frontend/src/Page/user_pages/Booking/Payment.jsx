import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import BASE_URL from "../../../../config";
import useLockHandler from "../../../hooks/useLockHandler";

const Payment = () => {
  const location = useLocation();
    useLockHandler();
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = location.state;
  // console.log("Booking Data:", booking);
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const ticketPrice = booking.totalPrice;

  const foodTotal =
    booking.foodItems?.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    ) || 0;
// console.log("foodTotal", foodTotal);
  const subtotal = ticketPrice + foodTotal;

  const convenienceFee = subtotal * 0.18;

  const cgst = convenienceFee / 2;
  const sgst = convenienceFee / 2;

  const totalcgstsgst = cgst + sgst;

  useEffect(() => {
    const checkLock = async () => {
      const lockId = localStorage.getItem("lockId");

      if (!lockId) return;

      try {
        const res = await fetch(
          `${BASE_URL}/user/get-single-lockedseat/${lockId}`,
        );
        const data = await res.json();

        const lockStatus = data?.lockStatus;

        if (lockStatus === "InActive") {
          localStorage.removeItem("lockId");
          localStorage.removeItem("lockExpiry");

          navigate(`/movie/${booking.slug}/${booking.movieId}/book-movie`);
        }
      } catch (err) {
        console.error("Lock check failed", err);
      }
    };

    checkLock();
  }, []);

  useEffect(() => {
    const expiry = localStorage.getItem("lockExpiry");

    if (!expiry) {
      navigate("/");
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(expiry).getTime();

      const diff = Math.floor((end - now) / 1000);

      if (diff <= 0) {
        clearInterval(interval);

        alert("⏳ Time is out! Seats released");

        localStorage.removeItem("lockExpiry");
        localStorage.removeItem("lockId");

        navigate(
          `/movie/${booking.slug}/${booking.movieId}/book-movie/seat-arrangement`,
          {
            state: {
              selectedDate: booking.showDate,
              selectedTimeSlot: booking.showTime,
              seatCount: booking.seats?.length || 0,
              theaterId: booking.theaterId,
              expired: true,
            },
          },
        );
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      const expiry = localStorage.getItem("lockExpiry");

      if (!expiry || new Date(expiry) < new Date()) {
        alert("⏳ Session expired. Please select seats again.");
        navigate(
          `/movie/${booking.slug}/${booking.movieId}/book-movie/seat-arrangement`,
        );
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.id;
      // console.log("UserID:", userId);
      const roundedAmount = Number(finalAmount.toFixed(2));

      const res = await fetch(`${BASE_URL}/user/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: roundedAmount }),
      });

      const order = await res.json();

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded");
        return;
      }

      const options = {
        key: "rzp_test_SPANr2wS2zzuBp",

        amount: order.amount,

        currency: "INR",

        name: "Movie Booking",

        description: booking.movieTitle,

        order_id: order.id,

        handler: async function (response) {
          await fetch(`${BASE_URL}/user/confirm-booking`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...booking,
              lockId: booking.lockId,  
              paymentId: response.razorpay_payment_id,
              paymentStatus: "Success",
              totalAmount: Number((finalAmount || 0).toFixed(2)),
              userId: userId,
              convenienceFee: Number((convenienceFee || 0).toFixed(2)),
              type: "Movie",
              cgst: Number(cgst.toFixed(2)),
              sgst: Number(sgst.toFixed(2)),
              ticketPrice: Number((ticketPrice || 0).toFixed(2)),
              foodTotal: Number((foodTotal || 0).toFixed(2)),
              bookingStatus: "Confirmed",
            }),
          });

          localStorage.removeItem("lockId");
          localStorage.removeItem("lockExpiry");
          
          alert("Payment Successful 🎉");
          navigate("/user-bookings");
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.open();
    } catch (error) {
      console.log("Payment Error:", error);
    }
  };

  const baseAmount = booking.grandTotal ?? booking.totalPrice ?? 0;

  const finalAmount = baseAmount + totalcgstsgst;

  return (
    <div className="rounded shadow p-5 relative">
      <button className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded text-sm shadow">
        ⏳ Payment Time left: {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, "0")}
      </button>
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-black">
        <div className="md:col-span-2  rounded shadow p-5">
          <h2 className="text-lg font-semibold mb-4">Payment Options</h2>

          <div className="space-y-3">
            <button className="border p-4 w-full text-left rounded hover:border-red-500">
              Pay by any UPI App
            </button>

            <button className="border p-4 w-full text-left rounded">
              Debit / Credit Card
            </button>

            <button className="border p-4 w-full text-left rounded">
              Net Banking
            </button>
          </div>
        </div>

        <div className=" rounded shadow p-5 relative">

          <h3 className="font-semibold text-lg mb-3">{booking.movieTitle}</h3>

          <p className="text-sm text-gray-500">
            {new Date(booking.showDate).toLocaleDateString()} |{" "}
            {booking.showTime}
          </p>

          <p className="text-sm text-gray-500 mb-3">{booking.theaterName}</p>

          <div className="border-t pt-3">
            <div className="flex justify-between mb-2">
              <span>Ticket(s) price</span>
              <span>₹{ticketPrice}</span>
            </div>

            <div
              className="flex justify-between cursor-pointer"
              onClick={() => setShowFeeDetails(!showFeeDetails)}
            >
              <span>
                Convenience fees
                <span className="ml-1">⌄</span>
              </span>

              <span>₹{convenienceFee.toFixed(2)}</span>
            </div>

            {showFeeDetails && (
              <div className="text-sm text-gray-500 ml-3 mt-1">
                <div className="flex justify-between">
                  <span>CGST @9%</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>SGST @9%</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
              </div>
            )}

            {booking.foodItems?.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-1">Food & Beverage</h4>

                {booking.foodItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>
                      {item.name} (x{item.quantity})
                    </span>

                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
              <span>Amount Payable</span>

              <span>₹{Number(finalAmount).toFixed(2)}</span>
            </div>
          </div>

          <button
            className="w-full mt-4 bg-red-500 text-white py-2 rounded hover:bg-red-600"
            onClick={handlePayment}
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
