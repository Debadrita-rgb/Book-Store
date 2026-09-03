const brevo = require("../config/brevo");

const {
  buildOrderStatusTemplate,
} = require("../templates/orderStatusEmailTemplate");

const sendOrderStatusEmail = async ({
  email,
  customerName,
  orderNumber,
  status,
  trackingNumber,
  estimatedDelivery,
}) => {
  try {
    const template = buildOrderStatusTemplate({
      customerName,
      orderNumber,
      status,
      trackingNumber,
      estimatedDelivery,
    });

    await brevo.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },

      to: [
        {
          email,
          name: customerName,
        },
      ],

      subject: template.subject,

      htmlContent: template.html,
    });

    // console.log("✅ Status email sent");
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = sendOrderStatusEmail;