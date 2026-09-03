import React, {useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./showBook.css";
import { Link } from 'react-router-dom';
import axios from "axios";


const showBook = () => {
    const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async() => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/admin/get_books', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(response.data);
            setBooks(response.data);
        } catch (error) {
            console.error(error);
        }
    };
    fetchBooks();
  }, []);

  return (
    <div className="category-container">
      <div className="category-header">
        <button className="search-btn">Search</button>
        <Link className="add-btn" to="/admin/add-book">Add Book</Link>
      </div>

      <table className="category-table">
        <thead>
          <tr>
            <th>Book Name</th>
            <th>Author Name</th>
            <th>Category</th>
            <th>Published Year</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.category_id?.name || "No Category"}</td>
              <td>{book.publishedYear}</td>
              <td>{book.price}</td>
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

export default showBook;

