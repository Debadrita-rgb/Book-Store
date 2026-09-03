import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TableComponent from "../../../Components/commonComponent/CrudComponent/TableComponent";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";

const ViewUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/admin/get-all-users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredUsers = (users || [])
    .filter((user) => user.role === "user")
    .filter((user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .map((user, index) => ({
      Id: index + 1,
      Name: user.name,
      Email: user.email,
      id: user._id,
      isActive: user.isActive,
      viewPath: `/admin/view-single-user/${user._id}`,
      orderPath: `/admin/view-ordered-single-user/${user._id}`,
    }));

  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${BASE_URL}/admin/toggle-user-status/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive }),
        }
      );
      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u._id === updated.updated._id ? updated.updated : u))
      );
      toast.success(
        `User ${isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      toast.error("Status toggle failed");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      <TableComponent
        title="User"
        columns={["Id", "Name", "Email"]}
        data={filteredUsers}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleToggleActive={handleToggleActive}
        handleDelete={false}
        showAddButton={false}
        showRecommendedeColumn={false}
        showAvailableColumn={false}
      />
    </div>
  );
};

export default ViewUser;
