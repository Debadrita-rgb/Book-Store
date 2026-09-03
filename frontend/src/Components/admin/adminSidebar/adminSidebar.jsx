import { FiHome, FiUser, FiBriefcase, FiSettings, FiX } from "react-icons/fi";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GrUserManager } from "react-icons/gr";
import { BiCategory } from "react-icons/bi";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { RiGalleryView } from "react-icons/ri";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { BiCommentDetail } from "react-icons/bi";
import { HiMiniBuildingLibrary } from "react-icons/hi2";
import {
  FaFilm,
  FaTheaterMasks,
  FaTicketAlt,
  FaLanguage,
  FaUser,
  FaQuoteRight,
  FaCalendarCheck,
} from "react-icons/fa";
import {
  MdCategory,
  MdFeedback,
  MdLocationOn,
  MdPhotoLibrary,
  MdCollections,
  MdContactPhone,
  MdEmojiTransportation,
} from "react-icons/md";

export default function adminSidebar({ isOpen, toggleSidebar }) {
  const [bookOpen, setBookOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  const [miscOpen, setMiscOpen] = useState(false);
  

  useEffect(() => {
    const checkViewport = () => {
      setIsTabletOrMobile(window.innerWidth < 1024);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);

    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const closeSidebar = () => {
    if (isTabletOrMobile) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Sidebar: Overlay on Mobile, Fixed on Desktop */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto  shadow-lg w-64 p-5 transition-transform duration-300 z-50
  ${isOpen ? "translate-x-0" : "-translate-x-64"} lg:translate-x-0 lg:w-64`}
      >
        <nav className="mt-5 space-y-4">
          <Link
            to="/admin/dashboard"
            onClick={closeSidebar}
            className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded mt-5"
          >
            <FiHome /> <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/view-all-category"
            onClick={closeSidebar}
            className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            <FiUser /> <span> Book Category</span>
          </Link>
          <div>
            <button
              onClick={() => setBookOpen(!bookOpen)}
              className="flex items-center justify-between w-full p-4 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
            >
              <div className="flex items-center space-x-2">
                <BiCategory />
                <span>Books Section</span>
              </div>
              {bookOpen ? <BsChevronUp /> : <BsChevronDown />}
            </button>

            {bookOpen && (
              <div className="ml-6 space-y-2 mt-2">
                <Link
                  to="/admin/view-all-book"
                  onClick={closeSidebar}
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaFilm size={10} className="inline-block mr-2" />
                  View Books
                </Link>
                <Link
                  to="/admin/addBookQuantity"
                  onClick={closeSidebar}
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaFilm size={10} className="inline-block mr-2" />
                  Add Book Quantity
                </Link>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setOrderOpen(!orderOpen)}
              className="flex items-center justify-between w-full p-4 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
            >
              <div className="flex items-center space-x-2">
                <BiCategory />
                <span>Orders Section</span>
              </div>
              {orderOpen ? <BsChevronUp /> : <BsChevronDown />}
            </button>

            {orderOpen && (
              <div className="ml-6 space-y-2 mt-2">
                <Link
                  to="/admin/view-all-orders"
                  onClick={closeSidebar}
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaFilm size={10} className="inline-block mr-2" />
                  View Orders
                </Link>
                {/* <Link
                  to="/admin/addBookQuantity"
                  onClick={closeSidebar}
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaFilm size={10} className="inline-block mr-2" />
                  Add Book Quantity
                </Link> */}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setMiscOpen(!miscOpen)}
              className="flex items-center justify-between w-full p-4 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
            >
              <div className="flex items-center space-x-2">
                <BiCategory />
                <span>Miscellaneous</span>
              </div>
              {miscOpen ? <BsChevronUp /> : <BsChevronDown />}
            </button>

            {miscOpen && (
              <div className="ml-6 space-y-2 mt-2">
                <Link
                  to="/admin/view-all-coupon"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaLanguage size={10} className="inline-block mr-2" />
                  View Coupon
                </Link>
                <Link
                  to="/admin/view-all-company"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <HiMiniBuildingLibrary
                    size={10}
                    className="inline-block mr-2"
                  />
                  View Company
                </Link>
                <Link
                  to="/admin/view-all-transporter"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <MdEmojiTransportation
                    size={10}
                    className="inline-block mr-2"
                  />
                  View Transporter
                </Link>
                <Link
                  to="/admin/view-all-language"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaLanguage size={10} className="inline-block mr-2" />
                  View Language
                </Link>

                <Link
                  to="/admin/view-contact"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <MdContactPhone size={10} className="inline-block mr-2" />
                  View Contact
                </Link>
                <Link
                  to="/admin/view-all-user"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaUser size={10} className="inline-block mr-2" />
                  View User
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}
