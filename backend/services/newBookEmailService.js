const brevo = require("../config/brevo");
const Contact = require("../Models/Contact");
const {
  buildNewBookEmailTemplate,
} = require("../templates/newBookEmailTemplate");

const sendNewBookNotification = async (book) => {
  try {
    // Get newsletter subscribers
    const subscribers = await Contact.find({
      status: "Newsletter",
      email: { $exists: true, $ne: "" },
    }).select("name email");

    if (!subscribers.length) {
      console.log("No newsletter subscribers found.");
      return;
    }

    // console.log(
    //   `Sending new book notification to ${subscribers.length} subscribers`,
    // );

    // Send email to all subscribers
    await Promise.all(
      subscribers.map(async (subscriber) => {
        const email = buildNewBookEmailTemplate({
          subscriber,
          book,
        });

        await brevo.sendTransacEmail({
          sender: {
            name: process.env.BREVO_SENDER_NAME,
            email: process.env.BREVO_SENDER_EMAIL,
          },

          to: [
            {
              email: subscriber.email,
              name: subscriber.name || "Book Lover",
            },
          ],

          subject: email.subject,

          htmlContent: email.html,
        });
      }),
    );

    // console.log("New book notification emails sent successfully.");
  } catch (err) {
    console.error("New book email error:", err.message);
    console.error(err.response?.body);
    console.error(err.response?.text);
  }
};

module.exports = sendNewBookNotification;
