import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddBook.css"; // Import CSS file

const AddBook = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publishedYear: "",
    category_id: "",
    price: "",
    quantity: 1,
    description: "",
    coverImageLink: "",
  });

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/admin/get_categories");
        console.log(response.data);  // Debugging purposes
        setCategories(response.data);
      } catch (error) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.publishedYear || !formData.category_id || !formData.price) {
      toast.error("All required fields must be filled");
      return;
    }

    try {
      const token = localStorage.getItem("token"); 
      // Add book to backend with authorization token
      const response = await axios.post("http://localhost:3000/admin/add_book", 
        formData, 
        { 
          headers: { Authorization: `Bearer ${token}` }
        });
      
      toast.success(response.data.message);
      
      // Reset form after successful submission
      setFormData({
        title: "",
        author: "",
        publishedYear: "",
        category_id: "",
        price: "",
        quantity: 1,
        description: "",
        coverImageLink: "",
      });

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add book");
    }
  };

  return (
    <div className="add-book-container">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="p-6">

        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Author"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Published Year"
          value={formData.publishedYear}
          onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
          required
        />

        {/* Scrolling Dropdown for Categories */}
        <select
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        ></textarea>

        <input
          type="text"
          placeholder="Cover Image URL"
          value={formData.coverImageLink}
          onChange={(e) => setFormData({ ...formData, coverImageLink: e.target.value })}
        />

        <button type="submit" className="submit-button-book">Add Book</button>
      </form>
    </div>
  );
};

export default AddBook;
