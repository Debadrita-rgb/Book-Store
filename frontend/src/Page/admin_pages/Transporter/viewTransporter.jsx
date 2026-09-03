import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TableComponent from "../../../components/commonComponent/CrudComponent/TableComponent";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";
import { FiFilter } from "react-icons/fi";

const ViewTransporter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [transporters, setTransporter] = useState([]);
const [selectedCompany, setSelectedCompany] = useState("All");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/admin/get-all-transporters`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTransporter(data.transporters))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const companies = [
    "All",
    ...new Set(transporters.map((t) => t.company?.companyName).filter(Boolean)),
  ];

  const filteredTransporters = (transporters || [])
    .filter((transporter) => {
      const matchesSearch =
        transporter.userId?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transporter.userId?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCompany =
        selectedCompany === "All" ||
        transporter.company?.companyName === selectedCompany;

      return matchesSearch && matchesCompany;
    })
    .map((transporter, index) => ({
      Id: index + 1,
      Name: transporter.userId?.name,
      Email: transporter.userId?.email,
      Phone: transporter.userId?.phone,
      companyName: transporter.company?.companyName,
      vehicleNumber: transporter.vehicleNumber,
      vehicleType: transporter.vehicleType,
      isAvailable: transporter.isAvailable,
      LicenseNumber: transporter.licenseNumber,
      id: transporter._id,
      isActive: transporter.isActive,
      editPath: `/admin/edit-transporter/${transporter._id}`,
    }));

  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/admin/toggle-status-for-transporter/${id}`, {
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
      const res = await fetch(`${BASE_URL}/admin/toggle-availability-for-transporter/${id}`, {
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
      <div className="flex justify-end mb-5">
        <div className="flex items-center gap-3  border border-gray-200 rounded-xl shadow-sm px-4 py-3">
          <FiFilter className="text-blue-600 text-lg" />

          <label
            htmlFor="companyFilter"
            className="text-sm font-semibold text-gray-700"
          >
            Filter by Company
          </label>

          <select
            id="companyFilter"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="min-w-[220px] rounded-lg border border-gray-300  px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          >
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>
      </div>
      <TableComponent
        title="Transporter"
        columns={[
          "Id",
          "Name",
          "Email",
          "companyName",
          "vehicleNumber",
          "vehicleType",
        ]}
        data={filteredTransporters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleToggleActive={handleToggleActive}
        handleDelete={false}
        showAddButton={true}
        addPath="/admin/add-transporter"
        showRecommendedeColumn={false}
        showAvailableColumn={true}
        handleToggleAvailable={handleToggleAvailable}
      />
    </div>
  );
};

export default ViewTransporter;
