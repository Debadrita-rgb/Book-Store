import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaTruck, FaShieldAlt, FaHeadset } from "react-icons/fa";
const WhyChooseUs = () => {
  
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-orange-500 font-semibold">Why Choose Us</p>

          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            Everything You Need for Your Reading Journey
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className=" p-8 rounded-xl text-center shadow-sm">
            <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-orange-100 text-orange-500 text-2xl">
              <FaTruck />
            </div>

            <h3 className="mt-5 font-bold text-xl">Fast Delivery</h3>

            <p className="mt-3 text-gray-500">
              Get your favorite books delivered safely and quickly to your
              doorstep.
            </p>
          </div>

          <div className=" p-8 rounded-xl text-center shadow-sm">
            <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-orange-100 text-orange-500 text-2xl">
              <FaShieldAlt />
            </div>

            <h3 className="mt-5 font-bold text-xl">Secure Payment</h3>

            <p className="mt-3 text-gray-500">
              Your payments are protected with secure and trusted payment
              methods.
            </p>
          </div>

          <div className=" p-8 rounded-xl text-center shadow-sm">
            <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-orange-100 text-orange-500 text-2xl">
              <FaHeadset />
            </div>

            <h3 className="mt-5 font-bold text-xl">Customer Support</h3>

            <p className="mt-3 text-gray-500">
              Our support team is always ready to help whenever you need us.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
export default WhyChooseUs;