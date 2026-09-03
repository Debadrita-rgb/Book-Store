import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DynamicForm from "../../../components/commonComponent/CrudComponent/DynamicFormComponent";
import BASE_URL from "../../../../config";

const fields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "mobile", label: "mobile", type: "text" },
  { name: "birthday", label: "Birthday", type: "text" },
  { name: "gender", label: "Gender", type: "text" },
  { name: "favoriteAuthors", label: "Favorite Authors", type: "text" },
  { name: "favoriteBook", label: "Favorite Book", type: "text" },
  { name: "readingPreference", label: "Reading Preference", type: "text" },
  { name: "favoriteGenres", label: "Favorite Genres", type: "textarea" },
];

const viewUserDetails = () => {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!id) return;

    fetch(`${BASE_URL}/admin/get-one-user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatDate = (date) => {
          if (!date) return "";
          return new Date(date).toISOString().split("T")[0];
        };

        const user = data.user || {};
        const profile = data.profile || {};

        setInitialData({
          // User schema
          name: user.name || "",
          email: user.email || "",

          // Profile schema
          mobile: profile.mobile || "",
          birthday: formatDate(profile.birthday),
          gender: profile.gender || "",
          married: profile.married || "",

          favoriteAuthors: profile.favoriteAuthors || "",
          favoriteBook: profile.favoriteBook || "",
          readingPreference: profile.readingPreference || "",

          favoriteGenres: (profile.favoriteGenres || [])
            .map((genre) => genre.categoryName || genre.catId?.name || "")
            .filter(Boolean)
            .join("\n"),
        });
      })
      .catch((err) => {
        console.error("Error fetching feedback:", err);
        toast.error("Failed to load feedback details.");
      });
  }, []);

  return (
    <div className="p-6">
      {initialData ? (
        <DynamicForm
          fields={fields.map((f) => ({
            ...f,
            value: initialData[f.name],
            readOnly: true,
          }))}
          submitText=""
          onSubmit={() => {}}
          showSubmit={false}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default viewUserDetails;
