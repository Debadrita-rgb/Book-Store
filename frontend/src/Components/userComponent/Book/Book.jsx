import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaTimes,
  FaStar,
  FaShoppingCart,
  FaBolt,
} from "react-icons/fa";
import axios from "axios";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import BASE_URL from "../../../../config";
import { useCart } from "../../../context/CartContext";
import "./singleBook.css";

const BookPreview = () => {
  const { id } = useParams();
  const [openVenueModal, setOpenVenueModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [galleryIsOpen, setGalleryIsOpen] = useState(false);
  const [galleryActiveIndex, setGalleryActiveIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);

  const openGalleryModal = (index) => {
    setGalleryActiveIndex(index);
    setGalleryIsOpen(true);
  };
  const {
    cartCount,
    setCartCount,
    wishlistCount,
    setWishlistCount,
    getCartCount,
    getWishlistCount,
  } = useCart();

  const next = () => {
    setGalleryActiveIndex((prev) => (prev + 1) % book.gallery.length);
  };

  const prev = () => {
    setGalleryActiveIndex((prev) =>
      prev === 0 ? book.gallery.length - 1 : prev - 1,
    );
  };

  const closeGalleryModal = () => setGalleryIsOpen(false);

  useEffect(() => {
    fetch(`${BASE_URL}/user/get-single-book/${id}`)
      .then((res) => res.json())
      .then((data) => setBook(data))
      .catch((err) => console.log(err));
  }, [id]);

  useEffect(() => {
    fetch(`${BASE_URL}/user/get-quantity-by-bookId/${id}`)
      .then((res) => res.json())
      .then((data) => setQuantity(data))
      .catch((err) => console.log(err));
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/user/get-review-by-bookId/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          setReviews(result.data);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("Review error:", err);
        setReviews([]);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  //Calculate average rating
  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        totalReviews
      : 0;

  const roundedRating = Math.round(averageRating);

  const ratingCount = {
    5: reviews.filter((review) => Number(review.rating) === 5).length,
    4: reviews.filter((review) => Number(review.rating) === 4).length,
    3: reviews.filter((review) => Number(review.rating) === 3).length,
    2: reviews.filter((review) => Number(review.rating) === 2).length,
    1: reviews.filter((review) => Number(review.rating) === 1).length,
  };

  const getRatingPercentage = (star) => {
    if (totalReviews === 0) return 0;

    return Math.round((ratingCount[star] / totalReviews) * 100);
  };

  const images = [
    book?.coverImageLink,
    ...(book?.gallery
      ?.filter((item) => item.isActive)
      .map((item) => item.imageUrl) || []),
  ].filter(Boolean);

  const settings = {
    dots: true,
    infinite: images.length > 1,
    autoplay: images.length > 1,
    autoplaySpeed: 5000,
    arrows: images.length > 1,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const limitWords = (text, wordLimit = 10) => {
    if (!text) return "";

    const words = text.split(" ");
    if (words.length <= wordLimit) return text;

    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const stripHTML = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
  };

  const limitText = (text, maxLength = 40) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !book?._id) return;

    axios
      .get(`${BASE_URL}/user/check-wishlist/${book._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setIsWishlisted(res.data.isWishlisted);
      })
      .catch(console.error);
  }, [book]);

  const handleWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      if (isWishlisted) {
        await axios.put(
          `${BASE_URL}/user/clear-from-wishlist/${book._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setIsWishlisted(false);
        await getWishlistCount();
      } else {
        await axios.post(
          `${BASE_URL}/user/add-to-wishlist`,
          { bookId: book._id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setIsWishlisted(true);
        await getWishlistCount();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

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
        subtotal: Number((subtotal || 0).toFixed(2)),
        cgst: Number((cgst || 0).toFixed(2)),
        sgst: Number((sgst || 0).toFixed(2)),
        grandTotal: Number((grandTotal || 0).toFixed(2)),
      },
    });
  };

  const handleAddToCart = async () => {
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
      navigate("/cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const RatingStars = ({ rating, size = "text-lg" }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${size} ${
              star <= Math.round(rating) ? "text-orange-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    const fetchRelatedBooks = async () => {
      try {
        const res = await fetch(`${BASE_URL}/user/related-books/${id}`);

        const result = await res.json();

        if (result.success) {
          setRelatedBooks(result.data || []);
        }
      } catch (error) {
        console.error("Related books error:", error);
      }
    };

    if (id) {
      fetchRelatedBooks();
    }
  }, [id]);

  const handleWriteReview = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to review this book.");
      navigate("/signin");
      return;
    }

    navigate(`/product-review/${id}`);
  };

  const getImageUrl = (image) => {
    if (!image) return "";

    return `${BASE_URL.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
  };

  return (
    <div className="min-h-screen overflow-x-hidden py-8">
      {/* BOOK DETAILS */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          Home <span className="mx-2">/</span>
          Books <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{book?.title}</span>
        </div>

        <div className=" rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* IMAGE GALLERY */}
            <div className="lg:col-span-5">
              <div className="flex gap-4">
                {/* Thumbnails */}
                <div
                  className={`w-20 flex flex-col gap-3 ${
                    images.length > 4
                      ? "max-h-[430px] overflow-y-auto pr-2"
                      : ""
                  }`}
                >
                  {images.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                        selectedImage === index
                          ? "border-orange-500"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${book?.title} ${index + 1}`}
                        className="w-16 h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Main Image */}
                <div className="flex-1 bg-gray-50 rounded-xl p-4 flex items-center justify-center">
                  {images[selectedImage] && (
                    <InnerImageZoom
                      src={images[selectedImage]}
                      zoomSrc={images[selectedImage]}
                      zoomType="hover"
                      hideHint
                    />
                  )}
                </div>
              </div>
            </div>

            {/* BOOK INFORMATION */}
            <div className="lg:col-span-7">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-sm text-orange-500 font-semibold mb-2">
                    {book?.category?.[0]}
                  </p>

                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    {book?.title}
                  </h1>

                  <p className="text-gray-500 mt-2">
                    by{" "}
                    <span className="font-medium text-gray-700">
                      {book?.author}
                    </span>
                  </p>
                </div>

                {/* Wishlist */}
                <button
                  onClick={handleWishlist}
                  className={`flex-shrink-0 w-11 h-11 rounded-full border flex items-center justify-center transition ${
                    isWishlisted
                      ? "bg-red-50 border-red-500 text-red-500"
                      : "border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-500"
                  }`}
                >
                  <FaHeart />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-5">
                <div className="flex items-center gap-1 text-yellow-500">
                  <FaStar />

                  <span className="font-semibold text-gray-900">
                    {averageRating.toFixed(1)}
                  </span>
                </div>

                <span className="text-gray-400">•</span>

                <span className="text-gray-500">
                  {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mt-6">
                <span className="text-3xl font-bold text-orange-500">
                  ₹{book?.price}
                </span>

                {book?.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ₹{book.oldPrice}
                  </span>
                )}

                {book?.percentage > 0 && (
                  <span className="px-2.5 py-1 rounded-md bg-green-100 text-green-700 text-sm font-semibold">
                    {book.percentage}% OFF
                  </span>
                )}
              </div>

              {/* Availability */}
              <div className="mt-4">
                {quantity?.available_quantity > 0 ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    {quantity.available_quantity} available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              <hr className="my-7" />

              {/* Book information */}
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-gray-400">Publisher</p>
                  <p className="font-medium text-gray-800 mt-1">
                    {book?.publisher || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">Published</p>
                  <p className="font-medium text-gray-800 mt-1">
                    {book?.publishedYear || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">Language</p>
                  <p className="font-medium text-gray-800 mt-1">
                    {book?.language?.join(", ") || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">Pages</p>
                  <p className="font-medium text-gray-800 mt-1">
                    {book?.pages || "—"}
                  </p>
                </div>
              </div>

              {/* Categories */}
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-2">Categories</p>

                <div className="flex flex-wrap gap-2">
                  {book?.category?.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              {quantity?.available_quantity > 0 && (
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-500 py-3 rounded-xl font-semibold hover:bg-orange-50 transition"
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
                  >
                    <FaBolt />
                    Buy Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 pb-10 mt-3">
        <div className=" rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="border-b pb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              About this book
            </h2>
          </div>

          {/* Short Description */}
          {book?.shortDescription && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Overview
              </h3>

              <div
                className="prose prose-sm max-w-none text-gray-700 leading-7"
                dangerouslySetInnerHTML={{
                  __html: book?.shortDescription || "",
                }}
              />
            </div>
          )}

          {/* Long Description */}
          {book?.longDescription && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h3>

              <div
                className="prose prose-gray max-w-none text-gray-600 leading-8"
                dangerouslySetInnerHTML={{
                  __html: book.longDescription,
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 pb-10 mt-3">
        <div className=" rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews
          </h2>

          {reviews.length === 0 ? (
            <div className="border rounded-xl p-8 text-center">
              <p className="text-gray-500">
                No reviews yet. Be the first to review this book.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT RATING */}
              <div className="lg:col-span-4 border-r border-gray-200 pr-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Customer ratings
                </h3>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-4xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                  </span>

                  <div>
                    <RatingStars rating={averageRating} size="text-lg" />

                    <p className="text-sm text-gray-500 mt-1">
                      {totalReviews} {totalReviews === 1 ? "rating" : "ratings"}
                    </p>
                  </div>
                </div>
                {/* Rating distribution */}
                <div className="mt-6 space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-12 text-gray-600">{star} star</span>

                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{
                            width: `${getRatingPercentage(star)}%`,
                          }}
                        />
                      </div>

                      <span className="w-10 text-right text-gray-500">
                        {getRatingPercentage(star)}%
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleWriteReview}
                  className="w-full mt-6 border border-gray-900 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition"
                >
                  Write a product review
                </button>{" "}
              </div>

              {/* RIGHT REVIEWS */}
              <div className="lg:col-span-8">
                <div
                  className={`review-scroll ${
                    reviews.length > 3
                      ? "max-h-[600px] overflow-y-scroll pr-3"
                      : ""
                  }`}
                >
                  <div className="space-y-5">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="border-b border-gray-200 pb-5"
                      >
                        {/* User */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                            {review.userId?.name?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.userId?.name || "Anonymous"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-3 mt-3">
                          <RatingStars rating={review.rating} size="text-sm" />

                          {review.title && (
                            <span className="font-semibold text-gray-900">
                              {review.title}
                            </span>
                          )}
                        </div>

                        {/* Review */}
                        <p className="text-gray-600 mt-2 leading-7">
                          {review.review}
                        </p>

                        {/* Review images */}
                        {review.images?.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-4">
                            {review.images.map((image, index) => (
                              <img
                                key={index}
                                src={getImageUrl(image)}
                                alt="Review"
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  console.log(
                                    "Image failed:",
                                    e.currentTarget.src,
                                  );
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* RELATED BOOKS */}
      {relatedBooks.length > 0 && (
        <section className="mt-10 border-t border-gray-200 pt-8 pb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Related Books
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Books you may also like
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {relatedBooks.map((relatedBook) => (
              <div
                key={relatedBook._id}
                onClick={() => navigate(`/book/${relatedBook._id}`)}
                className="group  rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition"
              >
                <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={relatedBook.coverImageLink}
                    alt={relatedBook.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {relatedBook.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {relatedBook.author}
                  </p>

                  <p className="text-lg font-bold text-green-700 mt-2">
                    ₹ {relatedBook.price}
                  </p>

                  {relatedBook.oldPrice &&
                    relatedBook.oldPrice > relatedBook.price && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 line-through">
                          ₹ {relatedBook.oldPrice}
                        </span>

                        <span className="text-xs text-orange-500 font-semibold">
                          {relatedBook.percentage}% off
                        </span>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BookPreview;
