const brevo = require("../config/brevo");

const { buildOrderEmailTemplate } = require("../templates/orderEmailTemplate");

const generateInvoice = require("../utils/invoiceService");

const sendOrderEmail = async ({ order, user, tracking }) => {
  try {
    const email = buildOrderEmailTemplate({
      order,
      user,
      tracking,
    });

    const pdfBuffer = await generateInvoice(order, user);

    await brevo.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: email.to,
          name: user.name,
        },
      ],

      subject: email.subject,

      htmlContent: email.html,

      attachment: [
        {
          name: "Invoice.pdf",
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    console.log("Order Email Sent");
  } catch (err) {
    console.log(err.message);
    console.log(err.response?.body);
    console.log(err.response?.text);
    console.log(err.message);
  }
};

module.exports = sendOrderEmail;
