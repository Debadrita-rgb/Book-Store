import { MdEdit } from "react-icons/md";
import React, { useState, useEffect, useMemo } from "react";
import { FiBriefcase, FiClock, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../../config";

import {
  FaBoxOpen,
  FaClock,
  FaBox,
  FaShippingFast,
  FaCheckCircle,
  FaChartLine,
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

const CompanyDashboard = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [orderView, setOrderView] = useState("weekly");
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentOrders: [],
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.post(
          `${BASE_URL}/company/dashboard-data`,
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

  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return days.map((day, index) => {
      const item = dashboardData.weeklyOrders?.find((d) => d._id === index + 1);
      return { label: day, value: item?.count || 0 };
    });
  }, [dashboardData.weeklyOrders]);

  const monthlyData = useMemo(() => {
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
      const item = dashboardData.monthlyOrders?.find(
        (m) => m._id === index + 1,
      );
      return { label: month, value: item?.count || 0 };
    });
  }, [dashboardData.monthlyOrders]);

  const yearlyData = useMemo(() => {
    return (dashboardData.yearlyOrders || []).map((y) => ({
      label: String(y._id),
      value: y.count,
    }));
  }, [dashboardData.yearlyOrders]);

  const activeData =
    orderView === "weekly"
      ? weeklyData
      : orderView === "monthly"
        ? monthlyData
        : yearlyData;

  const exportOrdersCSV = () => {
    const header =
      orderView === "weekly"
        ? "Day"
        : orderView === "monthly"
          ? "Month"
          : "Year";

    const csv = [
      [header, "Orders"],
      ...activeData.map((item) => [item.label, item.value]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${orderView}-orders-report.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const cardsValue = [
    {
      title: "Total Orders",
      value: dashboardData.stats.totalOrders || 0,
      icon: FaBoxOpen,
      bg: "from-blue-500 to-indigo-600",
    },
    {
      title: "Packed",
      value: dashboardData.stats.packedOrders || 0,
      icon: FaBox,
      bg: "from-purple-500 to-violet-600",
    },
    {
      title: "Shipped",
      value: dashboardData.stats.shippedOrders || 0,
      icon: FaShippingFast,
      bg: "from-red-500 to-blue-600",
    },
    {
      title: "Out For Delivery",
      value: dashboardData.stats.outForDeliveryOrders || 0,
      icon: FaClock,
      bg: "from-yellow-500 to-orange-500",
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
      icon: FaChartLine,
      bg: "from-pink-500 to-rose-500",
    },
  ];

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

      {/* Chart */}
      {dashboardData.stats.totalOrders > 0 && (
        <div className="dashboard-panel rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold dashboard-text">
                Orders Overview
              </h2>
              <p className="text-sm dashboard-caption">
                View weekly, monthly and yearly order trends.
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setOrderView("weekly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium dashboard-filter-button ${
                  orderView === "weekly" ? "dashboard-filter-button-active" : ""
                }`}
              >
                Weekly
              </button>

              <button
                onClick={() => setOrderView("monthly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium dashboard-filter-button ${
                  orderView === "monthly" ? "dashboard-filter-button-active" : ""
                }`}
              >
                Monthly
              </button>

              <button
                onClick={() => setOrderView("yearly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium dashboard-filter-button ${
                  orderView === "yearly" ? "dashboard-filter-button-active" : ""
                }`}
              >
                Yearly
              </button>

              <button
                onClick={exportOrdersCSV}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Download CSV
              </button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="dashboard-stat-box rounded-xl p-4">
              <p className="text-sm text-blue-600">Total Orders</p>
              <p className="text-2xl font-bold dashboard-text">
                {dashboardData.stats.totalOrders}
              </p>
            </div>

            <div className="dashboard-stat-box-green rounded-xl p-4">
              <p className="text-sm text-green-600">
                Highest{" "}
                {orderView === "weekly"
                  ? "Day"
                  : orderView === "monthly"
                    ? "Month"
                    : "Year"}
              </p>
              <p className="text-2xl font-bold dashboard-text">
                {
                  activeData.reduce((a, b) => (a.value > b.value ? a : b), {
                    label: "-",
                    value: 0,
                  }).label
                }
              </p>
            </div>

            <div className="dashboard-stat-box-orange rounded-xl p-4">
              <p className="text-sm text-orange-600">Peak Orders</p>
              <p className="text-2xl font-bold dashboard-text">
                {activeData.reduce((max, item) => Math.max(max, item.value), 0)}
              </p>
            </div>
          </div>

          <Line
            data={{
              labels: activeData.map((item) => item.label),
              datasets: [
                {
                  label: `${
                    orderView.charAt(0).toUpperCase() + orderView.slice(1)
                  } Orders`,
                  data: activeData.map((item) => item.value),
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
                legend: {
                  display: true,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                  },
                },
              },
            }}
          />

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 dashboard-text">
                    {orderView === "weekly"
                      ? "Day"
                      : orderView === "monthly"
                        ? "Month"
                        : "Year"}
                  </th>
                  <th className="text-right px-4 py-3 dashboard-text">Orders</th>
                </tr>
              </thead>
              <tbody>
                {activeData.map((item) => (
                  <tr key={item.label} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3 dashboard-caption">{item.label}</td>
                    <td className="px-4 py-3 text-right font-semibold dashboard-text">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {dashboardData.recentOrders.length > 0 && (
        <div className="dashboard-panel rounded-2xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold dashboard-text">Recent Orders</h2>

            <Link
              to="/company/view-all-orders-by-company"
              className="text-blue-500 hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3">Order</th>
                  <th>Tracking</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {dashboardData?.recentOrders?.length > 0 ? (
                  dashboardData.recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <Link
                        to={`/company/view-company-order-details/${order._id}`}
                      >
                        <td className="py-4">{order.orderNumber}</td>
                      </Link>
                      <td> {order.trackingNumber || "-"}</td>
                      <td>{order.orderStatus}</td>
                      <td>{order.paymentStatus}</td>
                      <td>₹{order.payableAmount}</td>
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
          <Link to="/company/view-all-orders-by-company">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3">
              View Orders
            </button>
          </Link>

          <Link to="/company/profile">
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl py-3">
              Profile
            </button>
          </Link>

          <Link to="/company/reports">
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3">
              Reports
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default CompanyDashboard;
