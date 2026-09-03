const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },

    trackingNumber: {
      type: String,
      required: true,
    },

    carrier: {
      type: String,
      default: "BookStore Express",
    },
    transporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transporter",
    },
    estimatedDelivery: Date,
    packageingDate: Date,
    shippingDate: Date,
    outforDeliveryDate: Date,
    confirmationDate: Date,
    deliveredDate: Date,
    currentStatus: {
      type: String,
      enum: [
        "Ordered",
        "Confirmed",
        "Packed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
      ],
      default: "Ordered",
    },

    timeline: [
      {
        status: String,
        location: String,
        message: String,
        date: Date,
      },
    ],
    company: {
      companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },
      companyName: String,
    },

    transporter: {
      transporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transporter",
      },
      transporterName: String,
      vehicleNumber: String,
      phone: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Tracking", trackingSchema);
