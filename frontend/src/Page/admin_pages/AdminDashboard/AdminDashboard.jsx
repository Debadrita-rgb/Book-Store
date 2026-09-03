import { MdEdit } from "react-icons/md";
import React, { useState, useEffect, useMemo } from "react";
import { FiBriefcase, FiClock, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../../config";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

import {
  FaRupeeSign,
  FaUsers,
  FaBook,
  FaShoppingCart,
  FaBuilding,
  FaTruck,
  FaTicketAlt,
} from "react-icons/fa";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);

  const [startDate, endDate] = dateRange;
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalBooks: 0,
      totalOrders: 0,
      totalCompanies: 0,
      totalTransporters: 0,
      totalCoupons: 0,
      revenue: 0,
    },
    orderStatusData: [],
    recentOrders: [],
    lowStockBooks: [],
    topSellingBooks: [],
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.post(
          `${BASE_URL}/admin/dashboard-data`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setDashboardData(res.data);
      } catch {
        toast.error("Failed to load dashboard");
      }
    };

    fetchDashboard();
  }, []);

  const cardsValue = [
    {
      title: "Total Revenue",
      value: `₹${dashboardData.stats?.revenue || 0}`,
      icon: FaRupeeSign,
      bg: "from-emerald-500 to-green-600",
      link: "/admin/view-all-orders",
    },
    {
      title: "Total Users",
      value: dashboardData.stats?.totalUsers || 0,
      icon: FaUsers,
      bg: "from-blue-500 to-indigo-600",
      link: "/admin/view-all-user",
    },
    {
      title: "Total Books",
      value: dashboardData.stats?.totalBooks || 0,
      icon: FaBook,
      bg: "from-orange-500 to-red-500",
      link: "/admin/view-all-book",
    },
    {
      title: "Total Orders",
      value: dashboardData.stats?.totalOrders || 0,
      icon: FaShoppingCart,
      bg: "from-purple-500 to-violet-600",
      link: "/admin/view-all-orders",
    },
    {
      title: "Total Companies",
      value: dashboardData.stats?.totalCompanies || 0,
      icon: FaBuilding,
      bg: "from-emerald-500 to-red-600",
      link: "/admin/view-all-company",
    },
    {
      title: "Total Transporters",
      value: dashboardData.stats?.totalTransporters || 0,
      icon: FaTruck,
      bg: "from-yellow-500 to-orange-500",
      link: "/admin/view-all-transporter",
    },
    {
      title: "Total Coupons",
      value: dashboardData.stats?.totalCoupons || 0,
      icon: FaTicketAlt,
      bg: "from-pink-500 to-rose-500",
      link: "/admin/view-all-coupon",
    },
  ];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const revenueBase = Number(dashboardData.stats?.revenue || 0);

  const monthlyRevenueData = useMemo(() => {
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
      const item = dashboardData.monthlyRevenue?.find(
        (m) => m._id === index + 1,
      );

      return {
        label: month,
        value: item?.revenue || 0,
      };
    });
  }, [dashboardData.monthlyRevenue]);

 const yearlyRevenueData = useMemo(() => {
   return (dashboardData.yearlyRevenue || []).map((item) => ({
     label: String(item._id),
     value: item.revenue,
   }));
 }, [dashboardData.yearlyRevenue]);

  const [revenueView, setRevenueView] = useState("monthly");

const activeRevenueData =
  revenueView === "monthly" ? monthlyRevenueData : yearlyRevenueData;

  const exportRevenueReport = () => {
    const rows = activeRevenueData.map((item) => [
      revenueView === "monthly" ? "Month" : "Year",
      item.label,
      item.value,
    ]);

    const csvContent = [
      [revenueView === "monthly" ? "Month" : "Year", "Revenue Label", "Revenue (INR)"],
      ...rows,
    ]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `revenue-${revenueView}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="dashboard-shell p-6 min-h-screen space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardsValue.map((card, index) => {
          const Icon = card.icon;

          return (
            <Link key={index} to={card.link}>
              <div
                className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-r ${card.bg}
            shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer`}
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full"></div>

                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm opacity-90">{card.title}</p>
                    <h2 className="text-3xl font-bold mt-2">{card.value}</h2>
                  </div>

                  <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                    <Icon className="text-3xl" />
                  </div>
                </div>

                <div className="mt-6 text-sm opacity-90 flex items-center gap-2 relative z-10">
                  <span>👉</span>
                  <span>Click to view details</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="dashboard-panel rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h2 className="text-xl font-bold dashboard-text">
            Revenue Overview
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setRevenueView("monthly")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition dashboard-filter-button ${
                revenueView === "monthly" ? "dashboard-filter-button-active" : ""
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setRevenueView("yearly")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition dashboard-filter-button ${
                revenueView === "yearly" ? "dashboard-filter-button-active" : ""
              }`}
            >
              Yearly
            </button>
            <button
              type="button"
              onClick={exportRevenueReport}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition"
            >
              Download CSV
            </button>
          </div>
        </div>

        <Line
          data={{
            labels: activeRevenueData.map((item) => item.label),
            datasets: [
              {
                label:
                  revenueView === "monthly"
                    ? "Monthly Revenue"
                    : "Yearly Revenue",
                data: activeRevenueData.map((item) => item.value),
                borderColor: "#f97316",
                backgroundColor: "rgba(249,115,22,0.15)",
                tension: 0.4,
                fill: true,
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
                ticks: {
                  callback: (value) => `₹${value}`,
                },
              },
            },
          }}
        />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left dark:text-white">
                  {revenueView === "monthly" ? "Month" : "Year"}
                </th>
                <th className="px-4 py-3 text-left dark:text-white">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {activeRevenueData.map((item) => (
                <tr key={item.label} className="border-t dark:border-gray-700">
                  <td className="px-4 py-3 dark:text-gray-200">{item.label}</td>
                  <td className="px-4 py-3 font-semibold text-orange-600 dark:text-orange-300">
                    {formatCurrency(item.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status */}
      {dashboardData?.orderStatusData?.length > 0 && (
        <div className="dashboard-panel rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-5 dashboard-text">Order Status Overview</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {dashboardData.orderStatusData.map((item) => (
              <div
                key={item._id}
                className="dashboard-stat-box rounded-xl p-5 text-center hover:shadow-md transition"
              >
                <h3 className="text-sm dashboard-caption">{item._id}</h3>

                <p className="text-3xl font-bold mt-2 text-orange-500">
                  {item.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {dashboardData?.recentOrders?.length > 0 && (
        <div className="dashboard-panel rounded-2xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold dashboard-text">Recent Orders</h2>

            <Link
              to="/admin/view-all-orders"
              className="text-orange-500 text-sm hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b dark:border-gray-700">
                  <th className="py-3">Order</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {dashboardData.recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b hover:bg-gray-200  transition"
                  >
                    <Link to={`/admin/view-order-details/${order._id}`}>
                      <td className="py-4">{order.orderNumber}</td>
                    </Link>
                    <td>{order.orderStatus}</td>
                    <td>{order.paymentStatus}</td>
                    <td className="font-semibold">₹{order.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Two Sections */}
      {(dashboardData?.lowStockBooks?.length > 0 ||
        dashboardData?.topSellingBooks?.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Low Stock */}
          {dashboardData?.lowStockBooks?.length > 0 && (
            <div className="dashboard-panel rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-5 dashboard-text">⚠️ Low Stock Books</h2>

              {dashboardData.lowStockBooks.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center py-3 border-b last:border-0 dark:border-gray-700"
                >
                  <Link
                    to={`/admin/view-single-book/${item.book._id}`}
                    className="flex items-center gap-3"
                  >
                    <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                      {item.book.title.length > 40
                        ? `${item.book.title.slice(0, 40)}...`
                        : item.book.title}
                    </span>
                  </Link>

                  <span className="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 px-3 py-1 rounded-full text-sm font-semibold">
                    {item.available_quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Top Selling */}
          {dashboardData?.topSellingBooks?.length > 0 && (
            <div className="dashboard-panel rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-5 dashboard-text">📚 Top Selling Books</h2>

              {dashboardData.topSellingBooks.map((book, index) => (
                <div
                  key={book._id}
                  className="flex justify-between items-center py-3 border-b last:border-0 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </span>

                    <Link
                      to={`/admin/view-single-book/${book._id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="font-medium">
                        {book.title.length > 40
                          ? `${book.title.slice(0, 40)}...`
                          : book.title}
                      </span>
                    </Link>
                  </div>

                  <span className="text-green-500 font-semibold">
                    {book.sold} sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="dashboard-panel rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-5 dashboard-text">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/addBook">
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 font-medium transition">
              + Add Book
            </button>
          </Link>

          <Link to="/admin/view-all-orders">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-medium transition">
              Orders
            </button>
          </Link>

          <Link to="/admin/add-company">
            <button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-medium transition">
              Company
            </button>
          </Link>

          <Link to="/admin/add-transporter">
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl py-3 font-medium transition">
              Transporter
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
