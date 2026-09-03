const mongoose = require("mongoose");

const transporterSchema = new mongoose.Schema(
  {
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
    phone: {
      type: String,
      required: true,
      // unique: true,
    },

    transportername: {
      type: String,
      required: true,
    },

    company: {
      companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
      },
      companyName: {
        type: String,
        required: true,
      },
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },

    vehicleType: {
      type: String,
      enum: ["Bike", "Scooter", "Car", "Van", "Truck"],
      required: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    currentAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransporterAssignment",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Transporter", transporterSchema);
