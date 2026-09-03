import React, { useState, useEffect } from "react";
import TableComponent from "../../../../Components/commonComponent/CrudComponent/TableComponent";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import BASE_URL from "../../../../../config";

const ViewLanguage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [language, setLanguage] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/admin/get-language`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLanguage(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredItems = (language || [])
    .filter(
      (item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((item, index) => {
      return {
        Id: index + 1,
        Language: item.title,
        Type: item.type,
        id: item._id,
        isActive: item.isActive,
        editPath: `/admin/edit-language/${item._id}`,
      };
    });

  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${BASE_URL}/admin/toggle-Language-status/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive }),
        }
      );

      if (!res.ok) throw new Error("Toggle failed");

      setLanguage((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isActive } : item))
      );

      toast.success(
        `Language ${isActive ? "activated" : "deactivated"} successfully`
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
      const res = await fetch(
        `${BASE_URL}/admin/delete-language/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setLanguage((prev) => prev.filter((item) => item._id !== id));
      toast.success("Language deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      <div>
        <TableComponent
          title="Language"
          columns={["Id", "Language"]}
          data={filteredItems}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleToggleActive={handleToggleActive}
          handleDelete={handleDelete}
          showAddButton={true}
          addPath="/admin/add-language"
          showRecommendedeColumn={false}
          showAvailableColumn={false}
        />
      </div>
    </div>
  );
};

export default ViewLanguage;
