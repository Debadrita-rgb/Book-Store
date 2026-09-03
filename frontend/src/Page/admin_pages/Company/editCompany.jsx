import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BASE_URL from "../../../../config";
import axios from "axios";

const EditCompany = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    mobileNumber: "",
  });

  // Fetch existing category
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/admin/get-single-company/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        // console.log("Fetched transporter data:", data);
        setFormData({
          companyName: data.companyName,
          email: data.email,
          mobileNumber: data.mobileNumber,
        });
      } catch (error) {
        toast.error("Failed to load company");
      }
    };

    fetchCompany();
  }, [id]);
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

    const payload = {
      ...formData,
    };

    try {
      const res = await fetch(`${BASE_URL}/admin/update-company-details/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok) {
        toast.success("Company updated successfully");
        navigate("/admin/view-all-company");
      } else {
        toast.error(json.error || "Failed to update company");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <div className="w-full px-10 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
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
            name="mobileNumber"
            value={formData.mobileNumber}
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
            Update Company
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCompany;
