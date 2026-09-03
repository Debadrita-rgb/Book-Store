import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";
import RichTextEditor from "../../../RichTextEditor/RichTextEditor";

const AddBook = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [languageSearch, setLanguageSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [priceError, setPriceError] = useState("");
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
    language: [],
    publisher: "",
    publication_place: "",
    pages: "",
    quantity: "",
    oldPrice: "",
    price: "",
    percentage: 0,
    category: [],
    shortDescription: "",
    longDescription: "",
  });

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

  const removeSelection = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((item) => item !== value),
    }));
  };

  //  FETCH CATEGORIES
  useEffect(() => {
    const fetchCategory = async () => {
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
      }
    };

    fetchCategory();
  }, []);

  //  FETCH LANGUAGES
  useEffect(() => {
    const fetchLanguage = async () => {
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
      }
    };

    fetchLanguage();
  }, []);

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

  //  HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };

      // Calculate discount when old price OR new price changes
      if (name === "oldPrice" || name === "price") {
        const oldPrice = Number(name === "oldPrice" ? value : prev.oldPrice);

        const price = Number(name === "price" ? value : prev.price);

        let percentage = 0;

        if (oldPrice > 0 && price > 0 && price < oldPrice) {
          percentage = Math.round(((oldPrice - price) / oldPrice) * 100);
        }
        if (oldPrice > 0 && price > oldPrice) {
          setPriceError("New Price cannot be greater than Old Price.");
        } else {
          setPriceError("");
        }

        updatedData.percentage = percentage;
      }

      return updatedData;
    });
  };

  //  MULTIPLE SELECT
  const handleMultiSelect = (e) => {
    const { name, options } = e.target;

    const values = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    setFormData((prev) => ({
      ...prev,
      [name]: values,
    }));
  };

  //  SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category.length) {
      toast.error("Please select at least one category");
      return;
    }

    if (!formData.language.length) {
      toast.error("Please select at least one language");
      return;
    }

    const oldPrice = Number(formData.oldPrice);
    const price = Number(formData.price);

    if (price > oldPrice) {
      setPriceError("New Price must be lower than Old Price.");
      toast.error("New Price must be lower than Old Price.");
      return;
    }

    const percentage = Math.round(((oldPrice - price) / oldPrice) * 100);

    const formattedGallery = gallery
      .filter(
        (item) =>
          item.imageUrl &&
          item.imageUrl.trim() !== "" &&
          item.isActive !== false,
      )
      .map((item) => ({
        imageUrl: item.imageUrl.trim(),
        isActive: true,
      }));

    const payload = {
      ...formData,
      percentage,
      gallery: formattedGallery,
    };

    try {
      const token = localStorage.getItem("token");

      await axios.post(`${BASE_URL}/admin/add-all-books`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Book added successfully!");

      setTimeout(() => {
        navigate("/admin/view-all-book");
      }, 1000);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to add book");
    }
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-8 border border-gray-200 rounded-xl shadow">
      <ToastContainer position="top-right" autoClose={2000} />

      <form
        onSubmit={handleSubmit}
        className="w-full h-full p-10 border border-gray-200 rounded-xl shadow"
      >
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

        {/*  LANGUAGE & CATEGORY  */}
        {/* LANGUAGE & CATEGORY */}
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

            {/* Dropdown Button */}
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "language" ? null : "language")
              }
              className="w-full min-h-[46px] px-4 py-2 text-left border border-gray-300 rounded-lg hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <div className="flex justify-between items-center">
                <span
                  className={
                    formData.language?.length
                      ? "text-gray-700"
                      : "text-gray-400"
                  }
                >
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

            {/* Language Dropdown */}
            {openDropdown === "language" && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                {/* Search */}
                <div className="p-3 border-b bg-gray-50">
                  <input
                    type="text"
                    value={languageSearch}
                    onChange={(e) => setLanguageSearch(e.target.value)}
                    placeholder="Search language..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Options */}
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
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition ${
                            selected
                              ? "bg-orange-50 text-orange-600"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span>{lan.title}</span>

                          {selected && (
                            <span className="text-orange-500 font-bold">✓</span>
                          )}
                        </button>
                      );
                    })}

                  {languages.filter((lan) =>
                    lan.title
                      .toLowerCase()
                      .includes(languageSearch.toLowerCase()),
                  ).length === 0 && (
                    <p className="text-center text-gray-400 py-4 text-sm">
                      No language found
                    </p>
                  )}
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

            {/* Dropdown Button */}
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "category" ? null : "category")
              }
              className="w-full min-h-[46px] px-4 py-2 text-left border border-gray-300 rounded-lg  hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <div className="flex justify-between items-center">
                <span
                  className={
                    formData.category?.length
                      ? "text-gray-700"
                      : "text-gray-400"
                  }
                >
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

            {/* Category Dropdown */}
            {openDropdown === "category" && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                {/* Search */}
                <div className="p-3 border-b bg-gray-50">
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search category..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Options */}
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
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition ${
                            selected
                              ? "bg-orange-50 text-orange-600"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span>{cat.name}</span>

                          {selected && (
                            <span className="text-orange-500 font-bold">✓</span>
                          )}
                        </button>
                      );
                    })}

                  {categories.filter((cat) =>
                    cat.name
                      .toLowerCase()
                      .includes(categorySearch.toLowerCase()),
                  ).length === 0 && (
                    <p className="text-center text-gray-400 py-4 text-sm">
                      No category found
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/*  INVENTORY & PRICE  */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-6">
          Inventory & Pricing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Quantity */}
          <div>
            <label className="label">Quantity *</label>

            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
              className="input"
            />
          </div>

          {/* Old Price */}
          <div>
            <label className="label">Old Price *</label>

            <input
              type="number"
              name="oldPrice"
              value={formData.oldPrice}
              onChange={handleChange}
              min="0"
              required
              className="input"
              placeholder="₹ 0"
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
              className={`input ${
                priceError ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="Enter new price"
            />

            {priceError && (
              <p className="mt-1 text-sm text-red-500">{priceError}</p>
            )}
          </div>

          {/* Percentage */}
          <div>
            <label className="label">Discount %</label>

            <input
              type="number"
              name="percentage"
              value={formData.percentage}
              readOnly
              className="input bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Discount information */}
        {formData.percentage > 0 && (
          <div className="mt-5 rounded-lg bg-orange-50 border border-orange-100 px-4 py-3">
            <p className="text-sm text-orange-600">
              🎉 This book has a <strong>{formData.percentage}%</strong>{" "}
              discount.
            </p>
          </div>
        )}

        {/* Gallery  */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Gallery Images
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Add additional images of the book.
              </p>
            </div>

            <button
              type="button"
              onClick={addGallery}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
            >
              + Add Image
            </button>
          </div>

          <div className="space-y-3">
            {gallery.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter gallery image URL"
                    value={item.imageUrl}
                    onChange={(e) =>
                      handleGalleryChange(index, "imageUrl", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-orange-500"
                  />
                </div>

                {gallery.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGallery(index)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/*  DESCRIPTION  */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-6">
          Description
        </h2>

        <div className="space-y-6">
          {/* Short Description */}
          <div>
            <label className="label">Short Description</label>

            <RichTextEditor
              value={formData.shortDescription}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  shortDescription: value,
                }))
              }
              placeholder="Write a short description..."
            />
          </div>

          {/* Long Description */}
          <div>
            <label className="label">Long Description</label>

            <RichTextEditor
              value={formData.longDescription}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  longDescription: value,
                }))
              }
              placeholder="Write a detailed description..."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="mt-10 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition cursor-pointer"
          >
            Save Book
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBook;
