import React, { useState } from "react";
import "./AddBookCategory.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"; 

import axios from "axios"; // for making HTTP requests

const AddBookCategory = ({ onSubmit }) => {
  const navigate = useNavigate(); // for react-router v6
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName) {
      toast.error("Category name is required!");
      return;
    }

    try {
      // Get JWT token from localStorage (or any auth state management)
      const token = localStorage.getItem("token"); 
      
      if (!token) {
        toast.error("Unauthorized! Please log in.");
        return;
      }

      // Send POST request with JWT authentication
      const response = await axios.post(
        "http://localhost:3000/admin/add_book_category",
        { name: categoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token in headers
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Category added successfully! 🎉");
      setTimeout(() => {
        navigate("/admin/show-category"); // Redirect after 3 seconds
      }, 3000);
      setCategoryName(""); // Clear input field

    } catch (error) {
      if (error.response) {
        if (error.response.status === 403) {
          toast.error("Unauthorized! Only admins can add categories.");
        } else if (error.response.status === 400) {
          toast.error("Category already exists.");
        } else {
          toast.error("Server error! Try again later.");
        }
      } else {
        toast.error("Failed to connect to server.");
      }
    }
  };


  return (
    <div className="category-form-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <form onSubmit={handleSubmit} className="category-form">
        <label>Category Name:</label>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter category name"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddBookCategory;
