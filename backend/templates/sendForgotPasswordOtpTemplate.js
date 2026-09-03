const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const buildsendForgotPasswordOtpTemplate = ({ name, email, otp }) => {
  const templatePath = path.join(
    process.cwd(),
    "templates",
    "sendForgotPasswordOtpTemplate.hbs",
  );

  const source = fs.readFileSync(templatePath, "utf8");

  const template = handlebars.compile(source);

  return {
    to: email,
    subject: "Password Reset OTP",
    html: template({
      name,
      otp,
      year: new Date().getFullYear(),
    }),
  };
};

module.exports = {
  buildsendForgotPasswordOtpTemplate,
};
