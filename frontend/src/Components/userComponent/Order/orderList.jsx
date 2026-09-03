import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../../config";
import { useNavigate, Link } from "react-router-dom";
import {
  FaStar
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "../../../context/CartContext";

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [years, setYears] = useState([]);
    const [reviews, setReviews] = useState([]);
  
  const [selectedFilter, setSelectedFilter] = useState("3months");
  const {
    setCartCount,
    
  } = useCart();

  const getOrders = async (filter = "3months") => {
    try {
      const token = localStorage.getItem("token");

      const params = {};

      if (filter === "3months") {
        params.filter = "3months";
      } else {
        params.year = filter;
      }

      const res = await axios.get(`${BASE_URL}/user/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      if (res.data.success) {
        setOrders(res.data.data);
        setYears(res.data.years);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
  getOrders("3months");
  }, []);

  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/user/invoice/${orderId}`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const pdfUrl = URL.createObjectURL(response.data);

      window.open(pdfUrl, "_blank");
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyItAgain = async (bookId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }
    // 1. Add to cart
    await axios.post(
      `${BASE_URL}/user/add-to-cart`,
      {
        bookId,
        quantity: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // 2. Update cart count
    setCartCount();

    // 3. Get book details
    try {
      const res = await axios.get(`${BASE_URL}/user/get-single-book/${bookId}`);

      const book = res.data;
      const quantity = 1;

      const subtotal = book.price * quantity;
      const cgst = subtotal * 0.09;
      const sgst = subtotal * 0.09;
      const grandTotal = subtotal + cgst + sgst;

      const cartItems = [
        {
          selected: true,
          quantity,
          details: {
            _id: book._id,
            title: book.title,
            author: book.author,
            coverImageLink: book.coverImageLink,
            price: book.price,
          },
        },
      ];

      navigate("/checkout", {
        state: {
          cartItems,
          subtotal: Number(subtotal.toFixed(2)),
          cgst: Number(cgst.toFixed(2)),
          sgst: Number(sgst.toFixed(2)),
          grandTotal: Number(grandTotal.toFixed(2)),
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

 useEffect(() => {
   const fetchReviews = async () => {
     if (!orders.length) return;

     try {
       const token = localStorage.getItem("token");
       const reviewData = {};

       const bookIds = [
         ...new Set(
           orders.flatMap((order) => order.books.map((book) => book.bookId)),
         ),
       ];

       await Promise.all(
         bookIds.map(async (bookId) => {
           const res = await axios.get(
             `${BASE_URL}/user/get-review-by-bookId/${bookId}`,
             {
               headers: {
                 Authorization: `Bearer ${token}`,
               },
             },
           );

           reviewData[bookId] =
             res.data.success && Array.isArray(res.data.data)
               ? res.data.data
               : [];
         }),
       );

       setReviews(reviewData);
     } catch (err) {
       console.error(err);
     }
   };

   fetchReviews();
 }, [orders]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">My Orders</h1>

          <div className="sm:ml-auto">
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                getOrders(e.target.value);
              }}
              className="w-48 border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="3months">Past 3 Months</option>

              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-6">
          {orders.map((order) => {
            const hasCoupon =
              order.coupon &&
              order.coupon.couponCode &&
              order.coupon.discount != null;
            const convenienceFee = Number(
              (order.cgst + order.sgst || 0).toFixed(2),
            );

            return (
                <div className=" border rounded-xl overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="bg-gray-100 px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 uppercase text-xs">
                        Order Placed
                      </p>
                      <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div>
                      <p className="text-gray-500 uppercase text-xs">Total</p>
                      <p className="font-semibold">₹{order.payableAmount}</p>
                    </div>

                    <div>
                      <p className="text-gray-500 uppercase text-xs">Ship To</p>
                      <p>{order.address.fullName}</p>
                    </div>

                    <div>
                      <p className="text-gray-500 uppercase text-xs">Payment</p>
                      <p>{order.paymentMethod}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-gray-500 uppercase text-xs">Order #</p>

                      <p className="text-blue-600">{order.orderNumber}</p>

                      <button
                        onClick={() => navigate(`/order-details/${order._id}`)}
                        className="text-blue-600 text-sm cursor-pointer"
                      >
                        View order details
                      </button>
                    </div>
                  </div>

                  {/* Products */}

                  <div className="p-6">
                    {order.books.map((book) => {
                      const bookReviews = reviews[book.bookId] || [];

const averageRating =
  bookReviews.length > 0
    ? bookReviews.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0
      ) / bookReviews.length
    : 0;

const totalReviews = bookReviews.length;
return (
    <div
      key={book._id}
      className="flex flex-col lg:flex-row justify-between gap-8 border-b last:border-none py-5"
    >
      {/* Left */}

      <div className="flex gap-5 flex-1">
          <Link to={`/book/${book.bookId}`}>

        <img
          src={book.coverImage}
          className="w-28 h-36 object-cover rounded border"
        />
        </Link>

        <div>
          <h2 className="text-xl font-semibold text-green-700">
            {order.orderStatus}
          </h2>

          <p className="text-gray-500 mb-3">Payment {order.paymentStatus}</p>

          <h3 className="font-medium text-lg">{book.title}</h3>

          {/* Rating and Reviews  */}
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
                    <FaStar size={16} className="text-yellow-500" />
                  </span>
                </span>
              );
            })}

            <span className="font-semibold">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>

            {/* Reviews */}
            <span className="wishlist-muted">
              ({totalReviews} {totalReviews === 1 ? "Review" : "Reviews"})
            </span>
          </div>

          <p>Qty : {book.quantity}</p>

          <p>Price : ₹{book.price}</p>
          <p>Convenience Fee : ₹{convenienceFee}</p>

          {hasCoupon && <p>Coupon Discount : ₹{order.coupon?.discount}</p>}

          <p className="font-semibold">Total : ₹{order.payableAmount}</p>

          <div className="flex gap-3 mt-5">
            {book.available_quantity > 0 && (
              <button
                onClick={() => handleBuyItAgain(book.bookId)}
                className="bg-yellow-400 hover:bg-yellow-500 px-5 py-2 rounded-full cursor-pointer"
              >
                Buy it Again
              </button>
            )}

            {book.available_quantity === 0 && (
              <span className="text-red-600 font-semibold">Out of Stock</span>
            )}

            <button
              onClick={() => navigate(`/book/${book.bookId}`)}
              className="border rounded-full px-5 py-2 cursor-pointer"
            >
              View Item
            </button>
          </div>
        </div>
      </div>

      {/* Right */}

      <div className="w-full lg:w-72 flex flex-col gap-3">
        <button
          onClick={() => navigate(`/track-package/${order._id}`)}
          className="border rounded-full py-2 hover:bg-gray-100 cursor-pointer"
        >
          Track Package
        </button>

        {/* <button className="border rounded-full py-2 hover:bg-gray-100 cursor-pointer">
                          Ask Product Question
                        </button> */}

        <button
          onClick={() => downloadInvoice(order._id)}
          className="border rounded-full py-2 hover:bg-gray-100 cursor-pointer"
        >
          Download Invoice
        </button>

        <button
          onClick={() =>
            navigate(`/product-review/${book.bookId}`, {
              state: {
                orderId: order._id,
              },
            })
          }
          className="border rounded-full py-2 hover:bg-gray-100 cursor-pointer"
        >
          Product Review
        </button>
      </div>
    </div>
);
          })}
                  </div>
                </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
