import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../../config";
import { FaStar,  } from "react-icons/fa";

const OrderDetails = () => {
  const { orderId } = useParams();

  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
const [reviews, setReviews] = useState({});

  useEffect(() => {
    getOrder();
  }, []);

  const getOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/user/get-single-order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };
useEffect(() => {
  const fetchReviews = async () => {
    if (!order) return;

    try {
      const token = localStorage.getItem("token");
      const reviewData = {};

      const bookIds = order.books.map((book) => book.bookId);

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
}, [order]);

  if (!order) return <h2 className="text-center mt-20">Loading...</h2>;

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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-semibold mb-2">Order Details</h1>

        <p className="text-gray-600 mb-6">
          Order placed {new Date(order.createdAt).toLocaleDateString()}
          {" | "}
          Order Number {order.orderNumber}
        </p>

        {/* Top Card */}

        <div className=" rounded-xl shadow border p-8 grid md:grid-cols-3 gap-8">
          <div>
            <h2 className="font-bold text-xl mb-3">Ship To</h2>

            <p>{order.address.fullName}</p>

            <p>{order.address.mobileNumber}</p>

            <p>{order.address.addressLine1}</p>

            {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}

            <p>{order.address.city}</p>

            <p>{order.address.state}</p>

            <p>{order.address.postalCode}</p>

            <p>{order.address.country}</p>
          </div>

          <div>
            <h2 className="font-bold text-xl mb-3">Payment Method</h2>

            <p>{order.paymentMethod}</p>

            <p className="text-green-600 mt-2">{order.paymentStatus}</p>
          </div>

          <div>
            <h2 className="font-bold text-xl mb-3">Order Summary</h2>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>CGST</span>
                <span>₹{order.cgst}</span>
              </div>

              <div className="flex justify-between">
                <span>SGST</span>
                <span>₹{order.sgst}</span>
              </div>

              <div className="flex justify-between">
                <span>Discount</span>
                <span>₹{order.coupon?.discount || 0}</span>
              </div>

              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{order.payableAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}

        {order.books.map((book) => {
          const bookReviews = reviews[book.bookId] || [];

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
              key={book._id}
              className=" rounded-xl shadow border mt-8 p-6 flex flex-col lg:flex-row justify-between gap-6"
            >
              <div className="flex gap-6 flex-1">
                <Link to={`/book/${book.bookId}`}>
                  <img
                    src={book.coverImage}
                    className="w-36 h-48 object-cover rounded"
                    alt={book.title}
                  />
                </Link>

                <div>
                  <h2 className="text-3xl font-semibold text-green-700">
                    {order.orderStatus}
                  </h2>

                  <p className="text-gray-500 mb-4">
                    Payment {order.paymentStatus}
                  </p>

                  <h3 className="text-xl font-semibold">{book.title}</h3>

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
                      ({totalReviews}{" "}
                      {totalReviews === 1 ? "Review" : "Reviews"})
                    </span>
                  </div>

                  <p className="mt-2">Quantity : {book.quantity}</p>

                  <p>Price : ₹{book.price}</p>

                  <p className="font-semibold">Total : ₹{book.totalPrice}</p>

                  <div className="flex gap-3 mt-6">
                    {book.available_quantity > 0 && (
                      <button
                        onClick={() => handleBuyItAgain(book.bookId)}
                        className="bg-yellow-400 hover:bg-yellow-500 px-5 py-2 rounded-full cursor-pointer"
                      >
                        Buy it Again
                      </button>
                    )}

                    {/* {book.available_quantity === 0 && ( */}
                    <span className="text-red-600 font-semibold">
                      Out of Stock
                    </span>
                    {/* )} */}

                    <button
                      onClick={() => navigate(`/book/${book.bookId}`)}
                      className="border rounded-full px-6 py-2 cursor-pointer"
                    >
                      View Item
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-72 flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/track-package/${order._id}`)}
                  className="border rounded-full py-3 hover:bg-gray-100 cursor-pointer"
                >
                  Track Package
                </button>

                <button
                  onClick={() => downloadInvoice(order._id)}
                  className="border rounded-full py-3 hover:bg-gray-100 cursor-pointer"
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
                  className="border rounded-full py-3 hover:bg-gray-100 cursor-pointer"
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
};

export default OrderDetails;
