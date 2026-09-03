const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Order = require("../Models/Order");
const Tracking = require("../Models/Tracking");
const Transporter = require("../Models/Transporter");
const Company = require("../Models/Company");
const TransporterAssignment = require("../Models/TransporterAssignment");
const User = require("../Models/userModel");
const CompanyAssignment = require("../Models/CompanyAssignment");
const { jwtAuthMiddleware, generateToken } = require("../middleware/jwt");

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const company = await Company.findOne({
      userId: req.user.id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      companyName: company.companyName,
      email: company.email,
      mobileNumber: company.mobileNumber,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/dashboard-data", jwtAuthMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();

    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(today.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // 1. Find company of logged-in user
    const company = await Company.findOne({
      userId: req.user.id,
      isActive: true,
    }).select("_id companyName email");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // 2. Filter orders by company
    const companyFilter = {
      "company.companyId": company._id,
    };

    // 3. Dashboard data
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      packedOrders,
      shippedOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      recentOrders,
      weeklyOrders,
      monthlyOrders,
      yearlyOrders,
    ] = await Promise.all([
      // Total
      Order.countDocuments(companyFilter),

      // Pending
      Order.countDocuments({
        ...companyFilter,
        orderStatus: "Pending",
      }),

      // Confirmed
      Order.countDocuments({
        ...companyFilter,
        orderStatus: "Confirmed",
      }),

      // Packed
      Order.countDocuments({
        ...companyFilter,
        orderStatus: "Packed",
      }),

      // Shipped
      Order.countDocuments({
        ...companyFilter,
        orderStatus: "Shipped",
      }),

      // Out For Delivery
      Order.countDocuments({
        ...companyFilter,
        orderStatus: "Out For Delivery",
      }),

      // Delivered
      Order.countDocuments({
        ...companyFilter,
        orderStatus: "Delivered",
      }),

      // Cancelled
      Order.countDocuments({
        ...companyFilter,
        orderStatus: "Cancelled",
      }),

      // Recent 5 orders
      Order.find(companyFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "orderNumber orderStatus paymentStatus payableAmount createdAt company",
        )
        .lean(),

      Order.aggregate([
        {
          $match: {
            ...companyFilter,
            createdAt: { $gte: startOfWeek, $lt: endOfWeek },
          },
        },
        {
          $group: {
            _id: { $isoDayOfWeek: "$createdAt" }, // 1=Mon ... 7=Sun
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Monthly (Jan-Dec current year)
      Order.aggregate([
        {
          $match: {
            ...companyFilter,
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lt: new Date(`${currentYear + 1}-01-01`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Yearly
      Order.aggregate([
        { $match: companyFilter },
        {
          $group: {
            _id: { $year: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const orderIds = recentOrders.map((order) => order._id);
    
        // Get tracking information
        const trackingRecords = await Tracking.find({
          orderId: { $in: orderIds },
        })
          .select("orderId trackingNumber currentStatus carrier")
          .lean();
    
        // Add tracking information to orders
        const recentOrdersWithTracking = recentOrders.map((order) => {
          const tracking = trackingRecords.find(
            (item) => item.orderId.toString() === order._id.toString(),
          );
    
          return {
            ...order,
            trackingNumber: tracking?.trackingNumber || null,
            carrier: tracking?.carrier || null,
            trackingStatus: tracking?.currentStatus || null,
          };
        });
    

    // 4. Success rate
    const successRate =
      totalOrders === 0 ? 0 : Math.round((deliveredOrders / totalOrders) * 100);

    // 5. Response
    return res.status(200).json({
      success: true,

      company: {
        _id: company._id,
        companyName: company.companyName,
        email: company.email,
      },

      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        packedOrders,
        shippedOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        successRate,
      },

      recentOrders: recentOrdersWithTracking,

      weeklyOrders,
      monthlyOrders,
      yearlyOrders,
    });
  } catch (err) {
    console.error("Company dashboard error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/add-transporter-details", jwtAuthMiddleware, async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      password,
      phone,
      companyId,
      vehicleNumber,
      vehicleType,
      licenseNumber,
      companyName,
    } = req.body;

    // Check email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Check mobile already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists.",
      });
    }

    // Check vehicle number already exists
    const existingVehicle = await Transporter.findOne({
      vehicleNumber,
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number already exists.",
      });
    }

    // Check license number already exists
    const existingLicense = await Transporter.findOne({
      licenseNumber,
    });

    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: "License number already exists.",
      });
    }

    // Create login user
    const user = await User.create({
      name,
      email,
      username: email,
      password,
      phone,
      role: "transporter",
    });

    // Create transporter profile
    const transporter = await Transporter.create({
      userId: user._id,
      transportername: name,
      company: {
        companyId,
        companyName,
      },
      vehicleNumber,
      vehicleType,
      licenseNumber,
      email,
      phone,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Transporter added successfully.",
      user,
      transporter,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//get all transporters
router.get(
  "/get-all-transporters-by-company",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      const transporters = await Transporter.find({ createdBy: req.user.id })
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 });
      res.json({ transporters });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch transporters" });
    }
  },
);

//Toggle Active Status (Update User + Transporter)
router.patch(
  "/toggle-status-for-transporter/:id",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      const { isActive } = req.body;

      const transporter = await Transporter.findById(req.params.id);

      if (!transporter) {
        return res.status(404).json({
          success: false,
          message: "Transporter not found",
        });
      }

      // Update transporter
      transporter.isActive = isActive;
      await transporter.save();

      // Update linked user
      await User.findByIdAndUpdate(
        transporter.userId,
        { isActive },
        { new: true },
      );

      const updated = await Transporter.findById(req.params.id).populate(
        "userId",
        "name email phone isActive",
      );

      res.json({
        success: true,
        message: `Transporter ${isActive ? "activated" : "deactivated"} successfully`,
        updated,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

//Toggle Availability (Update Transporter Only)
router.patch(
  "/toggle-availability-for-transporter/:id",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      const { isAvailable } = req.body;

      const updated = await Transporter.findByIdAndUpdate(
        req.params.id,
        { isAvailable },
        { new: true },
      ).populate("userId", "name email phone");

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Transporter not found",
        });
      }

      res.json({
        success: true,
        message: `Transporter ${
          isAvailable ? "marked as available" : "marked as unavailable"
        } successfully`,
        updated,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

//Get single transporter details
router.get(
  `/get-single-transporter/:id`,
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      const item = await Transporter.findById(req.params.id).populate(
        "userId",
        "name email phone",
      );
      if (!item) return res.status(404).json({ error: "Item not found" });
      res.json(item);
    } catch (error) {
      console.error("GET single error:", error);
      res.status(500).json({ error: "Failed to fetch item" });
    }
  },
);

router.put(
  "/update-transporter-details/:id",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      const {
        transportername,
        companyId,
        companyName,
        email,
        phone,
        vehicleNumber,
        vehicleType,
        licenseNumber,
      } = req.body;

      const transporter = await Transporter.findById(req.params.id);

      if (!transporter) {
        return res.status(404).json({
          success: false,
          message: "Transporter not found",
        });
      }

      // Check email in User collection
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: transporter.userId },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }

      // Check phone in User collection
      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: transporter.userId },
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Mobile number already exists.",
        });
      }

      // Check vehicle number in Transporter collection
      const existingVehicle = await Transporter.findOne({
        vehicleNumber,
        _id: { $ne: req.params.id },
      });

      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: "Vehicle number already exists.",
        });
      }

      // Check license number in Transporter collection
      const existingLicense = await Transporter.findOne({
        licenseNumber,
        _id: { $ne: req.params.id },
      });

      if (existingLicense) {
        return res.status(400).json({
          success: false,
          message: "License number already exists.",
        });
      }

      transporter.transportername = transportername;

      transporter.company = {
        companyId,
        companyName,
      };

      transporter.email = email;
      transporter.phone = phone;
      transporter.vehicleNumber = vehicleNumber;
      transporter.vehicleType = vehicleType;
      transporter.licenseNumber = licenseNumber;

      await transporter.save();

      // Update login user details too
      await User.findByIdAndUpdate(transporter.userId, {
        name: transportername,
        email,
        phone,
      });

      res.json({
        success: true,
        message: "Transporter updated successfully",
        transporter,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

//Get available transporters for a specific company
router.get(
  "/get-available-transporters/:companyId",
  jwtAuthMiddleware,
  async (req, res) => {
    const transporters = await Transporter.find({
      "company.companyId": req.params.companyId,
      isAvailable: true,
      isActive: true,
    });

    res.json(transporters);
  },
);

//get all orders assigned to a company
router.get(
  "/get-all-orders-by-company",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      const company = await Company.findOne({
        userId: req.user.id,
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }

      // Fetch orders assigned to this company
      const orders = await Order.find({
        "company.companyId": company._id,
      }).sort({ createdAt: -1 });
      res.json({
        success: true,
        orders,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

//get avaialble transporter list
router.get(
  "/get-available-transporter-list", jwtAuthMiddleware, async (req, res) => {

    const transporters = await Transporter.find({
      "company.companyId": req.user.id,
      isAvailable: true,
      isActive: true,
    });

    res.json(transporters);
  },
);

//Assign transporter to an order
router.put("/assign-transporter/:orderId", jwtAuthMiddleware, async (req, res) => {
    try {
      const { transporterId } = req.body;
      const order = await Order.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const transporter = await Transporter.findById(transporterId);

      if (!transporter) {
        return res.status(404).json({
          success: false,
          message: "Transporter not found",
        });
      }

      const company = await Company.findOne({
        userId: req.user.id,
      });
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }
      
      if (!transporter.isAvailable) {
        return res.status(400).json({
          success: false,
          message: "Transporter is already engaged",
        });
      }

      // Update order

      order.company = {
        companyId: company._id,
        companyName: company.companyName,
      };

      order.transporter = {
        transporterId: transporter._id,
        transporterName: transporter.transportername,
        phone: transporter.phone,
        vehicleNumber: transporter.vehicleNumber,
      };

      await order.save();

      // Mark transporter unavailable

      transporter.isAvailable = false;

      await transporter.save();

      // Create assignment history

      const assignment = await TransporterAssignment.create({
        transporterId: transporter._id,

        orderId: order._id,

        company: {
          companyId: company._id,
          companyName: company.companyName,
        },

        estimatedDelivery: order.estimatedDelivery,
      });

      transporter.currentAssignment = assignment._id;

      await transporter.save();

      const companyAssignment = await CompanyAssignment.findOne({
        orderId: order._id,
        companyId: company._id,
      });

      if (!companyAssignment) {
        return res.status(404).json({
          success: false,
          message: "Company assignment not found",
        });
      }

      companyAssignment.giveOrderToTransporter = new Date();

      companyAssignment.transporter = {
        transporterId: transporter._id,
        transportername: transporter.transportername,
      };

      await companyAssignment.save();

      res.json({
        success: true,
        message: "Transporter assigned successfully",
        data: {
          order,
          companyAssignment,
          transporterAssignment: assignment,
        },
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
); 


//Ger single order details
router.get("/get-single-order-details/:id", jwtAuthMiddleware, async (req, res) => {
  try {
      const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email mobileNumber",
    );
    let company = null;
    let transporter = null;

    if (order.company?.companyId) {
      company = await Company.findById(order.company.companyId);
    }

    if (order.transporter?.transporterId) {
      transporter = await Transporter.findById(
        order.transporter.transporterId,
      ).populate("userId", "name email phone");
    }

    res.json({
      success: true,
      order,
      company,
      transporter,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/get-company-profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetPasswordOtp -resetPasswordOtpExpires -resetPasswordVerified",
    );

    const company = await Company.findOne({ userId: user._id });

    res.json({
      success: true,
      user,
      company,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/update-company-profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const { companyName, email, mobileNumber } = req.body;

    const company = await Company.findOne({ userId: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Update Company collection
    company.companyName = companyName;
    company.email = email;
    company.mobileNumber = mobileNumber;
    await company.save();

    // Update User collection
    await User.findByIdAndUpdate(req.user.id, {
      name: companyName,
      email,
      phone: mobileNumber,
      username: email,
    });

    res.json({
      success: true,
      message: "Company profile updated successfully",
      company,
    });
  } catch (err) {
    console.error("Update company profile error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
