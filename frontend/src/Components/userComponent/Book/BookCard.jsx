import React, { useMemo, useState, useEffect } from "react";
import { FaHeart, FaTimes, FaStar } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useCart } from "../../../context/CartContext";

const BookCard = ({ book, viewMode }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { getCartCount, getWishlistCount } = useCart();
  const [reviews, setReviews] = useState([]);

  const galleryImages = [
    book.coverImageLink,
    ...(book.gallery?.map((g) => (typeof g === "string" ? g : g.imageUrl)) ||
      []),
  ].filter(Boolean);

  const displayImages = galleryImages;

  const openModal = () => {
    setIsModalOpen(true);
  };

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
        toast.info("Removed from your wishlist");
      } else {
        await axios.post(
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

        setIsWishlisted(true);
        toast.success("❤️ Added to your wishlist!");
      }

      await getWishlistCount();
    } catch (err) {
      console.error("Wishlist error:", err);

      toast.error(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
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

  const stripHTML = (html) => {
    if (!html) return "";

    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  };

  const limitWords = (text, wordLimit = 10) => {
    if (!text) return "";

    const cleanText = stripHTML(text);

    const words = cleanText.trim().split(/\s+/);

    if (words.length <= wordLimit) {
      return cleanText;
    }

    return words.slice(0, wordLimit).join(" ") + "...";
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${BASE_URL}/user/get-review-by-bookId/${book?._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

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

    if (book?._id) {
      fetchReviews();
    }
  }, [book?._id]);

  //Calculate average rating
  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        totalReviews
      : 0;

  const renderStars = (rating, size = 16) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPercentage = Math.min(
            Math.max((rating - (star - 1)) * 100, 0),
            100,
          );

          return (
            <span
              key={star}
              className="relative inline-block"
              style={{
                width: size,
                height: size,
              }}
            >
              {/* Empty Star */}
              <FaStar
                size={size}
                className="absolute top-0 left-0 text-gray-300"
              />

              {/* Filled Portion */}
              <span
                className="absolute top-0 left-0 overflow-hidden"
                style={{
                  width: `${fillPercentage}%`,
                  height: size,
                }}
              >
                <FaStar size={size} className="text-yellow-500" />
              </span>
            </span>
          );
        })}
      </div>
    );
  };
  return (
    <>
      {viewMode === "list" ? (
        <div
          className="book-card-list rounded-2xl p-6 flex flex-col lg:flex-row gap-8 items-start transition-colors duration-300"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--card-shadow)",
            color: "var(--text-primary)",
          }}
        >
          {/* LEFT IMAGE */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={galleryImages.length > 1}
              pagination={{ clickable: true }}
              className="rounded-xl overflow-hidden"
            >
              {galleryImages.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={img}
                    alt={book.title}
                    className="w-full h-80 object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* RIGHT DETAILS */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* CATEGORY */}
              <p
                className="font-semibold uppercase"
                style={{ color: "var(--accent)" }}
              >
                {Array.isArray(book.category)
                  ? book.category.join(" • ")
                  : book.category}
              </p>

              {/* TITLE */}
              <h2
                className="text-3xl font-bold mt-2"
                style={{ color: "var(--text-primary)" }}
              >
                {book.title}
              </h2>

              {/* AUTHOR */}
              <p
                className="text-lg mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {book.author}
              </p>

              {/* RATING */}
              <div className="flex items-center gap-3 mt-5">
                <div className="flex items-center gap-2 mt-5">
                  {renderStars(averageRating, 16)}

                  <span
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {averageRating.toFixed(1)}
                  </span>

                  <span style={{ color: "var(--text-secondary)" }}>
                    ({totalReviews} {totalReviews === 1 ? "Review" : "Reviews"})
                  </span>
                </div>

                <span style={{ color: "var(--text-muted)" }}>•</span>

                <span style={{ color: "var(--text-secondary)" }}>
                  {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
                </span>
              </div>

              {/* PRICE */}
              <div className="mt-4">
                <p
                  className="line-through text-lg"
                  style={{ color: "var(--text-muted)" }}
                >
                  ₹{book.oldPrice || 0}
                </p>

                <p
                  className="text-xl font-bold"
                  style={{ color: "var(--success)" }}
                >
                  ₹{book.price}
                </p>

                <p
                  className="font-semibold text-lg mt-1"
                  style={{ color: "var(--success)" }}
                >
                  {book.percentage}% OFF
                </p>
              </div>

              {/* DESCRIPTION */}
              <p
                className="mt-3 leading-7 line-clamp-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {limitWords(book.shortDescription, 40)}
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 mt-8 flex-wrap">
              {/* View Details */}
              <Button
                variant="contained"
                onClick={openModal}
                sx={{
                  bgcolor: "var(--accent)",
                  color: "#fff",
                  borderRadius: "999px",
                  px: 4,

                  "&:hover": {
                    bgcolor: "var(--accent-hover)",
                  },
                }}
              >
                View Details
              </Button>

              {/* Add To Cart */}
              <Button
                variant="outlined"
                onClick={handleAddToCart}
                sx={{
                  borderRadius: "999px",
                  px: 4,

                  color: "var(--text-primary)",
                  borderColor: "var(--border-color)",

                  "&:hover": {
                    borderColor: "var(--accent)",
                    backgroundColor: "var(--bg-secondary)",
                  },
                }}
              >
                Add To Cart
              </Button>

              {/* Wishlist */}
              <IconButton
                aria-label="favorite"
                onClick={handleWishlist}
                sx={{
                  border: "1px solid var(--border-color)",

                  color: isWishlisted ? "#ef4444" : "var(--text-muted)",

                  transition: "all 0.3s",

                  "&:hover": {
                    color: "#ef4444",
                    transform: "scale(1.1)",
                    backgroundColor: "var(--bg-secondary)",
                  },
                }}
              >
                <FaHeart />
              </IconButton>
            </div>
          </div>
        </div>
      ) : (
        <Card
          className="book-card"
          sx={{
            borderRadius: "24px",
            overflow: "hidden",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "var(--bg-card)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 30px rgba(0,0,0,.08)",
            transition: "all .35s ease",

            "&:hover": {
              transform: "translateY(-10px) scale(1.01)",
              boxShadow: "0 20px 50px rgba(0,0,0,.18)",
              borderColor: "var(--accent)",
            },
          }}
        >
          {/*  IMAGE SECTION  */}
          <Box
            sx={{
              position: "relative",
              p: 1.5,
              pb: 0,
            }}
          >
            {/* Discount Badge */}
            {book.percentage > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 25,
                  left: 25,
                  zIndex: 10,

                  backgroundColor: "var(--accent)",
                  color: "#fff",

                  px: 1.5,
                  py: 0.6,

                  borderRadius: "999px",

                  fontSize: "12px",
                  fontWeight: 700,

                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {book.percentage}% OFF
              </Box>
            )}

            {/* Wishlist */}
            <IconButton
              aria-label="favorite"
              onClick={handleWishlist}
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 10,

                width: 40,
                height: 40,

                backgroundColor: "var(--bg-card)",

                border: "1px solid var(--border-color)",

                color: isWishlisted ? "#ef4444" : "var(--text-muted)",

                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",

                transition: "all 0.25s ease",

                "&:hover": {
                  backgroundColor: "var(--bg-card)",
                  color: "#ef4444",
                  transform: "scale(1.08)",
                },
              }}
            >
              <FaHeart size={16} />
            </IconButton>

            {/* Book Images */}
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation={galleryImages.length > 1}
              pagination={{
                clickable: true,
              }}
              autoplay={
                galleryImages.length > 1
                  ? {
                      delay: 3500,
                      disableOnInteraction: false,
                    }
                  : false
              }
              loop={galleryImages.length > 1}
              style={{
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {galleryImages.map((img, index) => (
                <SwiperSlide key={index}>
                  <Box
                    sx={{
                      height: 290,
                      backgroundColor: "var(--bg-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      borderRadius: "16px",
                    }}
                  >
                    <img
                      src={img}
                      alt={`${book.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>

          {/*  BOOK CONTENT  */}
          <CardContent
            sx={{
              flexGrow: 1,
              px: 2.5,
              pt: 2.5,
              pb: 1.5,
            }}
          >
            {/* Category */}
            <Typography
              variant="caption"
              sx={{
                color: "var(--accent)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                fontSize: "11px",
              }}
            >
              {Array.isArray(book.category)
                ? book.category.join(" • ")
                : book.category || "Classic"}
            </Typography>

            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 750,
                mt: 0.7,
                lineHeight: 1.3,

                color: "var(--text-primary)",

                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",

                minHeight: "50px",
              }}
            >
              {book.title}
            </Typography>

            {/* Author */}
            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: "var(--text-secondary)",
                fontSize: "14px",
              }}
            >
              by{" "}
              <span
                style={{
                  color: "var(--text-primary)",
                  fontWeight: 600,
                }}
              >
                {book.author}
              </span>
            </Typography>

            {/* Rating */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1.5,
                flexWrap: "wrap",
              }}
            >
              {renderStars(averageRating, 14)}

              <Typography
                component="span"
                sx={{
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {averageRating.toFixed(1)}
              </Typography>

              <Typography
                component="span"
                sx={{
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                }}
              >
                ({totalReviews} {totalReviews === 1 ? "Review" : "Reviews"})
              </Typography>
            </Box>

            {/*  PRICE  */}
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 1.2,
                mt: 1.8,
                flexWrap: "wrap",
              }}
            >
              {/* Selling Price */}
              <Typography
                sx={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                }}
              >
                ₹{book.price}
              </Typography>

              {/* Old Price */}
              {book.oldPrice && book.oldPrice > book.price && (
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    textDecoration: "line-through",
                  }}
                >
                  ₹{book.oldPrice}
                </Typography>
              )}
            </Box>

            {/* Stock */}
            <Box
              sx={{
                mt: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.7,

                  px: 1.2,
                  py: 0.5,

                  borderRadius: "999px",

                  backgroundColor:
                    book.available_quantity > 0
                      ? "rgba(22, 163, 74, 0.10)"
                      : "rgba(239, 68, 68, 0.10)",

                  color: book.available_quantity > 0 ? "#16a34a" : "#ef4444",

                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor:
                      book.available_quantity > 0 ? "#16a34a" : "#ef4444",
                  }}
                />

                {book.available_quantity > 0
                  ? `${book.available_quantity} in stock`
                  : "Out of Stock"}
              </Box>
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                mt: 1.5,

                color: "var(--text-secondary)",

                lineHeight: 1.6,

                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",

                minHeight: "45px",
              }}
            >
              {limitWords(book.shortDescription, 20)}
            </Typography>
          </CardContent>

          {/*  ACTIONS  */}
          <CardActions
            sx={{
              px: 2.5,
              pb: 2.5,
              pt: 0,

              display: "flex",
              gap: 1.5,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={openModal}
              sx={{
                minHeight: 42,

                bgcolor: "var(--accent)",
                color: "#fff",

                borderRadius: "999px",

                fontWeight: 700,
                textTransform: "none",

                boxShadow: "none",

                "&:hover": {
                  bgcolor: "var(--accent-hover)",
                  boxShadow: "none",
                },
              }}
            >
              View Details
            </Button>

            <IconButton
              aria-label="favorite"
              onClick={handleWishlist}
              sx={{
                width: 42,
                height: 42,
                flexShrink: 0,

                border: "1px solid var(--border-color)",

                color: isWishlisted ? "#ef4444" : "var(--text-muted)",

                transition: "all 0.25s ease",

                "&:hover": {
                  color: "#ef4444",
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "#ef4444",
                },
              }}
            >
              <FaHeart size={17} />
            </IconButton>
          </CardActions>
        </Card>
      )}

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3, md: 4 },
            overflow: "hidden",

            bgcolor: "var(--bg-card)",
            color: "var(--text-primary)",

            border: "1px solid var(--border-color)",
            boxShadow: "var(--section-shadow)",

            p: { xs: 0, sm: 1, md: 2 },
            m: { xs: 0, sm: 2 },

            width: {
              xs: "100%",
              sm: "calc(100% - 32px)",
              md: "100%",
            },

            maxHeight: { xs: "100vh", sm: "90vh" },

            transition: "all var(--theme-transition)",
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
            pb: 1.5,
            px: { xs: 2, sm: 3 },
            bgcolor: "var(--bg-card)",
            color: "var(--text-primary)",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              className="section-title"
              sx={{
                fontWeight: 700,
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {book.title}
            </Typography>

            <Typography
              variant="body2"
              className="section-text"
              sx={{ mt: 0.5 }}
            >
              by {book.author}
            </Typography>
          </Box>

          {/* RATING & REVIEWS */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {renderStars(averageRating, 18)}

            <Typography
              component="span"
              sx={{
                color: "var(--text-primary)",
                fontWeight: 800,
              }}
            >
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </Typography>

            <Typography
              component="span"
              sx={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
            </Typography>
          </Box>
          <IconButton
            onClick={() => setIsModalOpen(false)}
            sx={{
              color: "var(--text-secondary)",

              "&:hover": {
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
              },
            }}
          >
            <FaTimes />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            bgcolor: "var(--bg-secondary)",
            color: "var(--text-primary)",

            overflowY: "auto",
            overflowX: "hidden",

            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 3 },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 3, sm: 4, md: 5 }}
            sx={{
              width: "100%",
              alignItems: "stretch",
            }}
          >
            {/* IMAGE */}
            <Box
              sx={{
                width: { xs: "100%", md: "40%" },
                maxWidth: { xs: "100%", md: "420px" },
                mx: { xs: "auto", md: 0 },
                flexShrink: 0,
              }}
            >
              {displayImages.length > 0 ? (
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  navigation={displayImages.length > 1}
                  pagination={{ clickable: true }}
                  autoplay={
                    displayImages.length > 1
                      ? {
                          delay: 10000,
                          disableOnInteraction: false,
                        }
                      : false
                  }
                  loop={displayImages.length > 1}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                  }}
                >
                  {displayImages.map((image, index) => (
                    <SwiperSlide key={index}>
                      <Box
                        component="img"
                        src={image}
                        alt={book.title}
                        sx={{
                          width: "100%",
                          height: {
                            xs: 220,
                            sm: 280,
                            md: 320,
                          },
                          objectFit: "contain",
                          borderRadius: 3,
                          display: "block",
                          bgcolor: "var(--bg-card)",
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 220, sm: 280, md: 320 },
                    bgcolor: "var(--bg-card)",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  No Image Available
                </Box>
              )}
            </Box>

            {/* BOOK DETAILS */}
            <Box
              sx={{
                width: { xs: "100%", md: "60%" },
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Chips */}
              <Box sx={{ mb: 2.5 }}>
                {/* PRICE ROW */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                    mb: 1.5,
                  }}
                >
                  {/* New Price */}
                  <Typography
                    sx={{
                      fontSize: { xs: "1.5rem", sm: "1.75rem" },
                      fontWeight: 800,
                      color: "#a15717",
                    }}
                  >
                    ₹ {book.price}
                  </Typography>

                  {/* Old Price */}
                  {book.oldPrice &&
                    Number(book.oldPrice) > Number(book.price) && (
                      <Typography
                        sx={{
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                          color: "#9ca3af",
                          textDecoration: "line-through",
                        }}
                      >
                        ₹ {book.oldPrice}
                      </Typography>
                    )}

                  {/* Discount Badge */}
                  {Number(book.percentage) > 0 && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 999,
                        bgcolor: "#ecfdf5",
                        border: "1px solid #bbf7d0",
                        color: "#15803d",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                      }}
                    >
                      {book.percentage}% OFF
                    </Box>
                  )}
                </Box>

                {/* META INFORMATION */}
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {/* STOCK */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                      px: 1.4,
                      py: 0.7,
                      borderRadius: 2,
                      bgcolor:
                        book.available_quantity > 0 ? "#f0fdf4" : "#fef2f2",
                      border: "1px solid",
                      borderColor:
                        book.available_quantity > 0 ? "#bbf7d0" : "#fecaca",
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor:
                          book.available_quantity > 0 ? "#16a34a" : "#dc2626",
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color:
                          book.available_quantity > 0 ? "#15803d" : "#dc2626",
                      }}
                    >
                      {book.available_quantity > 0
                        ? `${book.available_quantity} available`
                        : "Out of Stock"}
                    </Typography>
                  </Box>

                  {/* PUBLISHED YEAR */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                      px: 1.4,
                      py: 0.7,
                      borderRadius: 2,

                      bgcolor: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      Published
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "var(--text-primary)",
                        fontWeight: 700,
                      }}
                    >
                      {book.publishedYear || "New Edition"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Description */}
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  lineHeight: 1.8,
                  mb: 2,
                  fontSize: {
                    xs: "0.875rem",
                    sm: "0.95rem",
                    md: "1rem",
                  },
                }}
              >
                {limitWords(book.shortDescription, 40)}
              </Typography>

              {/* Categories */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.7,
                  mb: 2,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                <strong>Genres:</strong>{" "}
                {book.category?.join(" • ") || "General"}
              </Typography>

              {/* Publisher */}
              {book.publisher && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  }}
                >
                  <strong>Publisher:</strong> {book.publisher}
                </Typography>
              )}

              {/* Language */}
              {book.language?.length > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  }}
                >
                  <strong>Language:</strong> {book.language.join(", ")}
                </Typography>
              )}

              {/* Buttons */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{
                  mt: { xs: 3, sm: "auto" },
                  pt: { xs: 1, md: 3 },
                  width: "100%",
                }}
              >
                {book.available_quantity > 0 && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddToCart}
                    sx={{
                      bgcolor: "var(--accent)",
                      color: "#fff",
                      borderRadius: "999px",

                      "&:hover": {
                        bgcolor: "var(--accent-hover)",
                      },
                    }}
                  >
                    Add to Cart
                  </Button>
                )}

                <Button
                  fullWidth
                  onClick={() => navigate(`/book/${book._id}`)}
                  variant="outlined"
                  sx={{
                    borderColor: "#a15717",
                    color: "#a15717",
                    borderRadius: 999,
                    py: 1.2,
                    "&:hover": {
                      borderColor: "#8a4313",
                      bgcolor: "rgba(161,87,23,0.05)",
                    },
                  }}
                >
                  Preview
                </Button>

                <IconButton
                  aria-label="favorite"
                  onClick={handleWishlist}
                  sx={{
                    width: { xs: "100%", sm: 48 },
                    height: { xs: 46, sm: 48 },
                    border: "1px solid rgba(15,23,42,.08)",
                    borderRadius: 999,
                    color: isWishlisted ? "#ef4444" : "#9ca3af",
                    transition: "0.3s",
                    "&:hover": {
                      color: "#ef4444",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <FaHeart />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookCard;
