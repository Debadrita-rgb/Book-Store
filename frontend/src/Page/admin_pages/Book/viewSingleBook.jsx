import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";
import RichTextEditor from "../../../RichTextEditor/RichTextEditor";

const ViewSingleBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [gallery, setGallery] = useState([
    {
      imageUrl: "",
      isActive: true,
    },
  ]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    coverImageLink: "",
    publishedYear: "",
    publisher: "",
    publication_place: "",
    pages: "",
    language: [],
    category: [],
    // quantity: "",
    oldPrice: "",
    price: "",
    percentage: 0,
    shortDescription: "",
    longDescription: "",
  });

  const [priceError, setPriceError] = useState("");

  const [openDropdown, setOpenDropdown] = useState(null);
  const [languageSearch, setLanguageSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // ====
  // FETCH CATEGORIES
  // ====

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/admin/get-category`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCategories(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // ====
  // FETCH LANGUAGES
  // ====

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/admin/get-language`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLanguages(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load languages");
      }
    };

    fetchLanguages();
  }, []);

  // ====
  // FETCH BOOK
  // ====

  useEffect(() => {
    if (!id) return;

    const fetchBook = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/admin/get-single-book/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const book = res.data.data || res.data.book || res.data;

        setFormData({
          title: book.title || "",
          author: book.author || "",
          coverImageLink: book.coverImageLink || "",
          publishedYear: book.publishedYear || "",
          publisher: book.publisher || "",
          publication_place: book.publication_place || "",
          pages: book.pages || "",

          language: Array.isArray(book.language) ? book.language : [],

          category: Array.isArray(book.category) ? book.category : [],

          // quantity: book.quantity || "",
          oldPrice: book.oldPrice || "",
          price: book.price || "",
          percentage: book.percentage || 0,

          shortDescription: book.shortDescription || "",
          longDescription: book.longDescription || "",
        });
        setGallery(
          book.gallery?.length
            ? book.gallery.map((item) => ({
                imageUrl: item.imageUrl || "",
                isActive: item.isActive ?? true,
              }))
            : [{ imageUrl: "", isActive: true }],
        );

      } catch (error) {
        console.error("Fetch book error:", error);
        toast.error("Failed to load book");
      }
    };

    fetchBook();
  }, [id]);

  // INPUT CHANGE

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "price" || name === "oldPrice") {
      const oldPrice =
        name === "oldPrice" ? Number(value) : Number(formData.oldPrice);

      const price = name === "price" ? Number(value) : Number(formData.price);

      if (oldPrice > 0 && price > oldPrice) {
        setPriceError("New Price cannot be greater than Old Price.");
      } else {
        setPriceError("");
      }
    }
  };

  // MULTI SELECT

  const toggleSelection = (field, value) => {
    setFormData((prev) => {
      const currentValues = prev[field] || [];

      if (currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter((item) => item !== value),
        };
      }

      return {
        ...prev,
        [field]: [...currentValues, value],
      };
    });
  };

  // REMOVE SELECTED ITEM

  const removeSelection = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((item) => item !== value),
    }));
  };

  // CALCULATE PERCENTAGE

  const calculatePercentage = () => {
    const oldPrice = Number(formData.oldPrice);
    const price = Number(formData.price);

    if (oldPrice > 0 && price < oldPrice) {
      return Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    return 0;
  };

  //Handle gallery
  const addGallery = () => {
    setGallery((prev) => [
      ...prev,
      {
        imageUrl: "",
        isActive: true,
      },
    ]);
  };

  const handleGalleryChange = (index, field, value) => {
    setGallery((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };




  return (
    <div className="min-h-screen w-full  p-4 md:p-8 border border-gray-200 rounded-xl shadow">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="space-y-8">
        {/* Basic Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cover Image */}
            <div className="flex justify-center">
              <img
                src={formData.coverImageLink || "/placeholder-book.png"}
                alt={formData.title}
                className="w-56 h-80 object-cover rounded-xl border shadow-md"
              />
            </div>

            {/* Details */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-gray-500">Book Title</p>
                <p className="font-semibold text-gray-900">
                  {formData.title || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Author</p>
                <p className="font-semibold">{formData.author || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Published Year</p>
                <p className="font-semibold">{formData.publishedYear || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Publisher</p>
                <p className="font-semibold">{formData.publisher || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Publication Place</p>
                <p className="font-semibold">
                  {formData.publication_place || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Pages</p>
                <p className="font-semibold">{formData.pages || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category & Language */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Category & Language
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-5 bg-white shadow-sm">
              <p className="text-sm text-gray-500 mb-3">Book Language</p>

              <div className="flex flex-wrap gap-2">
                {formData.language?.length ? (
                  formData.language.map((lang) => (
                    <span
                      key={lang}
                      className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>
            </div>

            <div className="border rounded-xl p-5 bg-white shadow-sm">
              <p className="text-sm text-gray-500 mb-3">Category</p>

              <div className="flex flex-wrap gap-2">
                {formData.category?.length ? (
                  formData.category.map((cat) => (
                    <span
                      key={cat}
                      className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Price & Inventory */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Price & Inventory
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-xl p-5 bg-white shadow-sm">
              <p className="text-sm text-gray-500">Old Price</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{formData.oldPrice || 0}
              </p>
            </div>

            <div className="border rounded-xl p-5 bg-white shadow-sm">
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="text-xl font-bold text-green-600">
                ₹{formData.price || 0}
              </p>
            </div>

            <div className="border rounded-xl p-5 bg-white shadow-sm">
              <p className="text-sm text-gray-500">Discount</p>
              <p className="text-xl font-bold text-orange-600">
                {calculatePercentage()}%
              </p>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>

          {gallery?.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {gallery.map((item, index) => (
                <img
                  key={index}
                  src={item.imageUrl}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-48 object-cover rounded-xl border shadow-sm hover:scale-105 transition"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No gallery images available.</p>
          )}
        </div>

        {/* Description */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>

          <div className="space-y-6">
            <div className="border rounded-xl p-5 bg-white shadow-sm">
              <p className="text-sm text-gray-500 mb-2">Short Description</p>

              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formData.shortDescription || "-",
                }}
              />
            </div>

            <div className="border rounded-xl p-5 bg-white shadow-sm">
              <p className="text-sm text-gray-500 mb-2">Long Description</p>

              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formData.longDescription || "-",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};;

export default ViewSingleBook;
