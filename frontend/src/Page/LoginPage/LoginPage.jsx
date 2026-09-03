import React, { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../assets/logo.png";
import BASE_URL from "../../../config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/common/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      toast.success("🎉 Login successful!", {
        autoClose: 3000,
        pauseOnFocusLoss: false,
      });

      const userRole = data.role?.toLowerCase();
      login(data.token, userRole);

      setTimeout(() => {
        if (userRole === "admin") navigate("/admin/dashboard");
        if (userRole === "transporter") navigate("/transporter/dashboard");
        if (userRole === "company") navigate("/company/dashboard");
      }, 1000);
    } catch (error) {
      const errorMessage = error.message || "Login failed";
      toast.error(errorMessage);
      setErrors({ server: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-4">
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
      />

      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
          {/* LEFT - LOGIN */}
          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
            <div className="w-full max-w-md">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="bg-white rounded-2xl p-2 shadow-md">
                  <img
                    src={logo}
                    alt="Company Logo"
                    className="h-20 sm:h-24 w-auto object-contain"
                  />
                </div>
              </div>

              {/* Heading */}
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Welcome Back
                </h1>

                <p className="text-gray-500 mt-2 text-sm sm:text-base">
                  Login to continue to your account
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>

                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400  
                      outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mt-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="
                      w-full
                      pl-11 pr-12
                      py-3.5
                      rounded-xl
                      border border-gray-200
                      bg-gray-50
                      text-gray-900
                      placeholder-gray-400
                      outline-none
                      transition-all
                      focus:bg-white
                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-100
                    "
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      w-9
                      h-9
                      flex
                      items-center
                      justify-center
                      rounded-lg
                      text-gray-500
                      hover:bg-gray-200
                      hover:text-gray-800
                      transition
                    "
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={() => navigate("/backend/forgot-password")}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="
                  w-full
                  mt-7
                  py-3.5
                  rounded-xl
                  bg-gradient-to-r
                  from-indigo-600
                  to-purple-600
                  hover:from-indigo-700
                  hover:to-purple-700
                  text-white
                  font-semibold
                  shadow-lg
                  shadow-indigo-200
                  hover:shadow-xl
                  hover:-translate-y-0.5
                  transition-all
                  duration-300
                  cursor-pointer
                "
                >
                  Log In
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-7">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">SECURE LOGIN</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <p className="text-center text-sm text-gray-500">
                  Welcome back! We're happy to see you again.
                </p>
              </form>
            </div>
          </div>

          {/* RIGHT - IMAGE */}
          <div className="hidden md:flex relative bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-800 items-center justify-center overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-white/10 rounded-full" />

            <div className="relative z-10 flex flex-col items-center justify-center p-10 text-center">
              <h2 className="text-3xl font-bold text-white mt-8">
                Discover Your Next Story
              </h2>

              <p className="text-white/80 max-w-sm mt-3 leading-7">
                Explore books, manage your account, and continue your reading
                journey with us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
