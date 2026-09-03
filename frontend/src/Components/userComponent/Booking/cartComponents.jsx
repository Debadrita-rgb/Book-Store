import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import BASE_URL from "../../../../../config";
import useLockHandler from "../../../../hooks/useLockHandler";


const foodBeverageComponents = () => {
  const location = useLocation();
    useLockHandler();
  const booking = location.state;
  const { state } = useLocation();
//   console.log("Booking Data:", state);
  const navigate = useNavigate();
const [timeLeft, setTimeLeft] = useState(0);

  const {
    movieTitle,
    theaterName,
    hallName,
    selectedSeats,
    showDate,
    showTime,
    totalPrice,
    theaterId,
  } = state;

const [foodItems, setFoodItems] = useState([]);
const [cart, setCart] = useState([]);
const [search, setSearch] = useState("");
const [category, setCategory] = useState("All");
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
        }
      );
    } else {
      setTimeLeft(diff);
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);

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

        navigate(
          `/movie/${booking.slug}/${booking.movieId}/book-movie`,
        );
      }
    } catch (err) {
      console.error("Lock check failed", err);
    }
  };

  checkLock();
}, []);

  useEffect(() => {
    fetch(
      `${BASE_URL}/user/get-single-theater/${booking.theaterId}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setFoodItems(data.foodItems); 
      });
  }, []);

const foodCategories = ["All", "Popcorn", "Snacks", "Combos", "Beverages"];

const filteredFoods = foodItems.filter((item) => {
  const matchCategory = category === "All" || item.foodCategory === category;

  const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());

  return matchCategory && matchSearch;
});



  const addToCart = (item) => {
    const exist = cart.find((c) => c._id === item._id);

    if (exist) {
      setCart(
        cart.map((c) => (c._id === item._id ? { ...c, qty: c.qty + 1 } : c)),
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

const increaseQty = (id) => {
  setCart(cart.map((c) => (c._id === id ? { ...c, qty: c.qty + 1 } : c)));
};

const decreaseQty = (id) => {
  setCart(
    cart
      .map((c) => (c._id === id ? { ...c, qty: c.qty - 1 } : c))
      .filter((c) => c.qty > 0),
  );
};

const foodTotal = cart.reduce(
  (sum, item) => sum + item.foodPrice * item.qty,
  0,
);

const grandTotal = booking.totalPrice + foodTotal;


const proceedPayment = () => {

  const foodDetails = cart.map((item) => ({
    foodId: item._id,
    name: item.title,
    price: item.foodPrice,
    quantity: item.qty,
    total: item.foodPrice * item.qty,
    foodStatus: "Booked",
    remainingQty: item.qty,
  }));

  navigate("/payment", {
    state: {
      ...booking,
      foodItems: foodDetails,
      foodTotal,
      grandTotal,
    },
  });
};

  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded text-sm shadow">
        ⏳ Payment Time left: {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, "0")}
      </div>
      <div className="min-h-screen">
        <div className="shadow p-4">
          <h2 className="text-lg font-semibold">{booking.movieTitle}</h2>
          <p className="text-sm text-white">
            {booking.theaterName} | {booking.hallName}
          </p>
          <p className="text-sm text-white">
            {new Date(booking.showDate).toLocaleDateString()} |{" "}
            {booking.showTime}
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/payment", { state: booking })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Skip
          </button>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 px-3">
          {" "}
          <div className="lg:col-span-2">
            <div className=" p-3 rounded shadow mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for F&B Items"
                className="w-full border rounded px-3 py-2 border-gray-400 bg-transparent outline-none text-sm text-black"
              />
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4  p-3 rounded shadow mb-4">
              {foodCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-sm sm:text-base rounded-full transition ${
                    category === cat
                      ? "bg-red-100 text-red-500 border border-red-500 font-semibold"
                      : "text-black bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {" "}
              {filteredFoods.map((item) => {
                const cartItem = cart.find((c) => c._id === item._id);

                return (
                  <div
                    key={item._id}
                    className=" rounded-lg shadow p-3 sm:p-4 flex items-center justify-between"
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.imageUrl}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                      />

                      <div>
                        <h3 className="text-black font-medium">{item.title}</h3>
                        <p className="text-gray-500">₹{item.foodPrice}</p>
                      </div>
                    </div>

                    {cartItem ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decreaseQty(item._id)}
                          className="px-2 border border-black text-black"
                        >
                          -
                        </button>

                        <span className="text-black">{cartItem.qty}</span>

                        <button
                          onClick={() => increaseQty(item._id)}
                          className="px-2 border border-black text-black"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="border border-red-500 text-red-500 px-2 sm:px-4 py-1 text-xs sm:text-sm rounded"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className=" rounded-xl shadow-lg p-4 sm:p-5 h-fit border border-gray-200">
            {" "}
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-semibold text-gray-700">Ticket Price</h3>
              <p className="text-lg font-semibold text-black">
                ₹{booking.totalPrice}
              </p>
            </div>
            {cart.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">
                  Fill this cart with your favorite food combos!
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-gray-800 mt-4 mb-3 border-b pb-2">
                  Your Cart
                </h3>

                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm text-gray-700 bg-gray-50 p-2 rounded"
                    >
                      <span>
                        {item.title}{" "}
                        <span className="text-gray-400">x{item.qty}</span>
                      </span>

                      <span className="font-medium">
                        ₹{item.foodPrice * item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t my-4"></div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">
                    Grand Total
                  </span>

                  <span className="text-xl font-bold text-green-600">
                    ₹{grandTotal}
                  </span>
                </div>

                <button
                  className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  onClick={proceedPayment}
                >
                  Proceed to Payment
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default foodBeverageComponents;
