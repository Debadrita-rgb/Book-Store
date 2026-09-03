import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../../config";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddressList = () => {
  const [allAddresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const navigate = useNavigate();

  const getAddress = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/user/get-address`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setAddresses(response.data.data);
        const defaultAddress = response.data.data.find((a) => a.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAddress();
  }, []);

  const changeDefaultAddress = async (addressId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/user/set-default/${addressId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      getAddress();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteAddress = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${BASE_URL}/user/delete-address/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Address deleted successfully");

      getAddress(); 
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold">Select Delivery Address</h2>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => navigate("/add-address")}
          >
            + Add Address
          </button>
        </div>

        {allAddresses.length > 0 ? (
          allAddresses.map((item) => (
            <div
              key={item._id}
              //   className="border rounded-lg p-4 mb-4 shadow-sm"
              className="rounded-2xl shadow-md p-4 sm:p-5 relative"
            >
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => navigate(`/edit-address/${item._id}`)}
                  className="p-2 rounded-full border hover:bg-gray-100"
                >
                  <FaEdit />
                </button>

                <button
                  onClick={() => deleteAddress(item._id)}
                  className="p-2 rounded-full border border-red-500 text-red-500 hover:bg-red-50"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="flex items-start gap-3">
                <div className="pt-2">
                  <input
                    type="checkbox"
                    checked={item.isDefault}
                    onChange={() => changeDefaultAddress(item._id)}
                    className="w-5 h-5 accent-red-500 cursor-pointer"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">{item.fullName}</h3>

                  <p>{item.mobileNumber}</p>

                  {item.alternateMobileNumber && (
                    <p>Alt. Mobile Number: {item.alternateMobileNumber}</p>
                  )}

                  <p>AddressLine1: {item.addressLine1}</p>
                  {item.addressLine2 && (
                    <p>AddressLine2: {item.addressLine2}</p>
                  )}

                  {item.landmark && <p>Landmark: {item.landmark}</p>}

                  <p>
                    {item.city}, {item.state} - {item.country} -{" "}
                    {item.postalCode}
                  </p>
                  {item.addressType && <p>Address Type: {item.addressType}</p>}

                  {item.isDefault && (
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                      Default
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No address found.</p>
        )}
      </div>
    </div>
  );
};

export default AddressList;
