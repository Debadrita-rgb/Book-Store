import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaArrowRight } from "react-icons/fa";
import BASE_URL from "../../../../../config";
import axios from "axios";

const CategorySection = () => {
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
    <section className="py-10 section-bg">
      <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="section-subtitle font-semibold">Explore</p>

              <h2 className="text-3xl font-bold section-title">
                Browse by Category
              </h2>
            </div>

            {categories.length > 6 && (
              <Link
                to="/categories"
                className="hidden md:flex items-center gap-2 section-link font-semibold"
              >
                View All
                <FaArrowRight />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.name}
                to={`/categorized-books/${encodeURIComponent(category.name)}`}
                className="card-theme rounded-2xl p-6 text-center"
              >
                <div className="card-theme card-hover rounded-xl p-6">
                  <h3 className="font-bold">{category.name}</h3>

                  <p className="card-muted text-sm mt-1">{category.books}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
    </section>
  );
};
export default CategorySection;
