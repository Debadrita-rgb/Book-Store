
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BASE_URL from "../../../../../config";

const Viewcontactdetails = () => {
  const { id: contactId } = useParams();

  const [contact, setContact] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!contactId) return;

    fetch(`${BASE_URL}/admin/get-single-contact/${contactId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setContact(data);
      })
      .catch((err) => {
        console.error("Error fetching contact:", err);
        toast.error("Failed to load contact details.");
      });
  }, [contactId]);

  if (!contact) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const isNewsletter = contact.status === "Newsletter";

  return (
    <div className="min-h-screen w-full p-4 md:p-8 border border-gray-200 rounded-xl shadow">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        {/* Left side */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNewsletter ? "Newsletter Subscription" : "Contact Details"}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            {isNewsletter
              ? "Newsletter subscriber information"
              : "Details submitted through the contact form"}
          </p>
        </div>

        {/* Right side - Status */}
        <div className="text-right">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Status
          </label>

          <span
            className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
              isNewsletter
                ? "bg-blue-100 text-blue-600"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            {contact.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name - Contact only */}
        {!isNewsletter && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Name
            </label>

            <input
              type="text"
              value={contact.name || ""}
              readOnly
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none"
            />
          </div>
        )}

        {/* Email - Always show */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Email Address
          </label>

          <input
            type="email"
            value={contact.email || ""}
            readOnly
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none"
          />
        </div>

        {/* Subject - Contact only if you have it */}
        {!isNewsletter && contact.subject && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Subject
            </label>

            <input
              type="text"
              value={contact.subject || ""}
              readOnly
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none"
            />
          </div>
        )}
      </div>

      {/* Message - Contact only */}
      {!isNewsletter && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Message
          </label>

          <textarea
            value={contact.message || ""}
            readOnly
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none resize-none"
          />
        </div>
      )}
    </div>
  );
};

export default Viewcontactdetails;