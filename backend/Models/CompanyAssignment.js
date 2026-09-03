const mongoose = require("mongoose");

const companyAssignmentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    assignedDate: {
      type: Date,
      default: Date.now,
    },
    giveOrderToTransporter: {
      type: Date,
    },
    transporter: {
      transporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transporter",
      },
      transportername: String,
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

module.exports = mongoose.model("CompanyAssignment", companyAssignmentSchema);
