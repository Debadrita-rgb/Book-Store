const mongoose = require("mongoose");

const transporterAssignmentSchema = new mongoose.Schema(
  {
    transporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transporter",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    company: {
      companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },
      companyName: String,
    },

    assignedDate: {
      type: Date,
      default: Date.now,
    },

    estimatedDelivery: Date,

    completedDate: Date,

    status: {
      type: String,
      enum: ["Assigned", "Completed"],
      default: "Assigned",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("TransporterAssignment", transporterAssignmentSchema);
