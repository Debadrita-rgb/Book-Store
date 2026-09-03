const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const buildOrderStatusTemplate = ({
  customerName,
  orderNumber,
  status,
  trackingNumber,
  estimatedDelivery,
}) => {
  const templatePath = path.join(
    process.cwd(),
    "templates",
    "orderStatusEmail.hbs",
  );

  const source = fs.readFileSync(templatePath, "utf8");

  const template = handlebars.compile(source);

  const statusMessages = {
    Ordered: {
      title: "Order Placed",
      color: "#3498db",
      message:
        "We have received your order and it is waiting for confirmation.",
    },

    Confirmed: {
      title: "Order Confirmed",
      color: "#27ae60",
      message: "Your order has been confirmed and is now being prepared.",
    },

    Packed: {
      title: "Order Packed",
      color: "#f39c12",
      message: "Your books have been packed and are ready for shipment.",
    },

    Shipped: {
      title: "Order Shipped",
      color: "#2980b9",
      message: "Good news! Your package has been shipped.",
    },

    "Out For Delivery": {
      title: "Out For Delivery",
      color: "#8e44ad",
      message: "Your package is out for delivery and will arrive soon.",
    },

    Delivered: {
      title: "Delivered",
      color: "#2ecc71",
      message: "Your order has been delivered successfully. Happy Reading!",
    },
  };

  const current = statusMessages[status];

  return {
    to: customerName.email,
    subject: `📦 Order ${orderNumber} - ${status}`,
    html: template({
      customerName,
      orderNumber,
      status,
      trackingNumber,
      estimatedDelivery,
      title: current.title,
      message: current.message,
      color: current.color,
    }),
  };
};

module.exports = {
  buildOrderStatusTemplate,
};
