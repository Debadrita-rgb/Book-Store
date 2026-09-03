const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    books: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },

        title: String,
        author: String,
        coverImage: String,

        price: Number,

        quantity: Number,

        totalPrice: Number,
      },
    ],

    address: {
      fullName: String,
      mobileNumber: String,
      alternateMobileNumber: String,
      addressLine1: String,
      addressLine2: String,
      landmark: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      addressType: String,
    },

    subtotal: Number,

    cgst: Number,

    sgst: Number,

    totalAmount: Number,

    coupon: {
      couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
      },

      couponCode: String,

      discount: Number,
    },

    payableAmount: Number,

    paymentMethod: {
      type: String,
      enum: ["UPI", "CARD", "NET_BANKING", "COD"],
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Ordered",
        "Confirmed",
        "Packed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
        // "Cancelled",
        // "Returned",
      ],
      default: "Ordered",
    },
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

    razorpayOrderId: String,

    razorpayPaymentId: String,

    razorpaySignature: String,
    estimatedDelivery: Date,
    packageingDate: Date,
    confirmationDate: Date,
    shippingDate: Date,
    outforDeliveryDate: Date,
    deliveredDate: Date,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
