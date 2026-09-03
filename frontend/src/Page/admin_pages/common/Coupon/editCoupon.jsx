import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DynamicForm from "../../../../Components/commonComponent/CrudComponent/DynamicFormComponent";
import BASE_URL from "../../../../../config";

const EditCoupon = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/admin/get-single-coupon/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCoupon(data))
      .catch((err) => console.error("Error fetching coupon:", err));
  }, [id]);

  const formatDateValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  };

  const handleSubmit = async (formData) => {
    const token = localStorage.getItem("token");

    if (!formData.code?.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    const payload = {
      ...formData,
      discountValue: Number(formData.discountValue || 0),
      minimumOrderAmount: Number(formData.minimumOrderAmount || 0),
      maximumDiscountAmount: Number(formData.maximumDiscountAmount || 0),
      usageLimit: Number(formData.usageLimit || 0),
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : null,
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : null,
      isActive: formData.isActive ?? true,
      isFeatured: formData.isFeatured ?? false,
    };

    try {
      const res = await fetch(`${BASE_URL}/admin/update-coupon/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Coupon updated successfully");
      navigate("/admin/view-all-coupon");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update failed");
    }
  };

  if (!coupon) return <div className="p-6">Loading...</div>;

  const fields = [
    {
      name: "code",
      label: "Coupon Code",
      type: "text",
      value: coupon.code || "",
    },
    {
      name: "description",
      label: "Description",
      type: "tiptap" ,
      value: coupon.description || "",
    },
    {
      name: "discountType",
      label: "Discount Type",
      type: "select",
      options: [
        { label: "Percentage", value: "percentage" },
        { label: "Fixed", value: "fixed" },
      ],
      value: coupon.discountType || "percentage",
    },
    {
      name: "discountValue",
      label: "Discount Value",
      type: "number",
      value: coupon.discountValue ?? 0,
    },
    {
      name: "minimumOrderAmount",
      label: "Minimum Order Amount",
      type: "number",
      value: coupon.minimumOrderAmount ?? 0,
    },
    {
      name: "maximumDiscountAmount",
      label: "Maximum Discount Amount",
      type: "number",
      value: coupon.maximumDiscountAmount ?? 0,
    },
    {
      name: "startDate",
      label: "Start Date",
      type: "date",
      value: formatDateValue(coupon.startDate),
    },
    {
      name: "endDate",
      label: "End Date",
      type: "date",
      value: formatDateValue(coupon.endDate),
    },
    {
      name: "usageLimit",
      label: "Usage Limit",
      type: "number",
      value: coupon.usageLimit ?? 0,
    },
    {
      name: "isActive",
      label: "Active",
      type: "checkbox",
      value: coupon.isActive ?? true,
    },
    {
      name: "isFeatured",
      label: "Featured",
      type: "checkbox",
      value: coupon.isFeatured ?? false,
    },
  ];

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />
      <DynamicForm
        fields={fields}
        onSubmit={handleSubmit}
        submitText="Update Coupon"
      />
    </div>
  );
};

export default EditCoupon;
