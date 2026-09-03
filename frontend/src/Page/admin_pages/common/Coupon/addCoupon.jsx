import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DynamicForm from "../../../../Components/commonComponent/CrudComponent/DynamicFormComponent";
import BASE_URL from "../../../../../config";

const AddCoupon = () => {
  const navigate = useNavigate();

  const couponFields = [
    { name: "code", label: "Coupon Code", type: "text", value: "" },
    { name: "description", label: "Description", type: "tiptap" },
    {
      name: "discountType",
      label: "Discount Type",
      type: "select",
      options: [
        { label: "Percentage", value: "percentage" },
        { label: "Fixed", value: "fixed" },
      ],
      value: "percentage",
    },
    {
      name: "discountValue",
      label: "Discount Value",
      type: "number",
      value: 0,
    },
    {
      name: "minimumOrderAmount",
      label: "Minimum Order Amount",
      type: "number",
      value: 0,
    },
    {
      name: "maximumDiscountAmount",
      label: "Maximum Discount Amount",
      type: "number",
      value: 0,
    },
    { name: "startDate", label: "Start Date", type: "date", value: "" },
    { name: "endDate", label: "End Date", type: "date", value: "" },
    { name: "usageLimit", label: "Usage Limit", type: "number", value: 0 },
    { name: "isActive", label: "Active", type: "checkbox", value: true },
    { name: "isFeatured", label: "Featured", type: "checkbox", value: false },
  ];

  const handleAddCoupon = async (data) => {
    const token = localStorage.getItem("token");

    if (!data.code?.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    const payload = {
      ...data,
      discountValue: Number(data.discountValue || 0),
      minimumOrderAmount: Number(data.minimumOrderAmount || 0),
      maximumDiscountAmount: Number(data.maximumDiscountAmount || 0),
      usageLimit: Number(data.usageLimit || 0),
      usedCount: 0,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
    };

    try {
      const res = await fetch(`${BASE_URL}/admin/add-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Coupon added successfully");
        navigate("/admin/view-all-coupon");
      } else {
        toast.error(json.error || "Failed to add coupon");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add coupon");
    }
  };

  return (
    <div className="w-full px-10 py-8">
      <DynamicForm
        fields={couponFields}
        onSubmit={handleAddCoupon}
        submitText="Add Coupon"
      />
    </div>
  );
};

export default AddCoupon;
