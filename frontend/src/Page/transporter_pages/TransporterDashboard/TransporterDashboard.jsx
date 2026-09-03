import { MdEdit } from "react-icons/md";
import React, { useState, useEffect, useMemo } from "react";
import { FiBriefcase, FiClock, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../../config";

import {
  FaBoxOpen,
  FaTruck,
  FaShippingFast,
  FaCheckCircle,
  FaClock,
  FaRoute,
} from "react-icons/fa";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

const TransporterDashboard = () => {
  const [deliveryView, setDeliveryView] = useState("weekly");
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentOrders: [],
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.post(
          `${BASE_URL}/transporter/dashboard-data`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setDashboardData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
  }, []);

  const weeklyDeliveryData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return days.map((day, index) => {
      const item = dashboardData.weeklyDeliveries?.find(
        (d) => d._id === index + 1,
      );

      return {
        label: day,
        value: item?.count || 0,
      };
    });
  }, [dashboardData.weeklyDeliveries]);

  const monthlyDeliveryData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return months.map((month, index) => {
      const item = dashboardData.monthlyDeliveries?.find(
        (m) => m._id === index + 1,
      );

      return {
        label: month,
        value: item?.count || 0,
      };
    });
  }, [dashboardData.monthlyDeliveries]);

  const yearlyDeliveryData = useMemo(() => {
    return (dashboardData.yearlyDeliveries || []).map((item) => ({
      label: String(item._id),
      value: item.count,
    }));
  }, [dashboardData.yearlyDeliveries]);

  const activeDeliveryData =
    deliveryView === "weekly"
      ? weeklyDeliveryData
      : deliveryView === "monthly"
        ? monthlyDeliveryData
        : yearlyDeliveryData;

  const exportDeliveryCSV = () => {
    const header =
      deliveryView === "weekly"
        ? "Day"
        : deliveryView === "monthly"
          ? "Month"
          : "Year";

    const csv = [
      [header, "Deliveries"],
      ...activeDeliveryData.map((item) => [item.label, item.value]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${deliveryView}-deliveries-report.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };
  const cardsValue = [
    {
      title: "Assigned Orders",
      value: dashboardData.stats.totalOrders || 0,
      icon: FaBoxOpen,
      bg: "from-blue-500 to-indigo-600",
    },
    {
      title: "Today's Deliveries",
      value: dashboardData.stats.todayDeliveries || 0,
      icon: FaTruck,
      bg: "from-cyan-500 to-blue-600",
    },
    {
      title: "Pending",
      value: dashboardData.stats.pendingOrders || 0,
      icon: FaClock,
      bg: "from-yellow-500 to-orange-500",
    },
    {
      title: "Out For Delivery",
      value: dashboardData.stats.outForDelivery || 0,
      icon: FaShippingFast,
      bg: "from-purple-500 to-violet-600",
    },
    {
      title: "Delivered",
      value: dashboardData.stats.deliveredOrders || 0,
      icon: FaCheckCircle,
      bg: "from-green-500 to-emerald-600",
    },
    {
      title: "Success Rate",
      value: `${dashboardData.stats.successRate || 0}%`,
      icon: FaRoute,
      bg: "from-pink-500 to-rose-500",
    },
  ];
  // console.log(dashboardData.recentOrders);
  return (
    <main className="dashboard-shell p-6 min-h-screen space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardsValue.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-r ${card.bg}
            shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full"></div>

              <div className="flex justify-between items-center relative z-10">
                <div>
                  <p className="text-sm opacity-90">{card.title}</p>
                  <h2 className="text-3xl font-bold mt-2">{card.value}</h2>
                </div>

                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <Icon className="text-3xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Delivery Chart */}
      {dashboardData.stats.totalOrders > 0 && (
        <div className="dashboard-panel rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold dashboard-text">
                Deliveries Overview
              </h2>
              <p className="text-sm dashboard-caption">
                Weekly, monthly and yearly delivery trends.
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {["weekly", "monthly", "yearly"].map((type) => (
                <button
                  key={type}
                  onClick={() => setDeliveryView(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium dashboard-filter-button ${
                    deliveryView === type ? "dashboard-filter-button-active" : ""
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}

              <button
                onClick={exportDeliveryCSV}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Download CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="dashboard-stat-box rounded-xl p-4">
              <p className="text-sm text-blue-600">Total Delivered</p>
              <p className="text-2xl font-bold dashboard-text">
                {dashboardData.stats.deliveredOrders}
              </p>
            </div>

            <div className="dashboard-stat-box-green rounded-xl p-4">
              <p className="text-sm text-green-600">
                Highest{" "}
                {deliveryView === "weekly"
                  ? "Day"
                  : deliveryView === "monthly"
                    ? "Month"
                    : "Year"}
              </p>
              <p className="text-2xl font-bold dashboard-text">
                {
                  activeDeliveryData.reduce(
                    (a, b) => (a.value > b.value ? a : b),
                    {
                      label: "-",
                      value: 0,
                    },
                  ).label
                }
              </p>
            </div>

            <div className="dashboard-stat-box-orange rounded-xl p-4">
              <p className="text-sm text-orange-600">Peak Deliveries</p>
              <p className="text-2xl font-bold dashboard-text">
                {activeDeliveryData.reduce(
                  (max, item) => Math.max(max, item.value),
                  0,
                )}
              </p>
            </div>
          </div>

          <Line
            data={{
              labels: activeDeliveryData.map((item) => item.label),
              datasets: [
                {
                  label: `${
                    deliveryView.charAt(0).toUpperCase() + deliveryView.slice(1)
                  } Deliveries`,
                  data: activeDeliveryData.map((item) => item.value),
                  borderColor: "#2563eb",
                  backgroundColor: "rgba(37,99,235,0.15)",
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 },
                },
              },
            }}
          />

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3">
                    {deliveryView === "weekly"
                      ? "Day"
                      : deliveryView === "monthly"
                        ? "Month"
                        : "Year"}
                  </th>
                  <th className="text-right px-4 py-3">Deliveries</th>
                </tr>
              </thead>
              <tbody>
                {activeDeliveryData.map((item) => (
                  <tr key={item.label} className="border-b">
                    <td className="px-4 py-3">{item.label}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Assigned Orders */}
      {dashboardData.recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold">Recent Assigned Orders</h2>

            <Link
              to="/transporter/view-all-orders-by-transporter"
              className="text-blue-500 hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3">Order Number</th>
                  <th>Tracking</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {dashboardData?.recentOrders?.length > 0 ? (
                  dashboardData.recentOrders.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-4 font-medium">{item.orderNumber}</td>
                      <td> {item.trackingNumber || "-"}</td>

                      <td>{item.address?.fullName || "-"}</td>
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.orderStatus === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : item.orderStatus === "Out For Delivery"
                                ? "bg-blue-100 text-blue-700"
                                : item.orderStatus === "Shipped"
                                  ? "bg-red-100 text-red-700"
                                  : item.orderStatus === "Packed"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.orderStatus}
                        </span>
                      </td>

                      <td>₹{Number(item.payableAmount || 0).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-5">Quick Actions</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/transporter/view-all-orders-by-transporter">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3">
              View Orders
            </button>
          </Link>

          <Link to="/transporter/completed-deliveries">
            <button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3">
              Completed Deliveries{" "}
            </button>
          </Link>

          <Link to="/transporter/profile">
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl py-3">
              My Profile
            </button>
          </Link>

          <Link to="/transporter/today-deliveries">
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3">
              Today's Deliveries
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default TransporterDashboard;
