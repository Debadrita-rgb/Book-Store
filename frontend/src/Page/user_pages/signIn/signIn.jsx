import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/AuthContext";
import BASE_URL from "../../../../config";
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignIn() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    cpassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password, cpassword } = formData;

    if (!password) {
      toast.error("Please enter a new password");
      return;
    }

    if (!cpassword) {
      toast.error("Please confirm your password");
      return;
    }

    if (password !== cpassword) {
      toast.error("Confirm Passwords and New Password do not match");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/user/login`, {
        email,
        password,
      });
      if (response.data.success) {
        // console.log(response.data)
        const role = "USER";
        const userRole = role.toLowerCase();

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userName", response.data.name);
        localStorage.setItem("role", userRole);

        try {
          login(response.data.token, userRole);
        } catch (loginError) {
          console.error("Login function error:", loginError);
        }

        toast.success("Login Successful!");
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 2000);
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Something went wrong";
      console.error("Error during login:", errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="min-h-screen section-bg flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <div className="auth-card backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="auth-icon mx-auto mb-5 w-16 h-16 rounded-2xl
                        flex items-center justify-center"
              >
                <span className="text-2xl text-white">🔐</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold section-title">
                Welcome Back
              </h2>

              <p className="section-text mt-2 text-sm">
                Sign in to continue to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold section-label mb-2"
                >
                  Email Address
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
                    className="auth-input w-full pl-11 pr-4 py-3.5 rounded-xl outline-none transition"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold section-label mb-2"
                >
                  New Password
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
                    className="auth-input w-full pl-11 pr-12 py-3.5 rounded-xl outline-none transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-eye absolute right-3 top-1/2 -translate-y-1/2
                         w-9 h-9 flex items-center justify-center
                         rounded-lg transition"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="cpassword"
                  className="block text-sm font-semibold section-label mb-2"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    id="cpassword"
                    name="cpassword"
                    type={showCPassword ? "text" : "password"}
                    value={formData.cpassword}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    required
                    className="auth-input w-full pl-11 pr-12 py-3.5 rounded-xl outline-none transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCPassword(!showCPassword)}
                    className="auth-eye absolute right-3 top-1/2 -translate-y-1/2
                         w-9 h-9 flex items-center justify-center
                         rounded-lg transition"
                  >
                    {showCPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              {/* Login */}
              <button
                type="submit"
                className="auth-submit w-full py-3.5 rounded-xl
                     text-white font-semibold
                     hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign In
              </button>
            </form>

            {/* Forgot Password */}
            <div className="mt-3 text-right">
              <Link
                to="/forgot-password"
                className="auth-link text-sm font-semibold transition"
              >
                Forgot password?
              </Link>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-7">
              <div className="flex-1 h-px auth-divider" />

              <span className="text-xs section-muted">NEW HERE?</span>

              <div className="flex-1 h-px auth-divider" />
            </div>

            {/* Signup */}
            <p className="text-center text-sm section-text">
              Don't have an account?{" "}
              <Link to="/signup" className="auth-link font-semibold transition">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
