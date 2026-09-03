import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./BookCategory.css";
import { Link } from 'react-router-dom';

import axios from "axios"; // for making HTTP requests

const AddBookCategory = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories from backend here    
      const gettotalcategories = async (req, res) => {
        try {
          const response = await axios.get("http://localhost:3000/admin/get_categories");
          console.log(response.data);  // Debugging purposes
          setCategories(response.data);
        } catch (error) {
          toast.error("Failed to load categories");
        }
      };
      gettotalcategories();
  }, []);

  return (
    <div className="category-container">
      <div className="category-header">
        <button className="search-btn">Search</button>
        <Link className="add-btn" to="/admin/add-category">Add Category</Link>
      </div>

      <table className="category-table">
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>
                <FaEdit className="icon edit-icon" />
                <FaTrash className="icon delete-icon" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AddBookCategory;
