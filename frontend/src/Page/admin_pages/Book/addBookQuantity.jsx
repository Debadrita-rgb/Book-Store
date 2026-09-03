import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DynamicForm from "../../../Components/commonComponent/CrudComponent/DynamicFormComponent";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";
// import { getYouTubeVideoId } from "../../../utils/youtube";

const AddBookQuantity = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  const [book, setBook] = useState([]);

  //Fetch category types
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/admin/get-book`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBook(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBook();
  }, []);

  const handleFormSubmit = async (formData) => {
    try {
      const token = localStorage.getItem("token");

      const dataToSend = {
        ...formData,
        available_quantity: formData.total_quantity,
      };
      // console.log(dataToSend);
      await axios.post(`${BASE_URL}/admin/add-quantity-counting`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Book Quantity added successfully!");
      navigate("/admin/view-all-book");
    } catch (error) {
      toast.error("Failed to add Book Quantity");
      console.error(error);
    }
  };

  const fields = [
    {
      name: "bookId",
      label: "Book Title",
      type: "select",
      required: true,
      options: book.map((b) => ({ value: b._id, label: b.title })),
    },
    {
      name: "total_quantity",
      label: "Quantity",
      type: "number",
      required: true,
    },
  ];

  return (
    <div className="p-8">
      <ToastContainer position="top-right" autoClose={2000} />
      <DynamicForm
        fields={fields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleFormSubmit}
        submitText="Save Book Quantity"
      />
    </div>
  );
};

export default AddBookQuantity;
