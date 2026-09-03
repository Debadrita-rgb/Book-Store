import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";
import RichTextEditor from "../../../RichTextEditor/RichTextEditor";

const EditBook = () => {
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

  const removeGallery = (index) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  // SUBMIT

  const handleSubmit = async (e) => {
    e.preventDefault();

    const oldPrice = Number(formData.oldPrice);
    const price = Number(formData.price);

    if (!formData.category?.length) {
      toast.error("Please select at least one category");
      return;
    }

    if (!formData.language?.length) {
      toast.error("Please select at least one language");
      return;
    }

    if (price > oldPrice) {
      setPriceError("New Price cannot be greater than Old Price.");
      return;
    }

    const percentage =
      oldPrice > 0 && price < oldPrice
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : 0;

const formattedGallery = gallery
  .filter((item) => item.imageUrl && item.imageUrl.trim() !== "")
  .map((item) => ({
    imageUrl: item.imageUrl.trim(),
    isActive: item.isActive ?? true,
  }));

    try {
      const token = localStorage.getItem("token");

      const dataToSend = {
        ...formData,
        percentage,
        gallery: formattedGallery,
      };

      await axios.put(`${BASE_URL}/admin/update-book/${id}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Book updated successfully!");

      setTimeout(() => {
        navigate("/admin/view-all-book");
      }, 1000);
    } catch (error) {
      console.error("Update book error:", error);

      toast.error(error.response?.data?.message || "Failed to update book");
    }
  };

  return (
    <div className="min-h-screen w-full  p-4 md:p-8 border border-gray-200 rounded-xl shadow">
      <ToastContainer position="top-right" autoClose={2000} />

      <form onSubmit={handleSubmit} className="w-full">
        {/* BASIC INFORMATION */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="label">Book Title *</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter book title"
            />
          </div>

          {/* Author */}
          <div>
            <label className="label">Author</label>

            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="input"
              placeholder="Enter author name"
            />
          </div>

          {/* Cover Image */}
          <div className="md:col-span-2">
            <label className="label">Book Cover Image Link</label>

            <input
              type="text"
              name="coverImageLink"
              value={formData.coverImageLink}
              onChange={handleChange}
              className="input"
              placeholder="https://..."
            />

            {formData.coverImageLink && (
              <div className="mt-3">
                <img
                  src={formData.coverImageLink}
                  alt={formData.title}
                  className="w-24 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Published Year */}
          <div>
            <label className="label">Published Year *</label>

            <input
              type="number"
              name="publishedYear"
              value={formData.publishedYear}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          {/* Publisher */}
          <div>
            <label className="label">Publisher</label>

            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Publication Place */}
          <div>
            <label className="label">Publication Place</label>

            <input
              type="text"
              name="publication_place"
              value={formData.publication_place}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Pages */}
          <div>
            <label className="label">Pages</label>

            <input
              type="number"
              name="pages"
              value={formData.pages}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        {/* CATEGORY & LANGUAGE */}

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-6">
          Category & Language
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LANGUAGE */}

          <div className="relative">
            <label className="label">Book Language *</label>

            {/* Selected Languages */}
            {formData.language?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.language.map((language) => (
                  <span
                    key={language}
                    className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {language}

                    <button
                      type="button"
                      onClick={() => removeSelection("language", language)}
                      className="text-orange-500 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Dropdown */}
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "language" ? null : "language")
              }
              className="w-full min-h-[46px] px-4 py-2 text-left border border-gray-300 rounded-lg  hover:border-orange-400"
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {formData.language?.length
                    ? `${formData.language.length} language${
                        formData.language.length > 1 ? "s" : ""
                      } selected`
                    : "Select language"}
                </span>

                <span className="text-gray-400">
                  {openDropdown === "language" ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {openDropdown === "language" && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                <div className="p-3 border-b bg-gray-50">
                  <input
                    type="text"
                    value={languageSearch}
                    onChange={(e) => setLanguageSearch(e.target.value)}
                    placeholder="Search language..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto p-2">
                  {languages
                    .filter((lan) =>
                      lan.title
                        .toLowerCase()
                        .includes(languageSearch.toLowerCase()),
                    )
                    .map((lan) => {
                      const selected = formData.language?.includes(lan.title);

                      return (
                        <button
                          key={lan._id}
                          type="button"
                          onClick={() => toggleSelection("language", lan.title)}
                          className={`w-full flex justify-between px-3 py-2.5 rounded-lg text-left ${
                            selected
                              ? "bg-orange-50 text-orange-600"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <span>{lan.title}</span>

                          {selected && (
                            <span className="text-orange-500">✓</span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* CATEGORY */}

          <div className="relative">
            <label className="label">Category *</label>

            {/* Selected Categories */}
            {formData.category?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.category.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {category}

                    <button
                      type="button"
                      onClick={() => removeSelection("category", category)}
                      className="text-orange-500 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Dropdown */}
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "category" ? null : "category")
              }
              className="w-full min-h-[46px] px-4 py-2 text-left border border-gray-300 rounded-lg  hover:border-orange-400"
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {formData.category?.length
                    ? `${formData.category.length} categor${
                        formData.category.length > 1 ? "ies" : "y"
                      } selected`
                    : "Select category"}
                </span>

                <span className="text-gray-400">
                  {openDropdown === "category" ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {openDropdown === "category" && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                <div className="p-3 border-b bg-gray-50">
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search category..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto p-2">
                  {categories
                    .filter((cat) =>
                      cat.name
                        .toLowerCase()
                        .includes(categorySearch.toLowerCase()),
                    )
                    .map((cat) => {
                      const selected = formData.category?.includes(cat.name);

                      return (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => toggleSelection("category", cat.name)}
                          className={`w-full flex justify-between px-3 py-2.5 rounded-lg text-left ${
                            selected
                              ? "bg-orange-50 text-orange-600"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <span>{cat.name}</span>

                          {selected && (
                            <span className="text-orange-500">✓</span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRICE & QUANTITY */}

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-6">
          Price & Inventory
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Quantity */}
          {/* <div>
            <label className="label">Quantity *</label>

            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              className="input"
            />
          </div> */}

          {/* Old Price */}
          <div>
            <label className="label">Old Price *</label>

            <input
              type="number"
              name="oldPrice"
              value={formData.oldPrice}
              onChange={handleChange}
              required
              min="0"
              className="input"
            />
          </div>

          {/* New Price */}
          <div>
            <label className="label">New Price *</label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              className={`input ${priceError ? "border-red-500" : ""}`}
            />

            {priceError && (
              <p className="mt-1 text-sm text-red-500">{priceError}</p>
            )}
          </div>

          {/* Percentage */}
          <div>
            <label className="label">Discount</label>

            <div className="relative">
              <input
                type="number"
                value={calculatePercentage()}
                readOnly
                className="input bg-gray-100 cursor-not-allowed pr-10"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Gallery  */}
        <div className="mt-8">
          <label className="font-semibold">Gallery Images</label>

          {gallery.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl"
            >
              <input
                type="text"
                value={item.imageUrl}
                onChange={(e) =>
                  handleGalleryChange(index, "imageUrl", e.target.value)
                }
                className="flex-1 border p-2 rounded"
              />

              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={item.isActive}
                  onChange={(e) =>
                    handleGalleryChange(index, "isActive", e.target.checked)
                  }
                />
                Active
              </label>

              {gallery.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGallery(index)}
                  className="bg-red-500 text-white px-3 rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addGallery}
            className="bg-green-600 text-white px-4 py-2 mt-2 rounded"
          >
            + Add Gallery
          </button>
        </div>

        {/* DESCRIPTION */}

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-6">
          Description
        </h2>

        <div className="space-y-6">
          {/* Short Description */}
          <div>
            <label className="label">Short Description</label>

            <RichTextEditor
              value={formData.shortDescription || ""}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  shortDescription: value,
                }))
              }
            />
          </div>

          {/* Long Description */}
          <div>
            <label className="label">Long Description</label>

            <RichTextEditor
              value={formData.longDescription || ""}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  longDescription: value,
                }))
              }
            />
          </div>
        </div>

        {/* BUTTONS */}

        <div className="flex justify-end gap-4 mt-10 pt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/view-all-book")}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-7 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer"
          >
            Update Book
          </button>
        </div>
      </form>
    </div>
  );
};;

export default EditBook;
