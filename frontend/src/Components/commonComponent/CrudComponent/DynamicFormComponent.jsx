import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";

import "./dy.css";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter link URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("underline")
            ? "bg-blue-500 text-white"
            : "bg-gray-200"
        }`}
      >
        Underline
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("heading", { level: 1 })
            ? "bg-blue-500 text-white"
            : "bg-gray-200"
        }`}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("heading", { level: 2 })
            ? "bg-blue-500 text-white"
            : "bg-gray-200"
        }`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={setLink}
        className={`px-2 py-1 rounded ${
          editor.isActive("link") ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        Link
      </button>
    </div>
  );
};

const SearchableSelect = ({ field, formData, setFormData, handleChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const normalizedOptions = React.useMemo(() => {
    return (field.options || []).map((opt, index) => {
      if (typeof opt === "object") {
        return {
          value: opt.value ?? "",
          label: opt.label ?? "",
        };
      }

      return {
        value: opt,
        label: opt,
      };
    });
  }, [field.options]);

  const filteredOptions = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return normalizedOptions;

    return normalizedOptions.filter((opt) => {
      const label = (opt.label || "").toLowerCase();
      const value = (opt.value || "").toLowerCase();
      return label.includes(term) || value.includes(term);
    });
  }, [normalizedOptions, searchTerm]);

  const handleSelectOption = (value) => {
    if (field.multiple) {
      const existing = Array.isArray(formData[field.name])
        ? formData[field.name]
        : [];
      const nextValue = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value];

      setFormData({
        ...formData,
        [field.name]: nextValue,
      });
      field.onChange?.({
        target: { name: field.name, value: nextValue },
      });
    } else {
      setFormData({
        ...formData,
        [field.name]: value,
      });
      handleChange({ target: { name: field.name, value } });
      field.onChange?.({ target: { name: field.name, value } });
    }

    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedDisplay = field.multiple
    ? Array.isArray(formData[field.name]) && formData[field.name].length > 0
      ? `${formData[field.name].length} selected`
      : `Select ${field.label}`
    : (() => {
        const currentValue = formData[field.name];
        const selectedOption = normalizedOptions.find(
          (opt) => opt.value === currentValue,
        );
        return selectedOption ? selectedOption.label : `Select ${field.label}`;
      })();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-left text-black"
      >
        {selectedDisplay}
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${field.label}`}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleSelectOption("")}
              className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100"
            >
              Select {field.label}
            </button>

            {filteredOptions.map((opt) => {
              const isSelected = field.multiple
                ? Array.isArray(formData[field.name]) &&
                  formData[field.name].includes(opt.value)
                : formData[field.name] === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                    isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const DynamicForm = ({
  fields,
  onSubmit,
  submitText = "Submit",
  showSubmit = true,
}) => {
  const [formData, setFormData] = React.useState(() =>
    fields.reduce((acc, field) => {
      acc[field.name] =
        field.type === "checkbox"
          ? (field.value ?? false)
          : field.type === "number"
            ? (field.value ?? 0)
            : (field.value ?? "");
      return acc;
    }, {}),
  );

  const editorsRef = React.useRef({});

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    Object.keys(editorsRef.current).forEach((name) => {
      const editorInstance = editorsRef.current[name];
      if (editorInstance) {
        formData[name] = editorInstance.getHTML();
      }
    });

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-full bg-white p-10 border border-gray-200 rounded-xl shadow"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => {
          if (field.hidden) return null;

          let editor = null;

          if (field.type === "tiptap") {
            editor = useEditor({
              extensions: [StarterKit, Underline, Image, Heading, Link],
              content: formData[field.name],
              onUpdate: ({ editor }) => {
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: editor.getHTML(),
                }));
              },
            });

            editorsRef.current[field.name] = editor;
          }

          return (
            <div
              key={field.name}
              className={`flex flex-col ${
                field.type === "textarea" || field.type === "tiptap"
                  ? "md:col-span-2"
                  : ""
              }`}
            >
              <label className="mb-1 text-sm font-semibold text-gray-700">
                {field.label}
              </label>
              {field.type === "select" ? (
                <div className="flex flex-col gap-2">
                  {/* Selected Chips */}
                  {field.multiple && Array.isArray(formData[field.name]) && (
                    <div className="flex flex-wrap gap-2">
                      {formData[field.name].map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-2"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData[field.name].filter(
                                (val) => val !== item,
                              );
                              setFormData({
                                ...formData,
                                [field.name]: updated,
                              });
                            }}
                            className="font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Select Dropdown */}
                  <SearchableSelect
                    field={field}
                    formData={formData}
                    setFormData={setFormData}
                    handleChange={handleChange}
                  />
                </div>
              ) : field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder || ""}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
                  rows={field.rows || 4}
                />
              ) : field.type === "tiptap" ? (
                <div className="border border-gray-300 rounded-lg p-3 text-black">
                  <MenuBar editor={editor} />
                  <EditorContent editor={editor} />
                </div>
              ) : field.type === "file" ? (
                <input
                  type="file"
                  name={field.name}
                  accept="image/*"
                  onChange={handleChange}
                  className="block text-sm text-gray-700"
                />
              ) : field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  name={field.name}
                  checked={formData?.[field.name] ?? false}
                  onChange={handleChange}
                  label={field.label}
                />
              ) : field.type === "text" ? (
                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder || ""}
                  readOnly={field.readOnly || false}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
                />
              ) : (
                <input
                  type={field.type || "time"}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder || ""}
                  readOnly={field.readOnly || false}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
                />
              )}
            </div>
          );
        })}
      </div>

      {showSubmit && (
        <div className="mt-8 text-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer"
          >
            {submitText}
          </button>
        </div>
      )}
    </form>
  );
};

export default DynamicForm;
