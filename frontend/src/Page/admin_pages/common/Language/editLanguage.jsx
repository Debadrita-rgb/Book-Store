import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DynamicForm from "../../../../components/commonComponent/CrudComponent/DynamicFormComponent";
import BASE_URL from "../../../../../config";

const EditLanguage = () => {
  const { id } = useParams();
  const [language, setLanguage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/admin/get-single-language/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setLanguage(data))
      .catch((err) => console.error("Error fetching Language:", err));
  }, [id]);

  const handleSubmit = async (formData) => {
    const token = localStorage.getItem("token");
    const payload = {
      ...formData,
      type: "Movie",
    };
    try {
      const res = await fetch(
        `${BASE_URL}/admin/update-language/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error("Update failed");
      toast.success("Language updated successfully");
      navigate("/admin/view-all-language");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update failed");
    }
  };

  if (!language) return <div>Loading...</div>;

  const fields = [
    {
      name: "title",
      label: "Language",
      value: language.title,
    },
    
  ];

  return (
    <div className="p-6">
      <DynamicForm
        fields={fields}
        onSubmit={handleSubmit}
        submitText="Update Language"
      />
    </div>
  );
};

export default EditLanguage;
