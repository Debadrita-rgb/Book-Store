import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TableComponent from "../../../Components/commonComponent/CrudComponent/TableComponent";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";
import { FiFilter } from "react-icons/fi";

const ViewCompanyTransporter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [transporters, setTransporter] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/company/get-all-transporters-by-company`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTransporter(data.transporters))
      .catch((err) => console.error("Fetch error:", err));
  }, []);


  const filteredTransporters = (transporters || [])
    .filter((transporter) => {
      const matchesSearch =
        transporter.userId?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transporter.userId?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .map((transporter, index) => ({
      Id: index + 1,
      Name: transporter.userId?.name,
      Email: transporter.userId?.email,
      Phone: transporter.userId?.phone,
      vehicleNumber: transporter.vehicleNumber,
      vehicleType: transporter.vehicleType,
      isAvailable: transporter.isAvailable,
      LicenseNumber: transporter.licenseNumber,
      id: transporter._id,
      isActive: transporter.isActive,
      editPath: `/company/edit-company-transporter/${transporter._id}`,
    }));

  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/company/toggle-status-for-transporter/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });
      const updated = await res.json();
      setTransporter((prev) =>
        prev.map((u) => (u._id === updated.updated._id ? updated.updated : u)),
      );
      toast.success(
        `Transporter ${isActive ? "activated" : "deactivated"} successfully`,
      );
    } catch (err) {
      toast.error("Status toggle failed");
    }
  };

  const handleToggleAvailable = async (id, isAvailable) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/company/toggle-availability-for-transporter/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAvailable }),
      });
      const updated = await res.json();
      setTransporter((prev) =>
        prev.map((u) => (u._id === updated.updated._id ? updated.updated : u)),
      );
      toast.success(
        `Transporter ${isAvailable ? "marked as available" : "marked as unavailable"} successfully`,
      );
    } catch (err) {
      toast.error("Availability toggle failed");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />
      
      <TableComponent
        title="Transporter"
        columns={[
          "Id",
          "Name",
          "Email",
          "vehicleNumber",
          "vehicleType",
        ]}
        data={filteredTransporters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleToggleActive={handleToggleActive}
        handleDelete={false}
        showAddButton={true}
        addPath="/company/add-company-transporter"
        showRecommendedeColumn={false}
        showAvailableColumn={true}
        handleToggleAvailable={handleToggleAvailable}
      />
    </div>
  );
};

export default ViewCompanyTransporter;
