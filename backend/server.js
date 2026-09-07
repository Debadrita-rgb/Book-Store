const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const cors = require('cors');
const bodyParser = require('body-parser');
const path = require("path");

const app = express();

//connect databse
const db = require("./db");

// Middleware to parse URL-encoded request bodies
app.use(bodyParser.json());
// Middleware to parse JSON request bodies
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const allowedOrigins = [
  "http://localhost:5173",
  "https://book-store-frontend-2pz4.onrender.com",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.options("*", cors());

// const corsOptions = {
//   origin: (origin, callback) => {
//     const normalizedOrigin = origin?.replace(/\/$/, "");

//     if (!origin || allowedOrigins.has(normalizedOrigin)) {
//       return callback(null, true);
//     }

//     return callback(new Error("Origin is not allowed by CORS"));
//   },
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.options(/.*/, cors(corsOptions));


app.use(express.json());
app.use(express.text()); 

//Import user from the router files
const userRoutes = require('./routes/userRoutes');
app.use('/user',userRoutes);

//Import admin from the router files
const adminRoutes = require("./routes/adminRoutes");
app.use('/admin',adminRoutes);

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
