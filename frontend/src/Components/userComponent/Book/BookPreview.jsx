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
  
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [reviewImageStart, setReviewImageStart] = useState(0);

  //for review image modal
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedReviewImageIndex, setSelectedReviewImageIndex] = useState(0);
  const [isReviewImageModalOpen, setIsReviewImageModalOpen] = useState(false);

  const review_image_per_page = 8;

  const nextReviewImages = (totalImages) => {
    setReviewImageStart((prev) =>
      Math.min(
        prev + review_image_per_page,
        totalImages - review_image_per_page,
      ),
    );
  };

  const previousReviewImages = () => {
    setReviewImageStart((prev) => Math.max(prev - review_image_per_page, 0));
  };

  const {
    getCartCount,
    getWishlistCount,
  } = useCart();

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

  const RatingStars = ({ rating, size = 18 }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.min(Math.max((rating - (star - 1)) * 100, 0), 100);

          return (
            <span
              key={star}
              className="relative inline-block"
              style={{ width: size, height: size }}
            >
              {/* Empty Star */}
              <FaStar
                size={size}
                className="absolute top-0 left-0 text-gray-300"
              />

              {/* Filled Star */}
              <span
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: `${fill}%`, height: size }}
              >
                <FaStar size={size} className="text-orange-500" />
              </span>
            </span>
          );
        })}
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

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${BASE_URL}${image}`;
  };

  //Modal view after clicking review image
  const openReviewImage = (review, imageIndex) => {
    setSelectedReview(review);
    setSelectedReviewImageIndex(imageIndex);
    setIsReviewImageModalOpen(true);
  };

  const closeReviewImageModal = () => {
    setIsReviewImageModalOpen(false);
    setSelectedReview(null);
    setSelectedReviewImageIndex(0);
  };

  const nextReviewModalImage = () => {
    if (!selectedReview?.images?.length) return;

    setSelectedReviewImageIndex((prev) => {
      return (prev + 1) % selectedReview.images.length;
    });
  };

  const previousReviewModalImage = () => {
    if (!selectedReview?.images?.length) return;

    setSelectedReviewImageIndex((prev) => {
      return (
        (prev - 1 + selectedReview.images.length) % selectedReview.images.length
      );
    });
  };

  return (
    <div className="book-details-page overflow-x-hidden py-8">
      {" "}
      {/* BOOK DETAILS */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="book-text text-sm mb-6">
          {" "}
          Home <span className="mx-2">/</span>
          Books <span className="mx-2">/</span>
          <span className="book-title font-medium">{book?.title}</span>
        </div>

        <div className="book-details-card rounded-2xl p-5 md:p-8">
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
                <div className="book-image-bg flex-1 rounded-xl p-4 flex items-center justify-center">
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

                  <h1 className="book-title text-3xl md:text-4xl font-bold leading-tight">
                    {book?.title}
                  </h1>

                  <p className="book-text mt-2">
                    by{" "}
                    <span className="book-title font-medium">
                      {book?.author}
                    </span>
                  </p>
                </div>

                {/* Wishlist */}
                <button
                  onClick={handleWishlist}
                  className={`flex-shrink-0 w-11 h-11 rounded-full border flex items-center justify-center transition ${
                    isWishlisted
                      ? "book-out-stock border-red-500 text-red-500"
                      : "book-input-border book-text hover:border-red-400 hover:text-red-500"
                  }`}
                >
                  <FaHeart />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-5 flex-wrap">
                <RatingStars rating={averageRating} size={18} />

                <span className="book-title font-semibold">
                  {averageRating.toFixed(1)}
                </span>

                <span className="book-info-label">•</span>

                <span className="book-text">
                  {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mt-6">
                <span className="text-3xl font-bold text-orange-500">
                  ₹{book?.price}
                </span>

                {book?.oldPrice && (
                  <span className="text-lg book-info-label line-through">
                    ₹{book.oldPrice}
                  </span>
                )}

                {book?.percentage > 0 && (
                  <span className="px-2.5 py-1 rounded-md book-stock text-sm font-semibold">
                    {book.percentage}% OFF
                  </span>
                )}
              </div>

              {/* Availability */}
              <div className="mt-4">
                {quantity?.available_quantity > 0 ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600 book-stock px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    {quantity.available_quantity} available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 book-out-stock px-3 py-1.5 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              <hr className="book-divider my-7" />

              {/* Book information */}
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="book-info-label">Publisher</p>
                  <p className="font-medium book-info-value mt-1">
                    {book?.publisher || "—"}
                  </p>
                </div>

                <div>
                  <p className="book-info-label">Published</p>
                  <p className="font-medium book-info-value mt-1">
                    {book?.publishedYear || "—"}
                  </p>
                </div>

                <div>
                  <p className="book-info-label">Language</p>
                  <p className="font-medium book-info-value mt-1">
                    {book?.language?.join(", ") || "—"}
                  </p>
                </div>

                <div>
                  <p className="book-info-label">Pages</p>
                  <p className="font-medium book-info-value mt-1">
                    {book?.pages || "—"}
                  </p>
                </div>
              </div>

              {/* Categories */}
              <div className="mt-6">
                <p className="text-sm book-info-label mb-2">Categories</p>

                <div className="flex flex-wrap gap-2">
                  {book?.category?.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 rounded-full book-tag text-xs font-medium"
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
                    className="flex-1 flex items-center justify-center gap-2  py-3 rounded-xl font-semibold transition book-btn-outline"
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold transition book-btn-primary"
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
        <div className="book-details-card rounded-2xl p-6 md:p-8">
          <div className="border-b pb-5">
            <h2 className="text-2xl font-bold book-title">About this book</h2>
          </div>

          {/* Short Description */}
          {book?.shortDescription && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold book-title mb-3">
                Overview
              </h3>

              <div
                className="prose prose-sm max-w-none book-text leading-7"
                dangerouslySetInnerHTML={{
                  __html: book?.shortDescription || "",
                }}
              />
            </div>
          )}

          {/* Long Description */}
          {book?.longDescription && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold book-title mb-3">
                Description
              </h3>

              <div
                className="prose prose-gray max-w-none book-text leading-8"
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
        <div className="book-details-card rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold book-title mb-6">
            Customer Reviews
          </h2>

          {reviews.length === 0 ? (
            <div className="book-review-box rounded-xl p-8 text-center">
              <p className="text-gray-500">
                No reviews yet. Be the first to review this book.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT RATING */}
              <div className="lg:col-span-4 border-r border-gray-200 pr-6">
                <h3 className="text-xl font-semibold book-title">
                  Customer ratings
                </h3>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-4xl font-bold book-title">
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
                      <span className="w-12 book-text">{star} star</span>

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
                  className="w-full mt-6 border border-gray-900 book-title py-3 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition"
                >
                  Write a product review
                </button>{" "}
              </div>

              {/* RIGHT REVIEWS */}
              <div className="lg:col-span-8">
                <div
                  className={`review-scroll ${
                    reviews.length > 3
                      ? "max-h-[500px] overflow-y-scroll pr-3"
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
                          <div className="book-avatar w-10 h-10 rounded-full flex items-center justify-center font-bold">
                            {review.userId?.name?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </div>

                          <div>
                            <p className="book-title font-semibold">
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
                        <div className="flex items-center gap-2 mt-3">
                          <RatingStars rating={review.rating} size={14} />

                          {review.title && (
                            <span className="book-title font-semibold">
                              {review.title}
                            </span>
                          )}
                        </div>

                        {/* Review */}
                        <p className="book-text mt-2 leading-7">
                          {review.review}
                        </p>

                        {/* Review images */}
                        {review.images?.length > 0 && (
                          <div className="mt-4 relative w-full overflow-hidden">
                            <div className="flex items-center gap-3">
                              {/* Previous Button */}
                              {review.images.length > review_image_per_page && (
                                <button
                                  type="button"
                                  onClick={() => previousReviewImages()}
                                  disabled={reviewImageStart === 0}
                                  className={`flex-shrink-0 w-9 h-9 rounded-full border flex items-center justify-center
            ${
              reviewImageStart === 0
                ? "text-gray-300 border-gray-200 cursor-not-allowed"
                : "book-text border-gray-300 hover:bg-gray-100"
            }`}
                                >
                                  ←
                                </button>
                              )}

                              {/* Images */}
                              <div className="flex gap-3 overflow-hidden min-w-0">
                                {review.images
                                  .slice(
                                    reviewImageStart,
                                    reviewImageStart + review_image_per_page,
                                  )
                                  .map((image, index) => (
                                    <img
                                      key={index}
                                      src={getImageUrl(image)}
                                      alt={`Review ${index + 1}`}
                                      onClick={() =>
                                        openReviewImage(review, index)
                                      }
                                      className="w-24 h-28 flex-shrink-0 object-cover rounded-lg border border-gray-200"
                                      onError={(e) => {
                                        console.log(
                                          "Image failed:",
                                          e.currentTarget.src,
                                        );
                                      }}
                                    />
                                  ))}
                              </div>

                              {/* Next Button */}
                              {review.images.length > review_image_per_page && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    nextReviewImages(review.images.length)
                                  }
                                  disabled={
                                    reviewImageStart + review_image_per_page >=
                                    review.images.length
                                  }
                                  className={`flex-shrink-0 w-9 h-9 rounded-full border flex items-center justify-center
            ${
              reviewImageStart + review_image_per_page >= review.images.length
                ? "text-gray-300 border-gray-200 cursor-not-allowed"
                : "book-text border-gray-300 hover:bg-gray-100"
            }`}
                                >
                                  →
                                </button>
                              )}
                            </div>
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
        <section className="mt-10 border-t border-gray-200 p-6 sm:p-8">
          {" "}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold book-title">Related Books</h2>

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
                <div className="aspect-[3/4] overflow-hidden book-related-image">
                  <img
                    src={relatedBook.coverImageLink}
                    alt={relatedBook.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="p-3">
                  <h3 className="font-semibold book-title line-clamp-2">
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
                        <span className="text-xs book-info-label line-through">
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
      {/* Modal open after clicking review image  */}
      {isReviewImageModalOpen && selectedReview && (
        <div
          className="
      fixed inset-0 z-[9999]
      bg-black/70 backdrop-blur-sm
      flex items-center justify-center
      p-0 sm:p-3 md:p-5
    "
          onClick={closeReviewImageModal}
        >
          <div
            className="
        relative
        
        w-full
        max-w-7xl

        h-full
        sm:h-[94dvh]
        md:h-[92dvh]
        lg:h-[90dvh]

        rounded-none
        sm:rounded-2xl

        shadow-2xl
        overflow-hidden

        flex flex-col
      "
            onClick={(e) => e.stopPropagation()}
          >
            {/*  HEADER  */}
            <div
              className="
          flex-shrink-0
          h-14 sm:h-16
          border-b border-gray-200
          
          flex items-center justify-between
          px-3 sm:px-5 md:px-6
        "
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Back */}
                <button
                  type="button"
                  onClick={closeReviewImageModal}
                  className="w-9 h-9 rounded-full
                       flex items-center justify-center
                       book-text
                       hover:bg-gray-100
                       hover:book-title
                       transition"
                >
                  ←
                </button>

                <div className="min-w-0">
                  <h2
                    className="
                font-semibold
                text-sm sm:text-base md:text-lg
                book-title
                truncate
              "
                  >
                    Customer photos and videos
                  </h2>

                  <p className="text-[10px] sm:text-xs text-gray-500">
                    {selectedReview.images.length} photos
                  </p>
                </div>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={closeReviewImageModal}
                className="
            w-8 h-8
            sm:w-9 sm:h-9
            rounded-full
            flex items-center justify-center
            text-xl sm:text-2xl
            text-gray-500
            hover:bg-gray-100
            hover:book-title
            transition
            flex-shrink-0
          "
              >
                ×
              </button>
            </div>

            {/*  CONTENT  */}
            <div
              className="
          flex-1
          min-h-0
          overflow-y-auto
          overflow-x-hidden
        "
            >
              <div
                className="
            grid
            grid-cols-1
            lg:grid-cols-12
          "
              >
                {/* LEFT IMAGE SECTION */}

                <div
                  className="
              lg:col-span-7
              bg-gray-50

              p-3
              sm:p-4
              md:p-5
              lg:p-7
            "
                >
                  {/* IMAGE CONTAINER */}

                  <div
                    className="
                relative
                w-full

                h-[42vh]
                min-h-[250px]
                max-h-[520px]

                sm:h-[48vh]
                sm:min-h-[300px]

                md:h-[52vh]
                md:min-h-[350px]

                lg:h-[62vh]
                lg:min-h-[400px]

                flex
                items-center
                justify-center

                overflow-hidden
                rounded-xl
                bg-gray-100
              "
                  >
                    {/* IMAGE */}

                    <img
                      src={getImageUrl(
                        selectedReview.images[selectedReviewImageIndex],
                      )}
                      alt={`Customer review ${selectedReviewImageIndex + 1}`}
                      className="
                  max-w-full
                  max-h-full
                  w-auto
                  h-auto
                  object-contain
                  rounded-lg
                  select-none
                "
                    />

                    {/* COUNTER */}

                    <div
                      className="
                  absolute
                  top-2
                  sm:top-3
                  left-1/2
                  -translate-x-1/2

                  bg-black/70
                  text-white

                  px-2.5
                  sm:px-3
                  py-1

                  rounded-full

                  text-[10px]
                  sm:text-xs

                  whitespace-nowrap
                "
                    >
                      {selectedReviewImageIndex + 1} /{" "}
                      {selectedReview.images.length}
                    </div>

                    {/* PREVIOUS */}

                    {selectedReview.images.length > 1 && (
                      <button
                        type="button"
                        onClick={previousReviewModalImage}
                        className="
                    absolute
                    left-2
                    sm:left-4
                    md:left-5

                    top-1/2
                    -translate-y-1/2

                    w-9 h-9
                    sm:w-11 sm:h-11
                    md:w-12 md:h-12

                    rounded-full

                    /95
                    shadow-lg

                    border
                    border-gray-200

                    flex
                    items-center
                    justify-center

                    text-2xl
                    sm:text-3xl

                    book-info-value

                    hover:bg-gray-900
                    hover:text-white

                    transition
                  "
                      >
                        ‹
                      </button>
                    )}

                    {/* NEXT */}

                    {selectedReview.images.length > 1 && (
                      <button
                        type="button"
                        onClick={nextReviewModalImage}
                        className="
                    absolute
                    right-2
                    sm:right-4
                    md:right-5

                    top-1/2
                    -translate-y-1/2

                    w-9 h-9
                    sm:w-11 sm:h-11
                    md:w-12 md:h-12

                    rounded-full

                    /95
                    shadow-lg

                    border
                    border-gray-200

                    flex
                    items-center
                    justify-center

                    text-2xl
                    sm:text-3xl

                    book-info-value

                    hover:bg-gray-900
                    hover:text-white

                    transition
                  "
                      >
                        ›
                      </button>
                    )}
                  </div>

                  {/* THUMBNAILS */}

                  <div className="mt-3 sm:mt-4 md:mt-5">
                    <div
                      className="
                  flex
                  gap-2
                  sm:gap-3

                  overflow-x-auto
                  overflow-y-hidden

                  pb-2

                  scrollbar-thin
                "
                    >
                      {selectedReview.images.map((image, index) => (
                        <button
                          type="button"
                          key={index}
                          onClick={() => setSelectedReviewImageIndex(index)}
                          className={`
                      flex-shrink-0
                      overflow-hidden
                      rounded-lg

                      border-2

                      transition-all

                      ${
                        selectedReviewImageIndex === index
                          ? "border-gray-900 shadow-md scale-[1.02]"
                          : "border-transparent hover:border-gray-300"
                      }
                    `}
                        >
                          <img
                            src={getImageUrl(image)}
                            alt={`Thumbnail ${index + 1}`}
                            className="
                        w-14 h-14
                        sm:w-16 sm:h-16
                        md:w-20 md:h-20

                        object-cover
                      "
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT REVIEW DETAILS */}

                <div
                  className="
              lg:col-span-5
              border-t
              lg:border-t-0
              lg:border-l
              border-gray-200
            "
                >
                  <div
                    className="
                p-4
                sm:p-5
                md:p-6
                lg:p-8
              "
                  >
                    {/* USER */}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="
                      w-9 h-9
                      sm:w-10 sm:h-10
                      md:w-11 md:h-11

                      flex-shrink-0

                      rounded-full
                      bg-orange-100

                      flex
                      items-center
                      justify-center

                      text-orange-600
                      font-bold
                    "
                        >
                          {selectedReview.userId?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0">
                          <p
                            className="
                        font-semibold
                        book-title
                        text-sm
                        sm:text-base
                        truncate
                      "
                          >
                            {selectedReview.userId?.name || "Anonymous"}
                          </p>

                          <p className="text-[11px] sm:text-xs text-gray-500">
                            {new Date(
                              selectedReview.createdAt,
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* VERIFIED */}

                      {selectedReview.orderId && (
                        <span
                          className="
                      flex-shrink-0

                      text-[10px]
                      sm:text-xs

                      font-semibold

                      text-green-700
                      bg-green-50

                      border
                      border-green-200

                      px-2
                      sm:px-3

                      py-1

                      rounded-full
                    "
                        >
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    {/* DIVIDER */}

                    <div className="border-b border-gray-200 my-4 sm:my-5 md:my-6" />

                    {/* RATING */}

                    <div
                      className="
                  flex
                  items-center
                  gap-2
                  sm:gap-3
                "
                    >
                      <RatingStars
                        rating={selectedReview.rating}
                        size="text-base sm:text-lg"
                      />

                      <span className="text-sm font-semibold book-text">
                        {selectedReview.rating}.0
                      </span>
                    </div>

                    {/* TITLE */}

                    {selectedReview.title && (
                      <h3
                        className="
                    text-base
                    sm:text-lg
                    md:text-xl

                    font-bold
                    book-title

                    mt-3
                    sm:mt-4
                  "
                      >
                        {selectedReview.title}
                      </h3>
                    )}

                    {/* REVIEW */}

                    <p
                      className="
                  book-text

                  text-sm
                  sm:text-sm
                  md:text-base

                  leading-6
                  sm:leading-7

                  mt-2
                  sm:mt-3
                "
                    >
                      {selectedReview.review}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookPreview;
