const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

// Connect database
const db = require("./db");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const allowedOrigins = [
  "http://localhost:5173",
  "https://book-store-frontend-2pz4.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);


const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

const commonRoutes = require("./routes/commonRoutes");
app.use("/common", commonRoutes);

const transporterRoutes = require("./routes/transporterRoutes");
app.use("/transporter", transporterRoutes);

const companyRoutes = require("./routes/companyRoutes");
app.use("/company", companyRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
