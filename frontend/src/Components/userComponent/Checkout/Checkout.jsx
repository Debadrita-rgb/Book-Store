import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import BASE_URL from "../../../../config";
import axios from "axios";
import CouponModal from "../Checkout/CouponModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "../../../context/CartContext";
import { FaStar } from "react-icons/fa";

const Checkout = () => {
  const { state } = useLocation();
  const [address, setAddress] = useState(null);
  const navigate = useNavigate();
  const [showAddresses, setShowAddresses] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [allAddresses, setAllAddresses] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const { getCartCount } = useCart();

  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/signin");
    return;
  }

  const decoded = jwtDecode(token);
  const userId = decoded.id;

  if (!state) {
    return <div className="p-10 text-center">No checkout data found</div>;
  }

  const { cartItems, subtotal, cgst, sgst, grandTotal } = state;

  useEffect(() => {
    const fetchReviews = async () => {
      if (!cartItems.length) return;

      try {
        const token = localStorage.getItem("token");
        const reviewData = {};

        await Promise.all(
          cartItems.map(async (cart) => {
            const bookId =
              typeof cart.bookId === "object" ? cart.bookId?._id : cart.bookId;

            if (!bookId) return;

            const res = await fetch(
              `${BASE_URL}/user/get-review-by-bookId/${bookId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            const result = await res.json();

            reviewData[bookId] =
              result.success && Array.isArray(result.data) ? result.data : [];
          }),
        );

        setReviews(reviewData);
      } catch (err) {
        console.error("Review error:", err);
        setReviews({});
      }
    };

    fetchReviews();
  }, [cartItems]);

  const getDefaultAddress = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/get-default-address`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setAddress(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getDefaultAddress();
  }, []);

  const openCouponModal = () => {
    setShowCouponModal(true);
    fetchCoupons();
  };

  //coupon List
  const fetchCoupons = async () => {
    try {
      // const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/user/show-all-coupons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.log(err);
      console.log(err.response?.data);

      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const applyCoupon = (coupon) => {
    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount = (grandTotal * coupon.discountValue) / 100;

      if (discount > coupon.maximumDiscountAmount) {
        discount = Number((coupon.maximumDiscountAmount || 0).toFixed(2));
      }
    } else {
      discount = Number((coupon.discountValue || 0).toFixed(2));
    }

    setAppliedCoupon(coupon);
    setCouponDiscount(discount);

    setShowCouponModal(false);

    toast.success(`${coupon.code} applied successfully`);
  };

  const finalTotal = grandTotal - couponDiscount;

  const convenienceFee = cgst + sgst;

  const handlePayment = async () => {
    if (!address?._id) {
      toast.error("Please select a delivery address before placing the order.");
      return;
    }
    try {
      const amount = Number(finalTotal.toFixed(2));

      const res = await axios.post(
        `${BASE_URL}/user/create-order`,
        {
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const order = res.data;

      const options = {
        key: "rzp_test_SPANr2wS2zzuBp",

        amount: order.amount,

        currency: "INR",

        name: "Book Store",

        description: "Book Purchase",

        order_id: order.id,

        handler: async function (response) {
          await confirmOrder(response);
        },

        prefill: {
          name: address?.fullName,
          contact: address?.mobile,
        },

        theme: {
          color: "#ef4444",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.log(error);
    }
  };

  // const confirmOrder = async (paymentId, userId) => {
  const confirmOrder = async (response) => {
    try {
      const payload = {
        items: cartItems
          .filter((item) => item.selected)
          .map((item) => ({
            bookId: item.details._id,
            title: item.details.title,
            author: item.details.author,
            coverImage: item.details.coverImageLink,
            price: item.details.price,
            quantity: item.quantity,
            totalPrice: item.details.price * item.quantity,
          })),

        address,

        subtotal,

        cgst: Number((cgst || 0).toFixed(2)),

        sgst: Number((sgst || 0).toFixed(2)),

        totalAmount: Number((grandTotal || 0).toFixed(2)),

        payableAmount: Number((finalTotal || 0).toFixed(2)),

        coupon: appliedCoupon
          ? {
              couponId: appliedCoupon._id,
              couponCode: appliedCoupon.code,
              discount: couponDiscount,
            }
          : null,

        paymentMethod: "UPI",

        razorpayOrderId: response.razorpay_order_id,

        razorpayPaymentId: response.razorpay_payment_id,

        razorpaySignature: response.razorpay_signature,
      };
      const res = await axios.post(
        `${BASE_URL}/user/confirm-book-order`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);
        await getCartCount();

        navigate("/orders");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAddress = async () => {
    try {
      // const token = localStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/user/get-address`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setAllAddresses(response.data.data);

        const defaultAddress = response.data.data.find((a) => a.isDefault);

        if (defaultAddress) {
          setAddress(defaultAddress);
          setSelectedAddress(defaultAddress._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    getAddress();
  }, []);

  const changeDefaultAddress = async (addressId) => {
    try {
      // const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/user/set-default/${addressId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      getAddress();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="checkout-page py-8">
      {" "}
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="checkout-title text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">
            {/* Cart Items */}
            <div className="checkout-card rounded-2xl p-6">
              <h2 className="checkout-title text-2xl font-bold mb-6">
                Your Items
              </h2>

              <div className="space-y-5">
                {cartItems
                  .filter((item) => item.selected)
                  .map((item) => {
                    const bookId =
                      typeof item.bookId === "object"
                        ? item.bookId?._id
                        : item.bookId;

                    // Get reviews for this particular book
                    const bookReviews = reviews[bookId] || [];

                    // Calculate average rating
                    const averageRating =
                      bookReviews.length > 0
                        ? bookReviews.reduce(
                            (sum, review) => sum + Number(review.rating || 0),
                            0,
                          ) / bookReviews.length
                        : 0;

                    const totalReviews = bookReviews.length;

                    return (
                      <div
                        key={item.details._id}
                        className="checkout-item flex gap-5 rounded-xl p-4"
                      >
                        <Link to={`/book/${bookId}`} className="block">
                          <img
                            src={item.details.coverImageLink}
                            className="w-24 h-32 rounded-lg object-cover border checkout-divider"
                          />
                        </Link>

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {item.details.title}
                          </h3>

                          <p className="checkout-text mt-1">
                            {" "}
                            {item.details.author}
                          </p>

                          <div className="flex items-center gap-2 mt-3">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const fillPercentage = Math.min(
                                Math.max((averageRating - (star - 1)) * 100, 0),
                                100,
                              );

                              return (
                                <span
                                  key={star}
                                  className="relative inline-block"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                  }}
                                >
                                  {/* Empty Star */}
                                  <FaStar
                                    size={16}
                                    className="absolute top-0 left-0 text-gray-300"
                                  />

                                  {/* Colored portion */}
                                  <span
                                    className="absolute top-0 left-0 overflow-hidden"
                                    style={{
                                      width: `${fillPercentage}%`,
                                      height: "16px",
                                    }}
                                  >
                                    <FaStar
                                      size={16}
                                      className="text-yellow-500"
                                    />
                                  </span>
                                </span>
                              );
                            })}

                            <span className="font-semibold">
                              {averageRating > 0
                                ? averageRating.toFixed(1)
                                : "0.0"}
                            </span>

                            {/* Reviews */}
                            <span className="wishlist-muted">
                              ({totalReviews}{" "}
                              {totalReviews === 1 ? "Review" : "Reviews"})
                            </span>
                          </div>

                          <div className="mt-4 flex justify-between">
                            <span className="checkout-text">
                              {" "}
                              Qty : {item.quantity}
                            </span>

                            <span className="font-bold text-red-500 text-lg">
                              ₹{item.details.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="checkout-card rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📍</div>

                  <div>
                    <h2 className="font-bold text-xl">Delivery Address</h2>

                    <p className="checkout-muted text-sm">Default Address</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddresses(!showAddresses)}
                  className="text-red-500 font-semibold hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="checkout-address-box mt-5 rounded-xl p-4">
                <h3 className="font-semibold">{address?.fullName}</h3>

                <p className="checkout-text">{address?.mobileNumber}</p>

                <p className="checkout-text mt-2">
                  {address?.addressLine1},{address?.city},{address?.state},
                  {address?.postalCode}
                </p>
              </div>
            </div>

            {showAddresses && (
              <div className="checkout-card rounded-2xl p-6">
                {" "}
                <h2 className="text-xl font-semibold mb-5">
                  Select Delivery Address
                </h2>
                <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory">
                  {allAddresses.map((item) => (
                    <div
                      key={item._id}
                      className={`checkout-address-card min-w-[320px] max-w-[320px] rounded-xl p-5 flex-shrink-0 snap-start ${
                        selectedAddress === item._id ? "active" : ""
                      }`}
                    >
                      <div className="flex justify-between">
                        {/* <input
                          type="radio"
                          checked={selectedAddress === item._id}
                          onChange={() => setSelectedAddress(item._id)}
                        /> */}

                        {item.isDefault && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold mt-3">{item.fullName}</h3>

                      <p>{item.mobileNumber}</p>

                      <p className="checkout-text mt-2 text-gray-600">
                        {item.addressLine1}
                      </p>

                      {item.addressLine2 && (
                        <p className="checkout-text">{item.addressLine2}</p>
                      )}

                      <p>
                        {item.city}, {item.state}
                      </p>

                      <p>{item.postalCode}</p>

                      <button
                        className="mt-5 w-full bg-yellow-400 hover:bg-yellow-500 rounded-lg py-2 font-semibold"
                        onClick={() => changeDefaultAddress(item._id)}
                      >
                        Deliver Here
                      </button>
                    </div>
                  ))}

                  <div className="checkout-address-card min-w-[320px] max-w-[320px] border-2 border-dashed rounded-xl flex items-center justify-center">
                    <button
                      onClick={() => navigate("/add-address")}
                      className="text-blue-600 font-semibold"
                    >
                      + Add New Address
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4">
            <div className="checkout-summary rounded-2xl p-6 sticky top-6">
              {" "}
              <h2 className="checkout-title text-2xl font-bold mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 checkout-text">
                {" "}
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience Fee</span>
                  <span>₹{convenienceFee.toFixed(2)}</span>
                </div>
                <div className="border-t checkout-divider pt-4 flex justify-between text-lg font-semibold">
                  <span>Total</span>

                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
                {/* Coupon Section */}
                <div className="mt-6">
                  {appliedCoupon ? (
                    <div className="checkout-coupon-success rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-green-700">
                            🎟 {appliedCoupon.code}
                          </p>

                          <p className="checkout-text text-sm">
                            Coupon applied successfully
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponDiscount(0);
                          }}
                          className="text-sm text-red-500 font-medium hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex justify-between mt-3 text-green-600">
                        <span>Discount</span>

                        <span>- ₹{couponDiscount.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={openCouponModal}
                      className="checkout-btn-red w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2"
                    >
                      🎟 Apply Coupon
                    </button>
                  )}
                </div>
                <div className="checkout-payable rounded-xl p-4 mt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Payable</span>

                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handlePayment}
                className="checkout-btn-primary cursor-pointer w-full mt-6 py-4 rounded-xl font-semibold"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
      {showCouponModal && (
        <CouponModal
          coupons={coupons}
          subtotal={subtotal}
          closeModal={() => setShowCouponModal(false)}
          applyCoupon={applyCoupon}
        />
      )}
    </div>
  );
};

export default Checkout;
