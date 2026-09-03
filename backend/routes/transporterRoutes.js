const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Order = require("../Models/Order");
const Tracking = require("../Models/Tracking");
const Transporter = require("../Models/Transporter");
const Company = require("../Models/Company");
const TransporterAssignment = require("../Models/TransporterAssignment");
const CompanyAssignment = require("../Models/CompanyAssignment");
const User = require("../Models/userModel");
const { jwtAuthMiddleware, generateToken } = require("../middleware/jwt");
const sendOrderStatusEmail = require("../services/statusChangeEmailService");
const dayjs = require("dayjs");

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const transporter = await Transporter.findOne({
      userId: req.user.id,
    });

    if (!transporter) {
      return res.status(404).json({
        success: false,
        message: "Transporter not found",
      });
    }

    res.json({
      success: true,
      transportername: transporter.transportername,
      email: transporter.email,
      phone: transporter.phone,
      company: transporter.company,
      vehicleNumber: transporter.vehicleNumber,
      vehicleType: transporter.vehicleType,
      licenseNumber: transporter.licenseNumber,
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
    const currentYear = new Date().getFullYear();

    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const transporter = await Transporter.findOne({
      userId: req.user.id,
    });

    if (!transporter) {
      return res.status(404).json({
        success: false,
        message: "Transporter not found",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter = {
      "transporter.transporterId": transporter._id,
    };

    const [
      totalOrders,
      todayDeliveries,
      pendingOrders,
      outForDelivery,
      deliveredOrders,
      recentOrders,
      weeklyDeliveries,
      monthlyDeliveries,
      yearlyDeliveries,
    ] = await Promise.all([
      // Total Orders
      Order.countDocuments(filter),

      // Today's Deliveries
      Order.countDocuments({
        ...filter,
        orderStatus: "Out For Delivery",
        outforDeliveryDate: {
          $gte: today,
        },
      }),

      // Pending Orders
      Order.countDocuments({
        ...filter,
        orderStatus: {
          $in: ["Shipped", "Packed"],
        },
      }),

      // Out For Delivery
      Order.countDocuments({
        ...filter,
        orderStatus: "Out For Delivery",
      }),

      // Delivered
      Order.countDocuments({
        ...filter,
        orderStatus: "Delivered",
      }),

      // Recent Orders
      Order.find(filter)
        .sort({ updatedAt: -1 })
        .limit(5)
        .select(
          "orderNumber payableAmount orderStatus updatedAt outforDeliveryDate deliveredDate address",
        )
        .lean(),

      // Weekly Deliveries (Mon-Sun)
      Order.aggregate([
        {
          $match: {
            ...filter,
            orderStatus: "Delivered",
            deliveredDate: {
              $gte: startOfWeek,
              $lt: endOfWeek,
            },
          },
        },
        {
          $group: {
            _id: { $isoDayOfWeek: "$deliveredDate" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Monthly Deliveries (Current Year)
      Order.aggregate([
        {
          $match: {
            ...filter,
            orderStatus: "Delivered",
            deliveredDate: {
              $gte: new Date(`${currentYear}-01-01`),
              $lt: new Date(`${currentYear + 1}-01-01`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$deliveredDate" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Yearly Deliveries
      Order.aggregate([
        {
          $match: {
            ...filter,
            orderStatus: "Delivered",
          },
        },
        {
          $group: {
            _id: { $year: "$deliveredDate" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Get order IDs
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

    const successRate =
      totalOrders === 0 ? 0 : Math.round((deliveredOrders / totalOrders) * 100);

    return res.json({
      success: true,

      stats: {
        totalOrders,
        todayDeliveries,
        pendingOrders,
        outForDelivery,
        deliveredOrders,
        successRate,
      },

      recentOrders: recentOrdersWithTracking,

      weeklyDeliveries,
      monthlyDeliveries,
      yearlyDeliveries,
    });
    
  } catch (err) {
    console.error("Dashboard Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/get-assigned-order", jwtAuthMiddleware, async (req, res) => {
  try {
    const transporter = await Transporter.findOne({
      userId: req.user.id,
    });

    if (!transporter) {
      return res.status(404).json({
        success: false,
        message: "Transporter not found",
      });
    }

    const assignedOrders = await Order.find({
      "transporter.transporterId": transporter._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders: assignedOrders,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/update-order-status/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const now = new Date();

    let updateData = {
      orderStatus,
    };

    let trackingUpdate = {
      currentStatus: orderStatus,
    };

    let timelineEntry = null;

    switch (orderStatus) {
      case "Packed":
        updateData.packageingDate = now;
        trackingUpdate.packageingDate = now;
        timelineEntry = {
          status: "Packed",
          location: "Warehouse",
          message: "Your order has been packed.",
          date: now,
        };
        break;

      case "Confirmed":
        updateData.confirmationDate = now;
        trackingUpdate.confirmationDate = now;
        timelineEntry = {
          status: "Confirmed",
          location: "Warehouse",
          message: "Your order has been confirmed.",
          date: now,
        };
        break;

      case "Shipped":
        updateData.shippingDate = now;
        trackingUpdate.shippingDate = now;
        timelineEntry = {
          status: "Shipped",
          location: "Dispatch Center",
          message: "Your package has been shipped.",
          date: now,
        };
        break;

      case "Out For Delivery":
        updateData.outforDeliveryDate = now;
        trackingUpdate.outforDeliveryDate = now;
        timelineEntry = {
          status: "Out For Delivery",
          location: "Local Hub",
          message: "Your package is out for delivery.",
          date: now,
        };
        break;

      case "Delivered":
        updateData.deliveredDate = now;
        trackingUpdate.deliveredDate = now;
        timelineEntry = {
          status: "Delivered",
          location: "Customer Address",
          message: "Package delivered successfully.",
          date: now,
        };
        break;
    }

    // Update Order
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true },
    ).populate("userId", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update Tracking
    const tracking = await Tracking.findOne({ orderId: order._id });

    if (tracking) {
      Object.assign(tracking, trackingUpdate);

      if (timelineEntry) {
        tracking.timeline.push(timelineEntry);
      }

      await tracking.save();
    }

    if (orderStatus === "Delivered") {
      const transporterId = order.transporter?.transporterId;
      const companyId = order.company?.companyId;

      if (transporterId) {
        const transporter = await Transporter.findByIdAndUpdate(
          transporterId,
          {
            $set: {
              isAvailable: true,
              currentAssignment: null,
            },
          },
          { new: true },
        );
      }

      // Complete transporter assignment
      const assignment = await TransporterAssignment.findOneAndUpdate(
        {
          orderId: order._id,
          transporterId,
        },
        {
          $set: {
            status: "Completed",
            completedDate: now,
          },
        },
        { new: true },
      );

      await CompanyAssignment.findOneAndUpdate(
        {
          orderId: order._id,
          companyId,
        },
        {
          $set: {
            status: "Completed",
            completedDate: now,
          },
        },
        { new: true },
      );
    }

    try {
      await sendOrderStatusEmail({
        email: order.userId.email,
        customerName: order.userId.name,
        orderNumber: order.orderNumber,
        status: orderStatus,
        trackingNumber: tracking.trackingNumber,
        estimatedDelivery: new Date(order.estimatedDelivery).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        ),
      });
    } catch (err) {
      // console.error("Email Error:", err.message);
      console.log(err);

      console.log(err.response);

      console.log(err.response?.body);

      console.log(err.response?.text);
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/get-transporter-profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const transporter = await Transporter.findOne({ userId: user._id });

    res.json({
      success: true,
      user,
      transporter,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put(
  "/update-transporter-profile",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      const { companyName, email, mobileNumber } = req.body;

      const transporter = await Transporter.findOne({ userId: req.user.id });

      if (!transporter) {
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
        message: "Transporter profile updated successfully",
        company,
      });
    } catch (err) {
      console.error("Update transporter profile error:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

router.get("/completed-deliveries", jwtAuthMiddleware, async (req, res) => {
  try {
        const transporter = await Transporter.findOne({ userId: req.user.id });
        
        const orders = await Order.find({
          "transporter.transporterId": transporter?._id,
          orderStatus: "Delivered",
        }).sort({ deliveredDate: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/todays-deliveries", jwtAuthMiddleware, async (req, res) => {
  try {

    const transporter = await Transporter.findOne({ userId: req.user.id });

    const orders = await Order.find({
      "transporter.transporterId": transporter?._id,
      orderStatus: "Out For Delivery",
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
