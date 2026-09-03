import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BASE_URL from "../../../../config";

const EditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",

  });


  // Fetch existing category
  useEffect(() => {

    const fetchCategory = async () => {
      try {
            const token = localStorage.getItem("token");

        const res = await fetch(
          `${BASE_URL}/admin/get-single-category/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();
        setFormData({
          name: data.name,
        });

      } catch (error) {
        toast.error("Failed to load category");
      }
    };

    fetchCategory();
  }, [id]);

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
      const res = await fetch(
        `${BASE_URL}/admin/update-category/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const json = await res.json();

      if (res.ok) {
        toast.success("Category updated successfully");
        navigate("/admin/view-all-category");
      } else {
        toast.error(json.error || "Failed to update category");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <div className="w-full px-10 py-8">
      <form
        onSubmit={handleSubmit}
        className=" p-10 border border-gray-200 rounded-xl shadow text-black"
      >
        <h2 className="text-2xl font-semibold mb-6">Edit Category</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1">Category Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-6"
        >
          Update Category
        </button>
      </form>
    </div>
  );
};

export default EditCategory;
