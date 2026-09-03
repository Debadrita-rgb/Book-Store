import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import BASE_URL from "../../../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Newsletter = () => {
  const [formData, setFormData] = useState({
    email: "",
    status: "Newsletter",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/user/submit-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(result.message);

        setFormData({
          email: "",
        });
      } else {
        toast.error(result.message || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-5">
          <FaBookOpen className="text-orange-500 text-4xl" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900">Stay in the Story</h2>

        <p className="mt-2 text-gray-500 text-sm leading-6">
          Subscribe to get updates about new books, latest arrivals, and
          exclusive offers.
        </p>
        <form onSubmit={handleSubmit} className="mt-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>

              <input
                id="newsletter-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 
                     text-gray-700 placeholder-gray-400 outline-none
                     focus:border-orange-500 focus:ring-2 focus:ring-orange-100
                     transition"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600
                   text-white font-semibold transition duration-300
                   shadow-sm hover:shadow-md"
            >
              Subscribe
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            We respect your privacy. You can unsubscribe anytime.
          </p>
        </form>
      </div>
    </section>
  );
};
export default Newsletter;
