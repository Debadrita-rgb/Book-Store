import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/commonComponent/CrudComponent/TableComponent";
import { toast, ToastContainer } from "react-toastify";
import BASE_URL from "../../../../../config";

const ViewCoupon = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [coupons, setCoupons] = useState([]);

  const fetchCoupons = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${BASE_URL}/admin/get-coupon`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons(data);
      } else {
        toast.error(data.error || "Failed to load coupons");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load coupons");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredItems = (coupons || [])
    .filter((item) => {
      const searchValue =
        `${item.code || ""} ${item.description || ""} ${item.discountType || ""}`.toLowerCase();
      return searchValue.includes(searchTerm.toLowerCase());
    })
    .map((item, index) => ({
      Id: index + 1,
      Code: item.code,
      "Discount Type": item.discountType === "fixed" ? "Fixed" : "Percentage",
      "Discount Value": item.discountValue,
      id: item._id,
      isActive: item.isActive,
      editPath: `/admin/edit-coupon/${item._id}`,
    }));

  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${BASE_URL}/admin/toggle-coupon-status/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (!res.ok) throw new Error("Toggle failed");

      setCoupons((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isActive } : item)),
      );
      toast.success(
        `Coupon ${isActive ? "activated" : "deactivated"} successfully`,
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update coupon status");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await fetch(`${BASE_URL}/admin/delete-coupon/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setCoupons((prev) => prev.filter((item) => item._id !== id));
      toast.success("Coupon deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      <div>
        <TableComponent
          title="Coupon"
          columns={["Id", "Code", "Discount Type", "Discount Value"]}
          data={filteredItems}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleToggleActive={handleToggleActive}
          handleDelete={handleDelete}
          showAddButton={true}
          addPath="/admin/add-coupon"
          showRecommendedeColumn={false}
          showAvailableColumn={false}
        />
      </div>
    </div>
  );
};

export default ViewCoupon;
