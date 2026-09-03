import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaArrowRight, FaHeart } from "react-icons/fa";
import BASE_URL from "../../../../../config";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import { useCart } from "../../../../context/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookSection = () => {
  const [reviews, setReviews] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [totalRecommendedBooks, setTotalRecommendedBooks] = useState(0);
  const { getCartCount, getWishlistCount } = useCart();
  const navigate = useNavigate();
  const [wishlistedBooks, setWishlistedBooks] = useState([]);

  useEffect(() => {
    const fetchRecommendedBooks = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/user/home-recommended-books`,
        );

        if (response.data.success) {
          setFeaturedBooks(response.data.data);
          setTotalRecommendedBooks(response.data.total);
        }
      } catch (err) {
        console.error("Error fetching recommended books:", err);
      }
    };

    fetchRecommendedBooks();
  }, []);

  useEffect(() => {
    const checkWishlist = async () => {
      const token = localStorage.getItem("token");

      if (!token || featuredBooks.length === 0) {
        setWishlistedBooks([]);
        return;
      }

      try {
        const results = await Promise.all(
          featuredBooks.map(async (book) => {
            const res = await axios.get(
              `${BASE_URL}/user/check-wishlist/${book._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            return res.data.isWishlisted ? book._id : null;
          }),
        );

        setWishlistedBooks(results.filter(Boolean));
      } catch (err) {
        console.error("Wishlist check error:", err);
      }
    };

    checkWishlist();
  }, [featuredBooks]);

  const handleAddToCart = async (book) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/user/add-to-cart`,
        {
          bookId: book._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(res.data.message);
      await getCartCount();
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleWishlist = async (book) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    const isWishlisted = wishlistedBooks.includes(book._id);

    try {
      if (isWishlisted) {
        const res = await axios.put(
          `${BASE_URL}/user/clear-from-wishlist/${book._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setWishlistedBooks((prev) => prev.filter((id) => id !== book._id));

        toast.success(res.data.message || "Book removed from wishlist");
      } else {
        const res = await axios.post(
          `${BASE_URL}/user/add-to-wishlist`,
          {
            bookId: book._id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setWishlistedBooks((prev) => [...prev, book._id]);

        toast.success(res.data.message || "Book added to wishlist");
      }

      await getWishlistCount();
    } catch (err) {
      console.error("Wishlist error:", err);

      toast.error(err.response?.data?.message || "Wishlist update failed");
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      if (!featuredBooks.length) return;

      try {
        const token = localStorage.getItem("token");
        const reviewData = {};

        const bookIds = [...new Set(featuredBooks.map((book) => book._id))];

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
  }, [featuredBooks]);

  return (
    <section className="py-10 section-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="section-subtitle font-semibold">Recommended</p>

            <h2 className="text-3xl font-bold section-title">Featured Books</h2>
          </div>

          {totalRecommendedBooks > 4 && (
            <Link
              to="/book?recommended=true"
              className="hidden md:flex items-center gap-2 section-link font-semibold"
            >
              View All
              <FaArrowRight />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredBooks.map((book) => {
            const bookReviews = reviews[book._id] || [];

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
                className="card-theme rounded-2xl overflow-hidden group"
              >
                <Link to={`/book/${book._id}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={book.coverImageLink}
                      alt={book.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                    />

                    <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                      Recommended
                    </span>

                    {book.availableQuantity === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
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

                  <h3 className="mt-2 font-bold section-title line-clamp-1">
                    {book.title}
                  </h3>

                  <p className="book-muted text-sm mt-1">{book.author}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-orange-500">
                        ₹{book.price}
                      </span>

                      {book.oldPrice && (
                        <span className="book-light-muted text-sm line-through">
                          ₹{book.oldPrice}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        book.availableQuantity > 0
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {book.availableQuantity > 0
                        ? `${book.availableQuantity} Available`
                        : "Out of Stock"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    {book.availableQuantity > 0 ? (
                      <button
                        onClick={() => handleAddToCart(book)}
                        className="primary-btn flex-1 py-2.5 rounded-lg font-semibold transition"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 bg-gray-300 text-gray-500 py-2.5 rounded-lg font-semibold cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    )}

                    <button
                      onClick={() => handleWishlist(book)}
                      title={
                        wishlistedBooks.includes(book._id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      className={`wishlist-btn w-11 h-11 flex items-center justify-center rounded-lg border transition ${
                        wishlistedBooks.includes(book._id)
                          ? "border-red-500 bg-red-500 text-white"
                          : ""
                      }`}
                    >
                      <FaHeart className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default BookSection;
