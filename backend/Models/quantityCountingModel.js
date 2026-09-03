const mongoose = require("mongoose");

const quantityCountingSchema = new mongoose.Schema(
  {
    bookId: mongoose.Schema.Types.ObjectId,
    total_quantity: { type: Number, default: 1 },
    used_quantity: { type: Number, default: 0 },
    available_quantity: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "new" },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("bookquantityCounting", quantityCountingSchema);
