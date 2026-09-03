import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaArrowRight } from "react-icons/fa";
import BASE_URL from "../../../../../config";
// import "./heroSection.css";

const HeroSection = () => {
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/user/get-all-books`)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setFilteredBooks(data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNameDropdown(false);
        setIsLocationOpen(false);
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setFilteredBooks([]);
      setIsSearchOpen(false);
      return;
    }

    const searchValue = value.toLowerCase();

    const results = books.filter(
      (book) =>
        book.title?.toLowerCase().includes(searchValue) ||
        book.author?.toLowerCase().includes(searchValue),
    );

    setFilteredBooks(results);
    setIsSearchOpen(true);
  };

  return (
    <section className="hero-bg">
      <div className="max-w-7xl mx-auto px-6 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="hero-badge inline-block px-4 py-2 mb-5 rounded-full text-sm font-semibold">
              📚 Discover Your Next Favorite Book
            </span>

            <h1 className="section-title text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Stories that
              <span className="text-orange-500"> stay with you.</span>
            </h1>

            <p className="section-text mt-6 text-lg max-w-xl leading-8">
              Explore thousands of books from your favorite authors. Find
              stories, knowledge, and inspiration all in one place.
            </p>

            {/* Search */}
            <div className="relative mt-8 max-w-xl">
              <div className="search-box flex rounded-xl shadow-lg border p-2">
                <div className="flex items-center flex-1 px-3">
                  <FaSearch className="search-icon mr-3" />

                  <input
                    type="text"
                    onChange={handleSearch}
                    value={query}
                    placeholder="Search books, authors..."
                    className="search-input w-full outline-none bg-transparent"
                  />
                </div>
              </div>

              {isSearchOpen && (
                <div className="search-dropdown absolute top-full left-0 mt-2 w-full shadow-xl rounded-xl max-h-80 overflow-y-auto z-50 border">
                  {filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => (
                      <div
                        key={book._id}
                        className="search-item flex items-center gap-3 p-3 cursor-pointer"
                        onClick={() => {
                          navigate(`/book/${book._id}`);
                          setIsSearchOpen(false);
                          setQuery("");
                        }}
                      >
                        <img
                          src={book.coverImageLink}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded"
                        />

                        <div>
                          <h3 className="font-semibold">{book.title}</h3>
                          <p className="text-sm opacity-70">{book.author}</p>
                          <p className="text-orange-500 font-semibold">
                            ₹{book.price}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center opacity-70">
                      No books found.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                to="/book"
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Explore Books
                <FaArrowRight />
              </Link>

              <Link
                to="/categories"
                className="hero-secondary-btn px-6 py-3 rounded-lg border font-semibold transition"
              >
                Browse Categories
              </Link>
            </div>
          </div>

          {/* Right Side remains unchanged */}
          <div className="relative flex justify-center">
            <div className="absolute w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-40"></div>

            <div className="relative grid grid-cols-2 gap-5">
              <img
                src="https:images.unsplash.com/photo-1544947950-fa07a98d237f?w=500"
                alt="Book"
                className="w-40 h-56 md:w-48 md:h-64 object-cover rounded-xl shadow-2xl rotate-[-6deg]"
              />

              <img
                src="https:images.unsplash.com/photo-1589998059171-988d887df646?w=500"
                alt="Book"
                className="w-40 h-56 md:w-48 md:h-64 object-cover rounded-xl shadow-2xl rotate-[6deg] mt-8"
              />

              <img
                src="https:images.unsplash.com/photo-1512820790803-83ca734da794?w=500"
                alt="Book"
                className="w-40 h-56 md:w-48 md:h-64 object-cover rounded-xl shadow-2xl rotate-[5deg]"
              />

              <img
                src="https:images.unsplash.com/photo-1511108690759-009324a90311?w=500"
                alt="Book"
                className="w-40 h-56 md:w-48 md:h-64 object-cover rounded-xl shadow-2xl rotate-[-5deg] mt-8"
              />
            </div>
          </div>
        </div>
        </div>
    </section>
  );
};

export default HeroSection;
