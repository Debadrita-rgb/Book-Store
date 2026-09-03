import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const signUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/user/signup`, formData);
      toast.success(res.data.message || "Signup successful!");
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Try again.",
      );
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="min-h-screen section-bg flex justify-center p-4">
        <div className="w-full max-w-xl">
          <div className="auth-card backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10 mt-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">Sign Up</h2>
            </div>

            <form
              onSubmit={handleSubmit}
              method="POST"
              className="space-y-6"
              autoComplete="off"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Name{" "}
                </label>

                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-4focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email address
                </label>

                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-4focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-4focus:ring-indigo-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm">
              Have an account?{" "}
              <Link
                to="/signin"
                className="font-semibold text-indigo-600 hover:text-purple-600 transition"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default signUp;
