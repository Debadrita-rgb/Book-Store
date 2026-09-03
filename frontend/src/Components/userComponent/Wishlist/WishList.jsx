import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";
import { useCart } from "../../../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const WishList = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const navigate = useNavigate();
  const [selectedList, setSelectedList] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [listName, setListName] = useState("");
  const [wishlistLists, setWishlistLists] = useState([]);
  const [moveOpenId, setMoveOpenId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const {
    getCartCount,
    getWishlistCount,
  } = useCart();

  const getWishlist = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/user/get-wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setWishlistItems(
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

  const getWishlistLists = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/user/wishlist-lists`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWishlistLists(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getWishlist();
    getWishlistLists();
  }, []);

  const filteredWishlist =
    selectedList === null
      ? wishlistItems
      : wishlistItems.filter(
          (item) =>
            item.listId?._id === selectedList._id ||
            item.listId === selectedList._id,
        );

  const handleAddToCart = async (item) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/user/add-to-cart`,
        {
          bookId: item.bookId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);
      await getCartCount();
      await getWishlistCount();
      navigate("/cart");
    } catch (err) {
      console.log("Error:", err);
      console.log("Response:", err.response);
      console.log("Data:", err.response?.data);

      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const deleteWishlist = async (wishlistId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${BASE_URL}/user/delete-from-wishlist/${wishlistId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);

        await getWishlist();

        await getWishlistCount();

        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const createWishlist = async () => {
    if (!listName.trim()) return;

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/user/create-wishlist-list`,
        { listName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await getWishlistLists();

      toast.success("Wishlist created");

      setOpenCreateDialog(false);
      setListName("");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const moveToList = async (wishlistId, listId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${BASE_URL}/user/move-wishlist`,
        {
          wishlistId,
          listId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);

        setMoveOpenId(null);

        getWishlist();
        getWishlistLists();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      if (!wishlistItems.length) return;

      try {
        const token = localStorage.getItem("token");

        const reviewData = {};

        await Promise.all(
          wishlistItems.map(async (item) => {
            const bookId =
              typeof item.bookId === "object" ? item.bookId?._id : item.bookId;

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
  }, [wishlistItems]);

  return (
    <div className="wishlist-page py-8">
      {" "}
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <h1 className="wishlist-title text-3xl font-bold mb-8">Wishlist</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* left sidebar  */}

          <div className="hidden lg:block lg:col-span-3">
            <div className="wishlist-sidebar rounded-xl">
              {" "}
              <div className="p-5 border-b">
                <h2 className="wishlist-title text-2xl font-bold">
                  Your Lists
                </h2>
              </div>
              <div className="p-3">
                <button
                  onClick={() => setSelectedList(null)}
                  className={`wishlist-list-btn w-full text-left p-3 rounded-lg flex justify-between ${
                    selectedList === null ? "wishlist-list-active" : ""
                  }`}
                >
                  <span>All</span>
                  <span>{wishlistItems.length}</span>
                </button>

                {wishlistLists.map((list) => (
                  <button
                    key={list._id}
                    onClick={() => setSelectedList(list)}
                    className={`w-full text-left p-3 rounded-lg mt-2 flex justify-between ${
                      selectedList?._id === list._id
                        ? "bg-orange-100 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span>{list.listName}</span>
                    <span>{list.count}</span>
                  </button>
                ))}

                <button
                  onClick={() => setOpenCreateDialog(true)}
                  className="w-full mt-5 border rounded-lg py-3"
                >
                  + Create New List
                </button>
              </div>
            </div>
          </div>

          {/* right sidebar */}
          <div className="lg:col-span-9">
            {filteredWishlist.length > 0 ? (
              filteredWishlist.map((item) => {
                // Get individual book ID
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
                    <div key={item._id}
                      className="wishlist-card rounded-xl p-5 mb-5"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/*  IMAGE  */}
                        <div className="flex justify-center md:block">
                                            <Link to={`/book/${bookId}`}  className="block">

                          <img
                            src={item.details.coverImageLink}
                            alt={item.details.title}
                            className="w-40 h-56 object-cover rounded-lg border"
                          />
                          </Link>
                        </div>

                        {/*  DETAILS  */}
                        <div className="flex-1">
                          {/* Title */}
                          <h2 className="text-xl md:text-2xl font-bold">
                            {item.details.title}
                          </h2>

                          {/* Author */}
                          <p className="wishlist-text mt-1">
                            by {item.details.author}
                          </p>

                          {/*  RATING  */}
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

                          {/* Price */}
                          <h3 className="text-3xl font-bold text-green-600 mt-3">
                            ₹{item.details.price}
                          </h3>

                          {/* Stock */}
                          <p className="text-green-600 mt-2 font-medium">
                            In Stock
                          </p>

                          {/* Added Date */}
                          <p className="wishlist-muted mt-2">
                            Added on{" "}
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>

                          {/*  BUTTONS  */}
                          <div className="flex flex-wrap gap-3 mt-6">
                            {/* Add To Cart */}
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="bg-yellow-400 hover:bg-yellow-500 px-5 py-2 rounded-full font-medium transition"
                            >
                              Add to Cart
                            </button>

                            {/* Share */}
                            <button
                              onClick={() => shareBook(item)}
                              className="border px-5 py-2 rounded-full hover:bg-gray-100 transition"
                            >
                              Share
                            </button>

                            {/* Move */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setMoveOpenId(
                                    moveOpenId === item._id ? null : item._id,
                                  )
                                }
                                className="border border-purple-500 px-5 py-2 rounded-full transition"
                              >
                                Move
                              </button>

                              {moveOpenId === item._id && (
                                <div className="wishlist-dropdown absolute mt-2 w-52 rounded-lg z-20 shadow-lg">
                                  {wishlistLists
                                    .filter((list) => list._id !== item.listId)
                                    .map((list) => (
                                      <button
                                        key={list._id}
                                        onClick={() =>
                                          moveToList(item._id, list._id)
                                        }
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                      >
                                        {list.listName}
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>

                            {/* Delete */}
                            <button
                              onClick={() => deleteWishlist(item._id)}
                              className="border border-red-500 text-red-500 px-5 py-2 rounded-full hover:bg-red-50 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p className="text-lg font-medium">No books in this list</p>
              </div>
            )}
          </div>
        </div>

        {openCreateDialog && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="wishlist-modal rounded-xl p-6 w-[90%] max-w-md">
              {" "}
              <h2 className="text-xl font-bold mb-4">Create New Wishlist</h2>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Enter list name"
                className="wishlist-input w-full rounded-lg p-3"
              />
              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setOpenCreateDialog(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={createWishlist}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default WishList;
