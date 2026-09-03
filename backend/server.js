const express = require('express');
const dotenv = require('dotenv');
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

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // "https://show-hub-frontend.onrender.com",
    ],
    credentials: true,
  }),
);

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

app.listen(5000, ()=> {
  console.log('Server is running at 5000')
})
