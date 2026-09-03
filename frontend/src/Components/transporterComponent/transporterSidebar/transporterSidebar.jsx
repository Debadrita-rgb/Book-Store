import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GiDeliveryDrone } from "react-icons/gi";
import { BiCategory } from "react-icons/bi";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { CiDeliveryTruck } from "react-icons/ci";
import { FiHome } from "react-icons/fi";

import {
  FaFilm,
} from "react-icons/fa";

export default function transporterSidebar({ isOpen, toggleSidebar }) {
  const [deliveryOpen, setDeliveryOpen] = useState(false);
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
            to="/transporter/dashboard"
            onClick={closeSidebar}
            className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded mt-5"
          >
            <FiHome /> <span>Dashboard</span>
          </Link>
          <Link
            to="/transporter/view-all-orders-by-transporter"
            onClick={closeSidebar}
            className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
          >
            <FaFilm size={10} className="inline-block mr-2" />
            View Orders
          </Link>
          <div>
            <button
              onClick={() => setDeliveryOpen(!deliveryOpen)}
              className="flex items-center justify-between w-full p-4 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
            >
              <div className="flex items-center space-x-2">
                <BiCategory />
                <span> Deliveries</span>
              </div>
              {deliveryOpen ? <BsChevronUp /> : <BsChevronDown />}
            </button>

            {deliveryOpen && (
              <div className="ml-6 space-y-2 mt-2">
                <Link
                  to="/transporter/today-deliveries"
                  onClick={closeSidebar}
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <CiDeliveryTruck size={20} className="inline-block mr-2" />
                  Today's Deliveries
                </Link>
                <Link
                  to="/transporter/completed-deliveries"
                  onClick={closeSidebar}
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-gray-700 hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <GiDeliveryDrone size={20} className="inline-block mr-2" />
                  Completed Total Deliveries
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
