import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaArrowRight } from "react-icons/fa";
import BASE_URL from "../../../../config";
import axios from "axios";

const Category = () => {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/home-categories`);
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategory();
  }, []);

  return (
    <div className="py-16 section-bg">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mb-3">
            📚 Explore Our Collection
          </span>

          <h2 className="text-3xl md:text-4xl font-bold section-title">
            Browse by Category
          </h2>

          <p className="mt-3 section-text max-w-2xl mx-auto">
            {" "}
            Find your next favorite book from our wide collection of categories.
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {categories.map((category, index) => {
            const icons = ["📚", "📖", "🔬", "❤️", "🕵️", "🏛️"];

            return (
              <Link
                key={category.name}
                to={`/categorized-books/${encodeURIComponent(category.name)}`}
                className="group category-explore-card relative overflow-hidden rounded-3xl p-6 text-center transition-all duration-500 hover:-translate-y-3"
              >
                {/* Decorative Circle */}
                <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-orange-100/70 group-hover:scale-150 group-hover:bg-orange-200/70 transition-all duration-700 " />
                <div className="absolute -left-8 -bottom-8 w-20 h-20 rounded-full bg-orange-50 group-hover:scale-125 transition-all duration-700 " />

                {/* Icon */}
                <div
                  className="relative mx-auto mb-5 w-16 h-16 flex items-center justify-center rounded-2xl shadow-md group-hover:bg-orange-500
              group-hover:shadow-lg transition-all duration-500 "
                >
                  <span className="text-3xl group-hover:scale-125 group-hover:-rotate-6 transition-all duration-500 ">
                    {icons[index % icons.length]}
                  </span>
                </div>

                {/* Category */}
                <h3 className="relative font-bold category-name text-sm md:text-base group-hover:text-orange-500 transition-colors duration-300 line-clamp-1">
                  {category.name}
                </h3>

                {/* Book Count */}
                <div className="relative mt-3">
                  <span className="category-count inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold group-hover:bg-orange-100 group-hover:text-orange-600 transition-all duration-300">
                    📖 {category.books}
                  </span>
                </div>

                {/* Explore Arrow */}
                <div className="relative mt-5 flex justify-center">
                  <span className="category-arrow flex items-center justify-center w-9 h-9 rounded-full group-hover:bg-orange-500 group-hover:text-white group-hover:translate-x-2 transition-all duration-300 ">
                    <FaArrowRight className="text-xs" />
                  </span>
                </div>

                {/* Bottom Hover Line */}
                <div className="absolute bottom-0 left-1/2 w-0 h-1 bg-orange-500 group-hover:w-full group-hover:left-0 transition-all duration-500" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Category;
