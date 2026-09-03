import React, { useEffect, useState } from "react";
import BASE_URL from "../../../../config";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useCart } from "../../../context/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash, FaShareAlt, FaRegClock, FaStar } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

const CartList = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState({});

  const { setCartCount, getCartCount, getWishlistCount } = useCart();

  const getCart = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/user/get-cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setCartItems(
          res.data.data.map((item) => ({
            ...item,
            selected: item.selected ?? true,
          })),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  const handleSelect = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const increaseQty = async (book) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/user/update-cart-qty`,
        {
          cartId: book._id,
          quantity: book.quantity + 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      getCart();
      setCartCount((prev) => prev + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const decreaseQty = async (book) => {
    if (book.quantity === 1) return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/user/update-cart-qty`,
        {
          cartId: book._id,
          quantity: book.quantity - 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      getCart();
      setCartCount((prev) => prev - 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const deleteCart = async (cartId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${BASE_URL}/user/remove-cart/${cartId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        // Reload cart list
        toast.success(res.data.message);

        await getCart();

        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const subtotal = cartItems.reduce((total, item) => {
    if (!item.selected) return total;

    return total + item.details.price * item.quantity;
  }, 0);

  const totalItems = cartItems.reduce((total, item) => {
    if (!item.selected) return total;

    return total + item.quantity;
  }, 0);

  const cgst = subtotal * 0.09;

  const sgst = subtotal * 0.09;

  const grandTotal = subtotal + cgst + sgst;

  //save for later
  const saveForLater = async (cartId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${BASE_URL}/user/save-for-later`,
        {
          cartId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);

        await getCart();
        await getCartCount();
        await getWishlistCount();
      }
    } catch (err) {
      console.log(err);
      console.log(err.response);
      console.log(err.response?.data);

      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const checkout = () => {
    navigate("/checkout", {
      state: {
        cartItems,
        subtotal: Number((subtotal || 0).toFixed(2)),
        cgst: Number((cgst || 0).toFixed(2)),
        sgst: Number((sgst || 0).toFixed(2)),
        grandTotal: Number((grandTotal || 0).toFixed(2)),
      },
    });
  };

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

  return (
    <div className="cart-page py-8">
      {" "}
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <h1 className="cart-title text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-8 space-y-6">
            {cartItems.length > 0 ? (
              cartItems.map((cart) => {
                const bookId =
                  typeof cart.bookId === "object"
                    ? cart.bookId?._id
                    : cart.bookId;

                const bookReviews = reviews[bookId] || [];

                const averageRating =
                  bookReviews.length > 0
                    ? bookReviews.reduce(
                        (sum, review) => sum + Number(review.rating || 0),
                        0,
                      ) / bookReviews.length
                    : 0;

                const totalReviews = bookReviews.length;

                return (
                    <div key={cart._id} className="cart-card rounded-2xl p-4 sm:p-5">
                      {/* Top Section */}
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className="pt-2">
                          <input
                            type="checkbox"
                            checked={cart.selected}
                            onChange={() => handleSelect(cart._id)}
                            className="cart-checkbox w-5 h-5 cursor-pointer"
                          />
                        </div>

                        {/* Image */}
                                          <Link to={`/book/${bookId}`}  className="block">

                        <img
                          src={cart.details?.coverImageLink}
                          alt={cart.details?.title}
                          className="cart-image w-24 h-32 sm:w-32 sm:h-44 object-cover rounded-xl"
                        /></Link>

                        {/* Title & Price */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h2 className="text-lg sm:text-xl font-bold line-clamp-2">
                                {cart.details?.title}
                              </h2>

                              <p className="cart-text text-sm mt-1">
                                {cart.details?.author}
                              </p>

                              {/* Rating and Reviews  */}
                              <div className="flex items-center gap-2 mt-3">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const fillPercentage = Math.min(
                                    Math.max(
                                      (averageRating - (star - 1)) * 100,
                                      0,
                                    ),
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

                              <div className="mt-4">
                                <p className="cart-muted line-through">
                                  ₹{cart.details?.oldPrice}
                                </p>
                                <p className="text-3xl font-bold text-green-600">
                                  ₹{cart.details?.price}
                                </p>

                                <span className="text-sm text-green-500">
                                  {cart.details?.percentage}% OFF
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="mt-4 flex items-center gap-3">
                            <button
                              onClick={() => decreaseQty(cart)}
                              className="cart-qty-minus w-9 h-9 rounded-lg"
                            >
                              -
                            </button>

                            <span className="text-lg font-semibold">
                              {cart.quantity}
                            </span>

                            <button
                              onClick={() => increaseQty(cart)}
                              className="cart-btn-primary w-9 h-9 rounded-lg"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-5">
                        <button
                          onClick={() => saveForLater(cart._id)}
                          className="cart-btn-secondary flex items-center gap-2 px-4 py-2 rounded-full"
                        >
                          <FaRegClock />
                          Save Later
                        </button>

                        <button className="cart-btn-secondary flex items-center gap-2 px-4 py-2 rounded-full">
                          <FaShareAlt />
                          Share
                        </button>

                        <button
                          onClick={() => deleteCart(cart._id)}
                          className="flex items-center gap-2 border border-red-500 text-red-500 px-4 py-2 rounded-full hover:bg-red-50"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </div>
                );
              })
            ) : (
              <div className="text-center py-10 cart-text">
                {" "}
                <p className="text-lg font-medium">No books in cart</p>
              </div>
            )}
          </div>

          {/* RIGHT SIDE */}

          <div className="lg:col-span-4">
            <div className="cart-summary rounded-2xl p-6 lg:sticky lg:top-24">
              {" "}
              <h2 className="cart-title text-2xl font-bold mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 cart-text">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span className="font-medium">{totalItems}</span>
                </div>

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>CGST</span>
                  <span className="text-green-600">₹{cgst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>SGST</span>
                  <span className="text-green-600">₹{sgst.toFixed(2)}</span>
                </div>

                <div className="border-t cart-divider pt-4 flex justify-between text-lg font-semibold">
                  <span>Total</span>

                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={checkout}
                className="cart-btn-primary w-full mt-6 py-3 rounded-xl font-semibold"
              >
                Proceed To Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CartList;
