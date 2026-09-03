import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DynamicForm from "../../../../components/commonComponent/CrudComponent/DynamicFormComponent";
import BASE_URL from "../../../../../config";

const AddLanguage = () => {
  const navigate = useNavigate();

  const languageFields = [
    { name: "title", label: "Language", type: "text" },
    
  ];

  const handleAddLanguage = async (data) => {
    const token = localStorage.getItem("token");
    const payload = {
      ...data,
      type: "Movie",
    };
    try {
      const res = await fetch(`${BASE_URL}/admin/add-language`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Language added successfully");
        navigate("/admin/view-all-language");
      } else {
        toast.error(json.error || "Failed to add Language");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add Language");
    }
  };

  return (
    <div className="w-full px-10 py-8 ">
      <DynamicForm
        fields={languageFields}
        onSubmit={handleAddLanguage}
        submitText="Add Language"
      />
    </div>
  );
};

export default AddLanguage;
