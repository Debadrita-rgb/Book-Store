const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
    },
    details: Object,

    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WishlistList",
      // required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
