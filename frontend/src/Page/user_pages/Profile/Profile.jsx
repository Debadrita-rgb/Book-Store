import { useEffect, useState } from "react";
import BASE_URL from "../../../../config";
import { FaUser, FaBookOpen, FaHeart, FaPen } from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    mobile: "",
    birthday: "",
    gender: "",
    favoriteGenres: [],
    favoriteAuthors: "",
    readingPreference: "",
    favoriteBook: "",
  });
    const [category, setCategory] = useState([]);
  
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/get_category`);
        setCategory(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategory();
  }, []);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/user/get-user-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!data.success) {
          toast.error(data.message || "Failed to load profile");
          return;
        }

        const userData = data.user || {};
        const profileData = data.profile || {};

        setUser({
          name: userData.name || "",
          email: userData.email || "",
          mobile: profileData.mobile || "",
          birthday: profileData.birthday || "",
          gender: profileData.gender || "",

          favoriteGenres: (profileData.favoriteGenres || []).map(
            (genre) => genre.catId?._id || genre.catId,
          ),

          favoriteAuthors: profileData.favoriteAuthors || "",
          readingPreference: profileData.readingPreference || "",
          favoriteBook: profileData.favoriteBook || "",
        });
      } catch (err) {
        console.error("Profile error:", err);
        toast.error("Failed to load profile");
      }
    };

    fetchUser();
  }, []);

const handleGenreChange = (genreId) => {
  setUser((prev) => {
    const exists = prev.favoriteGenres.includes(genreId);

    return {
      ...prev,
      favoriteGenres: exists
        ? prev.favoriteGenres.filter((id) => id !== genreId)
        : [...prev.favoriteGenres, genreId],
    };
  });
};

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/user/update-user-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (data.success) {
        const updatedUser = data.user || {};
        const updatedProfile = data.profile || {};

        setUser({
          name: updatedUser.name || "",
          email: updatedUser.email || "",

          mobile: updatedProfile.mobile || "",
          birthday: updatedProfile.birthday || "",
          gender: updatedProfile.gender || "",

          favoriteGenres: (updatedProfile.favoriteGenres || []).map(
            (genre) => genre.catId?._id || genre.catId,
          ),

          favoriteAuthors: updatedProfile.favoriteAuthors || "",
          readingPreference: updatedProfile.readingPreference || "",
          favoriteBook: updatedProfile.favoriteBook || "",
        });

        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      toast.error("Something went wrong while updating your profile");
    }
  };

  return (
    <div className="profile-page py-16">
      {" "}
      <div className="profile-card max-w-7xl mx-auto rounded-2xl p-6">
        {" "}
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
          <div className="profile-avatar w-24 h-24 rounded-full flex items-center justify-center">
            {" "}
            <FaUser className="text-4xl text-orange-500" />
          </div>

          <div className="text-center sm:text-left">
            <h1 className="profile-title text-3xl font-bold">
              {" "}
              {user.name || "Book Lover"}
            </h1>

            <p className="profile-text mt-1">
              {" "}
              Manage your profile and reading preferences
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-orange-500">
              <FaBookOpen />
              <span className="text-sm font-medium">Your Reading Profile</span>
            </div>
          </div>
        </div>
        {/* Account Details */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <FaUser className="text-orange-500" />
            <h2 className="profile-title text-xl font-bold">Account Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="profile-text text-sm font-medium">
                Full Name
              </label>

              <input
                type="text"
                value={user.name || ""}
                onChange={(e) =>
                  setUser({
                    ...user,
                    name: e.target.value,
                  })
                }
                className="profile-input rounded-lg px-4 py-3 mt-2"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="profile-text text-sm font-medium">
                Mobile Number
              </label>

              <input
                type="text"
                value={user.mobile || ""}
                maxLength={10}
                onChange={(e) =>
                  setUser({
                    ...user,
                    mobile: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="profile-input rounded-lg px-4 py-3 mt-2"
              />
            </div>

            {/* Email */}
            <div>
              <label className="profile-text text-sm font-medium">
                Email Address
              </label>

              <input
                type="email"
                value={user.email || ""}
                readOnly
                className="profile-input profile-input-readonly rounded-lg px-4 py-3 mt-2"
              />
            </div>

            {/* Birthday */}
            <div>
              <label className="profile-text text-sm font-medium">
                Birthday
              </label>

              <input
                type="date"
                value={user.birthday ? user.birthday.split("T")[0] : ""}
                onChange={(e) =>
                  setUser({
                    ...user,
                    birthday: e.target.value,
                  })
                }
                className="profile-input rounded-lg px-4 py-3 mt-2"
              />
            </div>
          </div>
        </div>
        {/* Reading Profile */}
        <div className="border-t profile-divider pt-10">
          <div className="flex items-center gap-2 mb-2">
            <FaHeart className="text-orange-500" />

            <h2 className="text-xl font-bold text-gray-900">
              Reading Preferences
            </h2>
          </div>

          <p className="profile-text text-sm mb-6">
            {" "}
            Tell us what you love to read.
          </p>

          {/* Gender */}
          <div className="mb-7">
            <label className="profile-text text-sm font-medium">Gender</label>

            <div className="flex flex-wrap gap-3 mt-3">
              {["Woman", "Man", "Other"].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() =>
                    setUser({
                      ...user,
                      gender,
                    })
                  }
                  className={`profile-chip px-5 py-2.5 rounded-lg ${
                    user.gender === gender ? "active" : ""
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Genres */}
          <div className="mb-7">
            <label className="profile-text text-sm font-medium">
              Favorite Genres
            </label>

            <div className="flex flex-wrap gap-3 mt-3">
              {category.map((cat) => {
                const isSelected = user.favoriteGenres.includes(cat._id);

                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => handleGenreChange(cat._id)}
                    className={`profile-chip px-4 py-2 rounded-full text-sm ${
                      isSelected ? "active" : ""
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favorite Authors */}
          <div className="mb-7">
            <label className="profile-text text-sm font-medium">
              Favorite Authors
            </label>

            <div className="relative mt-2">
              {/* <FaPen className="absolute left-4 top-4 text-gray-400" /> */}

              <input
                type="text"
                value={user.favoriteAuthors || ""}
                onChange={(e) =>
                  setUser({
                    ...user,
                    favoriteAuthors: e.target.value,
                  })
                }
                placeholder="e.g. J.K. Rowling, George Orwell"
                className="w-full border border-gray-200 rounded-lg pl-11 pr-4 py-3 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Favorite Book */}
          <div className="mb-7">
            <label className="profile-text text-sm font-medium">
              Favorite Book
            </label>

            <input
              type="text"
              value={user.favoriteBook || ""}
              onChange={(e) =>
                setUser({
                  ...user,
                  favoriteBook: e.target.value,
                })
              }
              placeholder="What's your all-time favorite book?"
              className="profile-input rounded-lg px-4 py-3 mt-2"
            />
          </div>

          {/* Reading Preference */}
          <div>
            <label className="profile-text text-sm font-medium">
              How do you prefer to read?
            </label>

            <div className="flex flex-wrap gap-3 mt-3">
              {["Physical Books", "E-books", "Both"].map((preference) => (
                <button
                  key={preference}
                  type="button"
                  onClick={() =>
                    setUser({
                      ...user,
                      readingPreference: preference,
                    })
                  }
                  className={`profile-chip px-5 py-2.5 rounded-lg ${
                    user.readingPreference === preference ? "active" : ""
                  }`}
                >
                  {preference}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Save */}
        <div className="mt-10 pt-6 border-t profile-divider">
          <button
            onClick={handleSave}
            className="profile-btn px-7 py-3 rounded-lg font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
