const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    mobile: {
      type: String,
      unique: true,
      sparse: true,
    },

    gender: {
      type: String,
      default: null,
    },

    birthday: {
      type: Date,
      default: null,
    },

    favoriteGenres: [
      {
        catId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },

        categoryName: {
          type: String,
        },
      },
    ],

    favoriteAuthors: {
      type: String,
      default: "",
    },

    favoriteBook: {
      type: String,
      default: "",
    },

    readingPreference: {
      type: String,
      enum: ["Physical Books", "E-books", "Both", ""],
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Profile", profileSchema);
