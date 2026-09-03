import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../config";
import logo from "../../assets/logo.png";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check email
  const handleCheckEmail = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/common/check-forgot-password`, {
        email: email.trim(),
      });

      if (res.data.success) {
        setEmailVerified(true);

        toast.success("Account found. Please create a new password.");
      }
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message || "You have no account with this email.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (!confirmPassword) {
      toast.error("Please confirm your password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Confirm Passwords and New Password do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.put(`${BASE_URL}/common/reset-password`, {
        email,
        newPassword,
      });

      if (res.data.success) {
        toast.success("Password changed successfully!");

        setTimeout(() => {
          navigate("/backend");
        }, 1000);
      }
    } catch (err) {
      console.error(err);

      toast.error(err.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={1500} />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Company Logo" className="h-20 object-contain" />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>

          <p className="text-gray-500 mt-2">
            {emailVerified
              ? "Create a new password for your account."
              : "Enter your email to find your account."}
          </p>
        </div>

        {!emailVerified ? (
          /*  EMAIL STEP  */
          <form onSubmit={handleCheckEmail}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>

            <div className="relative">

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="
                  w-full
                  pl-11
                  pr-4
                  py-3.5
                  rounded-xl
                  border border-gray-200
                  bg-gray-50
                  outline-none
                  focus:bg-white
                  focus:border-indigo-500
                  focus:ring-4
                  focus:ring-indigo-100
                "
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                mt-6
                py-3.5
                rounded-xl
                bg-gradient-to-r
                from-indigo-600
                to-purple-600
                text-white
                font-semibold
                hover:from-indigo-700
                hover:to-purple-700
                transition
                disabled:opacity-50
              "
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        ) : (
          /*  PASSWORD STEP  */
          <form onSubmit={handleResetPassword}>
            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                disabled
                className="
                  w-full
                  px-4
                  py-3
                  rounded-xl
                  border
                  bg-gray-100
                  text-gray-500
                "
              />
            </div>

            {/* New Password */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="
                    w-full
                    pl-11
                    pr-12
                    py-3.5
                    rounded-xl
                    border border-gray-200
                    bg-gray-50
                    outline-none
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
                    text-gray-500
                  "
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="
                    w-full
                    pl-11
                    pr-12
                    py-3.5
                    rounded-xl
                    border border-gray-200
                    bg-gray-50
                    outline-none
                    focus:bg-white
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                mt-7
                py-3.5
                rounded-xl
                bg-gradient-to-r
                from-indigo-600
                to-purple-600
                text-white
                font-semibold
                hover:from-indigo-700
                hover:to-purple-700
                transition
                disabled:opacity-50
              "
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Back to login */}
        <button
          type="button"
          onClick={() => navigate("/backend")}
          className="
            w-full
            mt-5
            text-sm
            text-gray-500
            hover:text-indigo-600
            transition
          "
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
