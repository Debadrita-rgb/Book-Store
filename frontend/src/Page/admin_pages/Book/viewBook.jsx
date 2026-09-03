import React, { useState, useEffect } from "react";
import TableComponent from "../../../Components/commonComponent/CrudComponent/TableComponent";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import BASE_URL from "../../../../config";

const ViewBook = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
 
    fetch(`${BASE_URL}/admin/get-book-and-available-quantity`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);
// console.log(books, "books");
  const filteredItems = books
    .filter((item) =>
      (item.title || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()),
    )
    .map((item, index) => ({
      Id: index + 1,
      BookName: item.title,
      id: item._id,
      Author: item.author,
      Publisher: item.publisher,
      Published_Year: item.publishedYear,
      Quantity: item.available_quantity,
      isActive: item.isActive,
      isRecommended: item.isRecommended,
      editPath: `/admin/editBook/${item._id}`,
      viewPath: `/admin/view-single-book/${item._id}`,
    }));

  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/admin/toggle-book-status/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (!res.ok) throw new Error("Toggle failed");

      setBooks((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isActive } : item)),
      );

      toast.success(
        `Book ${isActive ? "activated" : "deactivated"} successfully`,
      );
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const handleToggleRecommended = async (id, isRecommended) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${BASE_URL}/admin/toggle-book-recommended/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isRecommended }),
        },
      );

      if (!res.ok) throw new Error("Toggle failed");

      setBooks((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRecommended } : item,
        ),
      );

      toast.success(
        `Book is ${isRecommended ? "Recommended" : "not Recommended"}`,
      );
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  // delete
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!id) {
      console.error("Invalid ID passed to delete.");
      toast.error("Invalid item selected for deletion.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`${BASE_URL}/admin/delete-book/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setBooks((prev) => prev.filter((item) => item._id !== id));
      toast.success("Book deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <span className="ml-4 text-blue-600 font-medium">
            Loading services...
          </span>
        </div>
      ) : (
        <div>
          <TableComponent
            title="Book"
            columns={[
              "Id",
              "BookName",
              "Quantity",
              "Author",
              "Publisher",
              "Published_Year",
            ]}
            data={filteredItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleToggleActive={handleToggleActive}
            showRecommendedeColumn={true}
            handleToggleRecommended={handleToggleRecommended}
            handleDelete={handleDelete}
            showAddButton={true}
            addPath="/admin/addBook"
            responsiveColumns={["BookName", "Quantity"]}
            showAvailableColumn={false}
          />
        </div>
      )}
    </div>
  );
};

export default ViewBook;
