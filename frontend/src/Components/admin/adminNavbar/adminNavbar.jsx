import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; // Sidebar toggle icons
import { MdArrowDropDown } from "react-icons/md"; // Dropdown Arrow Icon
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import axios from "axios";


const adminNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
   const savedTheme = localStorage.getItem("book-app-theme");
   if (savedTheme) return savedTheme;
   return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [admin, setadmin] = useState({ 
   name: "Admin", 
   profilePic: "https://t4.ftcdn.net/jpg/04/75/00/99/360_F_475009987_zwsk4c77x3cTpcI3W1C1LU4pOSyPKaqi.jpg"
   });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
   document.documentElement.classList.toggle("theme-dark", theme === "dark");
   localStorage.setItem("book-app-theme", theme);
  }, [theme]);

// Close dropdown when clicking outside
useEffect(() => {
  const closeDropdown = (event) => {
    if (!event.target.closest(".dropdown")) {
      setDropdownOpen(false);
    }
  };
  document.addEventListener("click", closeDropdown);
  return () => document.removeEventListener("click", closeDropdown);
}, []);

  const getPageTitle = () => {
    if (location.pathname.startsWith("/admin/edit-language/")) {
      return "Edit Language";
    }
    if (location.pathname.startsWith("/admin/edit-order/")) {
      return "Edit Order";
    }
    if (location.pathname.startsWith("/admin/edit-category/")) {
      return "Edit Category";
    }
    if (location.pathname.startsWith("/admin/editBook/")) {
      return "Edit Book";
    }
    if (location.pathname.startsWith("/admin/view-single-book/")) {
      return "View Single Book";
    }
     if (location.pathname.startsWith("/admin/view-contact-details/")) {
       return "View Contact Details";
     }
    if (location.pathname.startsWith("/admin/view-order-details/")) {
      return "View Order Details";
    }
    if (location.pathname.startsWith("/admin/view-ordered-single-user/")) {
      return "View Booked User Details";
    }
    if (location.pathname.startsWith("/admin/view-single-transporter/")) {
      return "View Transporter Details";
    }
    if (location.pathname.startsWith("/admin/view-single-user/")) {
      return "View User Details";
    }
    if (location.pathname.startsWith("/admin/edit-transporter/")) {
      return "Edit Transporter";
    }
    if (location.pathname.startsWith("/admin/view-single-transporter/")) {
      return "View Transporter Details";
    }
    if (location.pathname.startsWith("/admin/view-single-company/")) {
      return "View Company Details";
    }
    if (location.pathname.startsWith("/admin/edit-company/")) {
      return "Edit Company";
    }
    switch (location.pathname) {
      case "/admin/view-all-category":
        return "All Book Category";
      case "/admin/show-book":
        return "Show Book";
      case "/admin/add-category":
        return "Add Book Category";
      case "/admin/addBookQuantity":
        return "Add Book Quantity";
      case "/admin/view-all-book":
        return "All Book";
      case "/admin/addBook":
        return "Add Book";
      case "/admin/view-all-orders":
        return "All Orders";
      case "/admin/view-all-language":
        return "All Language";
        case "/admin/add-language":
        return "Add Language";
      case "/admin/view-all-user":
        return "All User";
      case "/admin/view-all-transporter":
        return "All Transporter";
      case "/admin/add-transporter":
        return "Add Transporter";
      case "/admin/view-all-company":
        return "All Company";
      case "/admin/add-company":
        return "Add Company";
        case "/admin/view-contact":
          return "All Contacts";
     
      default:
        return "Admin Dashboard";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("showWelcomeToast"); // Clear the toast flag
    toast.success("Logged out successfully!");
    navigate("/backend");
  };

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-100 text-white p-4 shadow-md flex items-center justify-between z-50">
      {/* Left Section: Hamburger & Logo */}
      <div className="flex items-center space-x-4">
        <button className="lg:hidden text-black" onClick={toggleSidebar}>
          {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
        <img src="https://img.freepik.com/free-vector/gradient-bookstore-logo_23-2149332421.jpg" alt="Logo" className="h-10 w-auto sm:inline hidden" />
      </div>

      {/* Center Section: Dynamic Page Title (Visible on all screens) */}
      <h4 className="text-lg font-semibold text-center md:text-left text-black justify-between items-center">{getPageTitle()}</h4>

      {/* Right Section: Theme toggle & Profile Dropdown */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div className="relative dropdown">
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
          <img
            src={admin.profilePic || "https://cdn.pixabay.com/photo/2015/04/13/12/07/business-720429_1280.jpg"}
            className="rounded-full w-10 h-10 border-2 border-white object-cover"
            alt="admin"
          />
          {/* <img
            src="https://cdn.pixabay.com/photo/2015/04/13/12/07/business-720429_1280.jpg"
            className="rounded-full w-10 h-10 border-2 border-white"
            alt="User"
          /> */}
          <div className="flex flex-col text-left">
            <p className="font-semibold text-black">{admin.name}</p>
            <p className="text-sm text-gray-500">admin</p>
          </div>
          <MdArrowDropDown size={24} />
        </button>

          {dropdownOpen && (
            <div className="absolute right-4 w-56 bg-gray-200 text-black shadow-xl rounded-md py-2 top-16 p-4 z-50">
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 cursor-pointer">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default adminNavbar;
