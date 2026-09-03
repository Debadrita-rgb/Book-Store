const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: String,
  message: { type: String },
  email: String,
  createdAt: { type: Date, default: Date.now },
  subject: { type: String },
  isActive: { type: Boolean, default: true },
  status: { type: String },
});

module.exports = mongoose.model("Contact", ContactSchema);
