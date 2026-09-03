import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaEnvelope, FaLock, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";

const UserForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}/user/forgot-password/send-otp`,
        {
          email: email.trim().toLowerCase(),
        },
      );

      if (res.data.success) {
        toast.success("OTP sent to your email");

        setStep(2);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "You have no account with this email",
      );
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}/user/forgot-password/verify-otp`,
        {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        },
      );

      if (res.data.success) {
        toast.success("OTP verified successfully");

        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // RESET PASSWORD
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password) {
      toast.error("Please enter a new password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== cpassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/user/forgot-password/reset`, {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data.success) {
        toast.success("Password reset successfully");

        setTimeout(() => {
          navigate("/signin");
        }, 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-h-screen flex items-center justify-center px-4 py-10">
      {" "}
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="w-full max-w-xl">
        {/* Card */}
        <div className="auth-card rounded-3xl p-7 sm:p-9">
          {" "}
          {/* Logo / Icon */}
          <div className="flex justify-center mb-5">
            <div className="auth-icon w-16 h-16 rounded-2xl flex items-center justify-center">
              {" "}
              {step === 1 && <FaEnvelope className="text-white text-2xl" />}
              {step === 2 && <FaKey className="text-white text-2xl" />}
              {step === 3 && <FaLock className="text-white text-2xl" />}
            </div>
          </div>
          {/* Heading */}
          <div className="text-center mb-7">
            {step === 1 && (
              <>
                <h2 className="auth-title text-3xl font-bold">
                  {" "}
                  Forgot Password?
                </h2>

                <p className="auth-description mt-2 text-sm">
                  {" "}
                  Enter your email and we'll send you an OTP
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-3xl font-bold text-gray-900">Verify OTP</h2>

                <p className="text-gray-500 mt-2 text-sm">
                  Enter the OTP sent to
                </p>

                <p className="auth-highlight font-semibold mt-1">{email}</p>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-3xl font-bold text-gray-900">
                  Create New Password
                </h2>

                <p className="text-gray-500 mt-2 text-sm">
                  Enter your new password below
                </p>
              </>
            )}
          </div>
          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="auth-label block text-sm font-semibold mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="auth-input pl-11 pr-4 py-3.5 rounded-xl"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}
          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="auth-label block text-sm font-semibold mb-2">
                  Enter OTP
                </label>

                <div className="relative">
                  <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="auth-input pl-11 pr-4 py-3.5 rounded-xl tracking-[0.4em] text-center font-bold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit w-full py-3.5 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="auth-link w-full text-sm"
              >
                Change Email
              </button>
            </form>
          )}
          {/* STEP 3 */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="auth-label block text-sm font-semibold mb-2">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="auth-input pl-11 pr-11 py-3.5 rounded-xl"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-eye absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="auth-label block text-sm font-semibold mb-2">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={showCPassword ? "text" : "password"}
                    value={cpassword}
                    onChange={(e) => setCpassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="auth-input pl-11 pr-11 py-3.5 rounded-xl"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowCPassword(!showCPassword)}
                    className="auth-eye absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg"
                  >
                    {showCPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit w-full py-3.5 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>
          )}
          {/* Back to Login */}
          <div className="mt-7 text-center">
            <Link to="/signin" className="auth-back text-sm font-semibold">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForgotPassword;
