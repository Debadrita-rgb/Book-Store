const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { generateToken, jwtAuthMiddleware } = require("../middleware/jwt");
const User = require("../Models/userModel");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email: email });
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "Given email is not valid",
      });
    }

    if (!(await userData.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Password is not valid",
      });
    }

    const payload = {
      id: userData.id,
      role: userData.role,
    };
    const token = generateToken(payload);
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      role: userData.role,
    });
  } catch (err) {
    console.log(`An error occured while ${userData.role} login =`, err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

router.post("/check-forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "You have no account with this email.",
      });
    }

    res.json({
      success: true,
      message: "Account found",
    });
  } catch (err) {
    console.error("Check forgot password error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.put("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "You have no account with this email.",
      });
    }

    user.password = newPassword;

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Reset password error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;