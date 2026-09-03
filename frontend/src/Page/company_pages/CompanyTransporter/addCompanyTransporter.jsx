import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import BASE_URL from "../../../../config";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AddCompanyTransporter = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    vehicleNumber: "",
    vehicleType: "",
    phone: "",
    licenseNumber: "",
  });

  const [company, setCompany] = useState([]);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`${BASE_URL}/company/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCompany(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCompanyDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token);
    const companyId = decodedToken.id;

    const payload = {
      ...formData,
      companyId: companyId,
      companyName: company.companyName,
      name: formData.name.trim(),
    };
    try {
      const res = await fetch(`${BASE_URL}/company/add-transporter-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok) {
        toast.success(json.message || "Transporter added successfully");
        navigate("/company/view-all-transporter-by-company");
      } else {
        toast.error(json.error || json.message || "Failed to add transporter");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  return (
    <div className="w-full px-10 py-8 ">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1">Transporter Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Mobile Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Vehicle Number</label>
          <input
            type="text"
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-1">Vehicle Type</label>

          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select Vehicle</option>
            <option value="Bike">Bike</option>
            <option value="Scooter">Scooter</option>
            <option value="Car">Car</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">License Number</label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />
        </div>
        <div className="col-span-2">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          >
            Add Transporter
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCompanyTransporter;
