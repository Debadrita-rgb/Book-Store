import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaStar, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import BASE_URL from "../../../../config";
import { useCart } from "../../../context/CartContext";

const CategorizedBooks = () => {
  const { name } = useParams();
  const { getCartCount, getWishlistCount } = useCart();  
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategorizedBooks = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${BASE_URL}/user/categorized-books/${encodeURIComponent(name)}`,
        );
        
        if (response.data.success) {
          setBooks(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching categorized books:", err);
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchCategorizedBooks();
    }
  }, [name]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Loading books...</p>
      </div>
    );
  }

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

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>

            <p className="text-orange-500 font-semibold">
              <Link to="/categories">Category</Link>
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {name}
            </h1>

            <p className="text-gray-500 mt-2">
              {books.length} {books.length === 1 ? "Book" : "Books"}
            </p>
          </div>
        </div>

        {/* No books */}
        {books.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800">No books found</h2>

            <p className="text-gray-500 mt-2">
              There are no books available in this category.
            </p>

            <Link
              to="/"
              className="inline-block mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          /* Books */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book._id}
                className=" rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 group"
              >
                <Link to={`/book/${book._id}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={book.coverImageLink}
                      alt={book.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                    />

                    {book.isRecommended && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  {/* Rating */}
                  <div className="flex items-center gap-1 text-yellow-500 text-sm">
                    <FaStar />

                    <span className="text-gray-500">
                      {book.rating ? book.rating.toFixed(1) : "No rating"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-2 font-bold text-gray-900 line-clamp-1">
                    {book.title}
                  </h3>

                  {/* Author */}
                  <p className="text-sm text-gray-500 mt-1">{book.author}</p>

                  {/* Price and available quantity */}
                  <div className="flex items-center justify-between mt-3">
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-orange-500">
                        ₹{book.price}
                      </span>

                      {book.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{book.oldPrice}
                        </span>
                      )}
                    </div>

                    {/* Available Quantity */}
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
                  {/* Cart */}
                  {book.availableQuantity > 0 ? (
                    <button
                      onClick={() => handleAddToCart(book)}
                      className="w-full mt-4 bg-gray-900 hover:bg-orange-500 text-white py-2.5 rounded-lg font-semibold transition"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full mt-4 bg-gray-300 text-gray-500 py-2.5 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorizedBooks;
