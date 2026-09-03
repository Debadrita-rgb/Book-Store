import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BASE_URL from "../../../../config";
import axios from "axios";

const EditTransporter = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
      name: "",
      companyId: "",
      email: "",
      phone: "",
      vehicleNumber: "",
      vehicleType: "",
    });
    const [company, setCompany] = useState([]);

    useEffect(() => {
      const fetchCompany = async () => {
        try {
          const token = localStorage.getItem("token");

          const res = await axios.get(`${BASE_URL}/admin/get-company`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCompany(res.data);
        } catch (error) {
          console.error(error);
        }
      };

      fetchCompany();
    }, []);

  // Fetch existing category
  useEffect(() => {
    const fetchTransporter = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/admin/get-single-transporter/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        // console.log("Fetched transporter data:", data);
        setFormData({
          transportername: data.transportername,
          companyId: data.company?.companyId || "",
          email: data.email,
          phone: data.phone,
          vehicleNumber: data.vehicleNumber,
          vehicleType: data.vehicleType,
          licenseNumber: data.licenseNumber,
        });
      } catch (error) {
        toast.error("Failed to load transporter");
      }
    };

    fetchTransporter();
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
      const res = await fetch(`${BASE_URL}/admin/update-transporter-details/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok) {
        toast.success("Transporter updated successfully");
        navigate("/admin/view-all-transporter");
      } else {
        toast.error(json.error || "Failed to update transporter");
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
          <label className="block mb-1">Company Name</label>
          <select
            name="companyId"
            value={formData.companyId}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          >
            <option value="">Select Company</option>

            {company.map((item) => (
              <option key={item._id} value={item._id}>
                {item.companyName}
              </option>
            ))}
          </select>
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
            Edit Transporter
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTransporter;
