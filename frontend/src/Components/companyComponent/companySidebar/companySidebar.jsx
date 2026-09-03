import { FiHome, FiUser, FiBriefcase, FiSettings, FiX } from "react-icons/fi";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GrUserManager } from "react-icons/gr";
import { BiCategory } from "react-icons/bi";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { RiGalleryView } from "react-icons/ri";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { BiCommentDetail } from "react-icons/bi";
import { FaFilm } from "react-icons/fa";
import { MdEmojiTransportation } from "react-icons/md";

export default function CompanySidebar({ isOpen, toggleSidebar }) {
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
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto bg-white shadow-lg w-64 p-5 transition-transform duration-300 z-50
  ${isOpen ? "translate-x-0" : "-translate-x-64"} lg:translate-x-0 lg:w-64`}
      >
        <nav className="mt-5 space-y-4">
          <Link
            to="/company/dashboard"
            onClick={closeSidebar}
            className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded mt-5"
          >
            <FiHome /> <span>Dashboard</span>
          </Link>
          <Link
            to="/company/view-all-transporter-by-company"
            className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
          >
            <MdEmojiTransportation size={10} className="inline-block mr-2" />
            View Transporter
          </Link>
          <Link
            to="/company/view-all-orders-by-company"
            onClick={closeSidebar}
            className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
          >
            <FaFilm size={10} className="inline-block mr-2" />
            View Orders
          </Link>
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
