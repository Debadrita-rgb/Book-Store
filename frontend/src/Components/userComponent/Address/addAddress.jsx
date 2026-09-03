import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import BASE_URL from "../../../../config";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddAddress = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);

  const [formData, setFormData] = useState({
    userId: decoded.id,
    fullName: "",
    mobileNumber: "",
    alternateMobileNumber: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    addressType: "Home",
    isDefault: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payLoad = {
      ...formData,
      isDefault: true,
    };
    try {
      const response = await axios.post(
        `${BASE_URL}/user/add-address`,
        payLoad,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/address");
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto  shadow rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Add New Address</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <input
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <input
            name="mobileNumber"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <input
            name="alternateMobileNumber"
            placeholder="Alternate Mobile Number"
            value={formData.alternateMobileNumber}
            onChange={handleChange}
            className="border p-3 rounded"
          />

          <input
            name="postalCode"
            placeholder="Postal Code"
            value={formData.postalCode}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <textarea
            name="addressLine1"
            placeholder="Address Line 1"
            value={formData.addressLine1}
            onChange={handleChange}
            className="border p-3 rounded md:col-span-2"
            required
          />

          <textarea
            name="addressLine2"
            placeholder="Address Line 2"
            value={formData.addressLine2}
            onChange={handleChange}
            className="border p-3 rounded md:col-span-2"
          />

          <input
            name="landmark"
            placeholder="Landmark"
            value={formData.landmark}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <input
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <input
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <input
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            className="border p-3 rounded"
          />

          <select
            name="addressType"
            value={formData.addressType}
            onChange={handleChange}
            className="border p-3 rounded"
          >
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Other">Other</option>
          </select>

          <div className="md:col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
            />

            <label>Set as Default Address</label>
          </div>

          <button
            type="submit"
            className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold"
          >
            Save Address
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAddress;
