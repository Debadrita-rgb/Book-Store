const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    publishedYear: {
      type: Number,
      required: true,
    },
    category: [
      {
        type: String,
        // type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    oldPrice: {
      type: Number,
      required: true,
    },
    percentage: { type: Number, required: true },
    price: {
      type: Number,
      required: true,
    },
    publisher: {
      type: String,
    },
    publication_place: {
      type: String,
    },
    language: [{ type: String, required: true }],
    pages: {
      type: Number,
    },
    shortDescription: {
      type: String,
    },
    longDescription: {
      type: String,
    },
    coverImageLink: {
      type: String,
    },

    gallery: [
      {
        imageUrl: { type: String },
        isActive: { type: Boolean, default: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: String,
    },
    isRecommended: {
      type: Boolean,
      default: true,
    },
    // releasedDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
);

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
