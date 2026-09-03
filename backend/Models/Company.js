const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      // unique: true,
    },

  },  
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Company", companySchema);
