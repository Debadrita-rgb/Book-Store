import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BASE_URL from "../../../../config";
import axios from "axios";

const transporterProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    transportername: "",
    email: "",
    phone: "",
    vehicleNumber: "",
    vehicleType: "",
    licenseNumber: "",
    isAvailable: "",
    isActive: "",
    currentAssignment: "",
  });

  useEffect(() => {
    const fetchTransporter = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/transporter/get-transporter-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setFormData({
            transportername: data.transporter.transportername || "",
            email: data.transporter.email || "",
            phone: data.transporter.phone || "",
            company: data.transporter?.company.companyName || "",
            vehicleNumber: data.transporter.vehicleNumber || "",
            vehicleType: data.transporter.vehicleType || "",
            licenseNumber: data.transporter.licenseNumber || "",
          });
        }
      } catch (error) {
        toast.error("Failed to load transporter");
      }
    };

    fetchTransporter();
  }, []);
  // console.log("Form Data:", formData);

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

    try {
      const res = await fetch(`${BASE_URL}/transporter/update-transporter-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Transporetr updated successfully");
      } else {
        toast.error(json.message || "Failed to update transporter");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <div className="w-full px-10 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1">Transporter Name</label>
          <input
            type="text"
            name="transportername"
            value={formData.transportername}
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
          <label className="block mb-1">Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            className="w-full p-3 border rounded-lg bg-gray-200"
            readOnly
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
            required
          />
        </div>

        <div>
          <label className="block mb-1">Vehicle Type</label>
          <input
            type="text"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block mb-1">License Number</label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>  

        <div className="col-span-2">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          >
            Update Transporter
          </button>
        </div>
      </div>
    </div>
  );
};

export default transporterProfile;
