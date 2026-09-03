import { useState, useEffect, useRef } from "react";
import {
  FaBars,
  FaXmark,
  FaLocationDot,
  FaMagnifyingGlass,
} from "react-icons/fa6";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { FiMoon, FiSun } from "react-icons/fi";
import logo from "../../../../src/assets/logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";
import { RxCross2 } from "react-icons/rx";
import { jwtDecode } from "jwt-decode";
import { useCart } from "../../../context/CartContext";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const {
    cartCount,
    getCartCount,
    wishlistCount,
    getWishlistCount,
    setCartCount,
    setWishlistCount,
  } = useCart();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // apply stored theme on mount and whenever it changes
    if (theme === 'dark') {
      document.documentElement.classList.add('theme-dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("userName");

    if (token && storedName) {
      setIsLoggedIn(true);
      setUserName(storedName);
    } else {
      setIsLoggedIn(false);
      setUserName("Guest");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("showWelcomeToast");
    localStorage.removeItem("userName");

    setIsLoggedIn(false);
    setUserName("Guest");

    toast.success("🎉 Logged out successfully!", {
      autoClose: 3000,
      pauseOnFocusLoss: false,
    });

    navigate("/signin");
  };

  useEffect(() => {
    fetch(`${BASE_URL}/user/get-all-books`)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setFilteredBooks(data);
      })
      .catch((err) => console.error(err));
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

  //Wishlist Count
  useEffect(() => {
    // if (!isLoggedIn) return;

     const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const decoded = jwtDecode(token);

    fetch(`${BASE_URL}/user/wishlist-count/${decoded.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setWishlistCount(data.count);
        }
      })
      } catch (err) {
    console.error("Invalid Token:", err);
    localStorage.removeItem("token");
  }
  }, []);

  //Cart Count
  useEffect(() => {
    // if (!isLoggedIn) return;

    const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const decoded = jwtDecode(token);

    fetch(`${BASE_URL}/user/cart-count/${decoded.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCartCount(data.count);
        }
      })
      } catch (err) {
    console.error("Invalid Token:", err);
    localStorage.removeItem("token");
  }
  }, []);

  const closeUserDropdown = () => {
  setShowNameDropdown(false);
  setMobileMenuOpen(false);
};

return (
  <div className="navbar-theme sticky top-0 z-50">
    {" "}
    <ToastContainer position="top-right" autoClose={2000} />
    <div className="flex items-center justify-between h-20 px-6 max-w-7xl mx-auto">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-14 object-contain" />
        </Link>
      </div>

      {/* Center Menu */}
      <nav className="hidden lg:flex items-center gap-10 font-medium text-gray-700">
        <Link to="/" className="nav-link">
          Home
        </Link>

        <Link to="/book" className="nav-link">
          Books
        </Link>

        <Link to="/about" className="nav-link">
          About
        </Link>

        <Link to="/contact" className="nav-link">
          Contact
        </Link>
      </nav>

      {/* Search */}
      <div
        className="relative w-80 lg:w-[400px] xl:w-[430px]"
        ref={dropdownRef}
      >
        <div className="relative w-full max-w-md">
          <div className="search-box-theme flex items-center h-12 rounded-full px-5">
            <FaMagnifyingGlass className="text-gray-400 mr-3" />

            <input
              type="text"
              placeholder="Search books, authors..."
              className="flex-1 border-none outline-none bg-transparent"
              value={query}
              onChange={handleSearch}
            />
          </div>

          {isSearchOpen && (
            <div className="absolute top-14 left-0 w-full bg-white shadow-lg rounded-xl max-h-80 overflow-y-auto z-50">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <div
                    key={book._id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/book/${book._id}`)}
                  >
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded"
                    />

                    <div>
                      <h3 className="font-semibold">{book.title}</h3>
                      <p className="text-sm text-gray-500">{book.author}</p>
                      <p className="text-red-500 font-semibold">
                        ₹{book.price}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-gray-500">No books found.</p>
              )}
            </div>
          )}
        </div>

        {isSearchOpen && filteredBooks.length > 0 && (
          <div className="search-dropdown-theme absolute top-14 left-0 w-full rounded-xl max-h-80 overflow-y-auto z-50">
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                onClick={() => {
                  navigate(`/book/${book._id}`);
                  setQuery("");
                  setFilteredBooks([]);
                  setIsSearchOpen(false);
                }}
                className="search-item flex items-center gap-3 p-3 cursor-pointer"
              >
                <img
                  src={book.coverImageLink}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded"
                />

                <div>
                  <h4 className="font-semibold">{book.title}</h4>
                  <p className="text-sm text-gray-500">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="icon-btn p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <FiSun className="w-5 h-5 text-yellow-300" />
          ) : (
            <FiMoon className="w-5 h-5 text-gray-600" />
          )}
        </button>
        {isLoggedIn && (
          <>
            {/* Wishlist */}
            <Link to="/wishlist" className="relative">
              <FaHeart className="icon-btn text-xl" />

              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full min-w-5 h-5 flex items-center justify-center px-1 font-semibold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}

            <Link to="/cart" className="relative">
              <FaShoppingCart className="icon-btn text-xl" />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full min-w-5 h-5 flex items-center justify-center px-1 font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>
          </>
        )}
        {/* User */}

        {/* <div className="hidden lg:block"> */}
        <div className="relative z-50" ref={dropdownRef}>
          {isLoggedIn ? (
            <div>
              <button
                onClick={() => setShowNameDropdown(!showNameDropdown)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-5 py-2 font-medium hidden lg:flex items-center gap-4"
              >
                Hi{" "}
                {userName
                  ? `${userName.slice(0, 4)}${userName.length > 4 ? "..." : ""}`
                  : "Guest"}{" "}
              </button>

              {showNameDropdown && (
                <div className="user-dropdown absolute right-0 mt-2 w-40 rounded-md z-[100]">
                  <Link to="/profile" onClick={closeUserDropdown}>
                    <div className="user-dropdown-item px-4 py-2 cursor-pointer">
                      My Profile
                    </div>
                  </Link>
                  <Link to="/address" onClick={closeUserDropdown}>
                    <div className="user-dropdown-item px-4 py-2 cursor-pointer">
                      My Addresses
                    </div>
                  </Link>
                  <Link to="/orders" onClick={closeUserDropdown}>
                    <div className="user-dropdown-item px-4 py-2 cursor-pointer">
                      My Orders
                    </div>
                  </Link>

                  <div
                    className="user-dropdown-item px-4 py-2 cursor-pointer"
                    onClick={() => {
                      handleLogout();
                      setShowNameDropdown(false);
                    }}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/signin">
              <button
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg
                     px-2.5 py-1 text-xs
                     sm:px-4 sm:py-2 sm:text-sm
                     lg:px-5 lg:py-2 lg:text-base
                     font-medium transition cursor-pointer"
              >
                Sign In
              </button>
            </Link>
          )}
        </div>

        {/* Mobile */}

        <button
          className="block lg:hidden icon-btn shadow-xl rounded-b-2xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <RxCross2 className="w-7 h-7" />
          ) : (
            <FaBars size={22} />
          )}
        </button>
      </div>
    </div>
    {mobileMenuOpen && (
      <div className="mobile-menu lg:hidden">
        <nav className="flex flex-col p-5 space-y-1">
          <button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-5 py-2 font-medium">
            Hi {userName || "Guest"}
          </button>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg px-4 py-3 hover:bg-red-50 hover:text-red-600 font-medium"
          >
            Home
          </Link>

          <Link
            to="/book"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg px-4 py-3 hover:bg-red-50 hover:text-red-600 font-medium"
          >
            Books
          </Link>

          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg px-4 py-3 hover:bg-red-50 hover:text-red-600 font-medium"
          >
            About
          </Link>

          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg px-4 py-3 hover:bg-red-50 hover:text-red-600 font-medium"
          >
            Contact
          </Link>

          {isLoggedIn && (
            <>
              <hr className="my-2" />

              <Link
                to="/profile"
                onClick={closeUserDropdown}
                className="mobile-menu-item rounded-lg px-4 py-3"
              >
                My Profile
              </Link>
              <Link
                to="/address"
                onClick={closeUserDropdown}
                className="mobile-menu-item rounded-lg px-4 py-3"
              >
                My Addresses
              </Link>
              <Link
                to="/orders"
                onClick={closeUserDropdown}
                className="mobile-menu-item rounded-lg px-4 py-3"
              >
                My Orders
              </Link>

              <button
                onClick={handleLogout}
                className="mobile-logout mt-2 w-full rounded-xl py-3 transition"
              >
                Logout
              </button>
            </>
          )}

          {isSearchOpen && filteredBooks.length > 0 && (
            <div className="absolute top-14 left-0 w-full bg-white rounded-xl shadow-lg border max-h-80 overflow-auto z-50">
              {filteredBooks.map((book) => (
                <div
                  key={book._id}
                  onClick={() => {
                    navigate(`/book/${book._id}`);
                    setQuery("");
                    setFilteredBooks([]);
                    setIsSearchOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
                >
                  <img
                    src={book.coverImageLink}
                    alt={book.title}
                    className="w-12 h-16 rounded object-cover"
                  />

                  <div>
                    <p className="font-semibold">{book.title}</p>
                    <p className="text-sm text-gray-500">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>
      </div>
    )}
  </div>
);
}
