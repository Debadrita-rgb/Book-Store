const brevo = require("../config/brevo");

const {
  buildsendForgotPasswordOtpTemplate,
} = require("../templates/sendForgotPasswordOtpTemplate");

const sendForgotPasswordOtpEmail = async ({ name, email, otp }) => {
  try {
    const template = buildsendForgotPasswordOtpTemplate({
      name,
      email,
      otp,
    });

    await brevo.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },

      to: [
        {
          email,
          name,
        },
      ],

      subject: template.subject,
      htmlContent: template.html,
    });

    console.log("✅ Forgot password OTP email sent");
  } catch (err) {
console.error(
  "❌ Forgot password OTP email error:",
  err.response?.body || err.message,
);

    throw err;
  }
};

module.exports = sendForgotPasswordOtpEmail;
