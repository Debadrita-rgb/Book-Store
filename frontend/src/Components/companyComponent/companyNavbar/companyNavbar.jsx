import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; // Sidebar toggle icons
import { MdArrowDropDown } from "react-icons/md"; // Dropdown Arrow Icon
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import axios from "axios";
import BASE_URL from "../../../../config"; 

const companyNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("book-app-theme");
    if (savedTheme) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [company, setCompany] = useState({
    profilePic:
      "https://t4.ftcdn.net/jpg/04/75/00/99/360_F_475009987_zwsk4c77x3cTpcI3W1C1LU4pOSyPKaqi.jpg",
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
    localStorage.setItem("book-app-theme", theme);
  }, [theme]);

  //get company details from local storage
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`${BASE_URL}/company/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCompany(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCompanyDetails();
  }, []);

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
    
    if (location.pathname.startsWith("/company/edit-order/")) {
      return "Edit Order";
    }
    if (location.pathname.startsWith("/company/edit-company-transporter/")) {
      return "Edit Transporter";
    }
    if (location.pathname.startsWith("/company/view-company-order-details/")) {
      return "View Order Details";
    }
    
    switch (location.pathname) {
      case "/company/view-all-orders-by-company":
        return "All Orders";
      case "/company/view-all-transporter-by-company":
        return "All Transporters";
      case "/company/add-company-transporter":
        return "Add Transporter";

      default:
        return "Company Dashboard";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("showWelcomeToast");
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
        <img
          src="https://img.freepik.com/free-vector/gradient-bookstore-logo_23-2149332421.jpg"
          alt="Logo"
          className="h-10 w-auto sm:inline hidden"
        />
      </div>

      {/* Center Section: Dynamic Page Title (Visible on all screens) */}
      <h4 className="text-lg font-semibold text-center md:text-left text-black justify-between items-center">
        {getPageTitle()}
      </h4>

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
            src={
              company.profilePic ||
              "https://cdn.pixabay.com/photo/2015/04/13/12/07/business-720429_1280.jpg"
            }
            className="rounded-full w-10 h-10 border-2 border-white object-cover"
            alt="Company"
          />
          {/* <img
            src="https://cdn.pixabay.com/photo/2015/04/13/12/07/business-720429_1280.jpg"
            className="rounded-full w-10 h-10 border-2 border-white"
            alt="User"
          /> */}
          <div className="flex flex-col text-left">
            <p className="font-semibold text-black">
              {company.companyName}
            </p>{" "}
            <p className="text-sm text-gray-500">Company</p>
          </div>
          <MdArrowDropDown size={24} />
        </button>

          {dropdownOpen && (
            <div className="absolute right-4 w-56 bg-gray-200 text-black shadow-xl rounded-md py-2 top-16 p-4 z-50">
              <Link
                to="/company/profile"
                className="block px-4 py-2 mt-2 text-sm p-2 rounded-lg cursor-pointer"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2  cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default companyNavbar;
