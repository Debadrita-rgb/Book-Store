const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Book = require("../Models/bookModel"); 
const Category = require("../Models/Category");
const User = require("../Models/userModel");
const Language = require("../Models/Language");
const QuantityCounting = require("../Models/quantityCountingModel");
const Coupon = require("../Models/Coupon");
const Contact = require("../Models/Contact");
const Order = require("../Models/Order");
const Tracking = require("../Models/Tracking");
const Transporter = require("../Models/Transporter");
const Company = require("../Models/Company");
const TransporterAssignment = require("../Models/TransporterAssignment");
const CompanyAssignment = require("../Models/CompanyAssignment");
const Profile = require("../Models/Profile");
const BookQuantityCounting = require("../Models/quantityCountingModel");
const { jwtAuthMiddleware, generateToken } = require("../middleware/jwt");


const sendNewBookNotification = require("../services/newBookEmailService");

const checkAdminRole = async (userID) => {
  try {
    // console.log(userID);
    const user = await User.findById(userID);
    // console.log(user);
    if (user.role === "admin") {
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

router.post("/dashboard-data", jwtAuthMiddleware, async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const [
      totalUsers,
      totalBooks,
      totalCompanies,
      totalTransporters,
      totalOrders,
      totalCoupons,
      recentOrders,
      lowStockBooks,
      orderStatusData,
      topSellingBooks,
      revenueData,
      monthlyRevenue,
      yearlyRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Book.countDocuments(),
      Company.countDocuments({ isActive: true }),
      Transporter.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Coupon.countDocuments({ isActive: true }),

      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderNumber totalAmount paymentStatus orderStatus createdAt"),

      BookQuantityCounting.aggregate([
        {
          $group: {
            _id: "$bookId",
            available_quantity: { $sum: "$available_quantity" },
          },
        },
        { $match: { available_quantity: { $lte: 5 } } },
        {
          $lookup: {
            from: "books",
            localField: "_id",
            foreignField: "_id",
            as: "book",
          },
        },
        { $unwind: "$book" },
      ]),

      Order.aggregate([
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
          },
        },
      ]),

      Order.aggregate([
        { $unwind: "$books" },
        {
          $group: {
            _id: "$books.bookId",
            sold: { $sum: "$books.quantity" },
            title: { $first: "$books.title" },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: 5 },
      ]),

      Order.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: "$payableAmount" },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lt: new Date(`${currentYear + 1}-01-01`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$payableAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Yearly revenue
      Order.aggregate([
        {
          $group: {
            _id: { $year: "$createdAt" },
            revenue: { $sum: "$payableAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,

      stats: {
        totalUsers,
        totalBooks,
        totalOrders,
        totalCompanies,
        totalTransporters,
        totalCoupons,
        revenue: revenueData[0]?.revenue || 0,
      },

      recentOrders,
      lowStockBooks,
      orderStatusData,
      topSellingBooks,
      monthlyRevenue,
      yearlyRevenue,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/add-all-books", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const isAdmin = await checkAdminRole(userData.id || userData._id);
    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Unauthorized. Only admin can create a book." });
    }

    const { quantity, ...bookData } = req.body;
    const quantityValue = Number(quantity || 1);

    const book = new Book(bookData);
    await book.save();

    const quantityRecord = new QuantityCounting({
      bookId: book._id,
      total_quantity: quantityValue,
      available_quantity: quantityValue,
      used_quantity: 0,
      status: "active",
    });
    await quantityRecord.save();

try {
  await sendNewBookNotification(book);
} catch (emailError) {
  console.error("New book notification failed:", emailError.message);
}

      return res.status(201).json({
        success: true,
        message: "Book added successfully",
        book,
        quantityRecord,
      });
  } catch (error) {
    console.error("Add book error:", error);
    return res.status(500).json({ error: "Failed to add book" });
  }
});

router.post("/add-quantity-counting", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const isAdmin = await checkAdminRole(userData.id || userData._id);
    if (!isAdmin) {
      return res.status(403).json({
        message: "Unauthorized. Only admin can create a quantity record.",
      });
    }

    const {
      bookId,
      total_quantity,
      available_quantity,
      used_quantity = 0,
      status = "active",
    } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required." });
    }

    const totalValue = Number(total_quantity || 0);
    const usedValue = Number(used_quantity || 0);

    const quantityRecord = new QuantityCounting({
      bookId,
      total_quantity: totalValue,
      // remaining_quantity: Math.max(totalValue - usedValue, 0),
      used_quantity: usedValue,
      available_quantity: Math.max(totalValue - usedValue, 0),
      status,
    });

    await quantityRecord.save();

    return res
      .status(201)
      .json({ message: "Quantity record added successfully", quantityRecord });
  } catch (error) {
    console.error("Add quantity record error:", error);
    return res
      .status(500)
      .json({ error: "Failed to add quantity record", details: error.message });
  }
});

router.get("/get-book-and-available-quantity", jwtAuthMiddleware, async (req, res) => {
    try {
      const books = await Book.find().sort({ createdAt: -1 }).lean();
      const bookIds = books.map((book) => book._id);

      const quantities = await QuantityCounting.aggregate([
        {
          $match: {
            bookId: { $in: bookIds },
            status: "active",
          },
        },
        {
          $group: {
            _id: "$bookId",
            available_quantity: { $sum: "$available_quantity" },
            total_quantity: { $sum: "$total_quantity" },
            used_quantity: { $sum: "$used_quantity" },
            remaining_quantity: { $sum: "$remaining_quantity" },
            records: { $push: "$ $" },
          },
        },
      ]);

      const quantityMap = new Map(
        quantities.map((item) => [String(item._id), item]),
      );

      const booksWithQuantity = books.map((book) => {
        const quantitySummary = quantityMap.get(String(book._id));

        return {
          ...book,
          available_quantity: quantitySummary?.available_quantity ?? 0,
          total_quantity: quantitySummary?.total_quantity ?? 0,
          used_quantity: quantitySummary?.used_quantity ?? 0,
          remaining_quantity: quantitySummary?.remaining_quantity ?? 0,
          quantityRecords: quantitySummary?.records ?? [],
        };
      });

      return res.json(booksWithQuantity);
    } catch (error) {
      console.error("Get book and quantity error:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch books and quantities" });
    }
  },
);

// Generic CRUD Route Generator
const generateCRUDRoutes = (path, Model) => {
  
  router.get(`/get-${path}`, jwtAuthMiddleware, async (req, res) => {
    try {
      const items = await Model.find().sort({ createdAt: -1 });
      res.json(items);
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  router.get(`/get-single-${path}/:id`, jwtAuthMiddleware, async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found" });
      res.json(item);
    } catch (error) {
      console.error("GET single error:", error);
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  // Add
  router.post(`/add-${path}`, jwtAuthMiddleware, async (req, res) => {
    try {
      const item = new Model(req.body);
      await item.save();
      res.json({ message: `${path} added`, item });
    } catch (error) {
      console.error("Server Error:", error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  });

  // PUT update item by ID
  router.put(`/update-${path}/:id`, jwtAuthMiddleware, async (req, res) => {
    try {
      const updatedItem = await Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      if (!updatedItem)
        return res.status(404).json({ error: "Item not found" });
      res.json(updatedItem);
    } catch (error) {
      console.error("PUT error:", error);
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  // DELETE item by ID
  router.delete(`/delete-${path}/:id`, jwtAuthMiddleware, async (req, res) => {
    try {
      const deletedItem = await Model.findByIdAndDelete(req.params.id);
      if (!deletedItem)
        return res.status(404).json({ error: "Item not found" });
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("DELETE error:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Toggle isActive
  router.patch(
    `/toggle-${path}-status/:id`,
    jwtAuthMiddleware,
    async (req, res) => {
      const { isActive } = req.body;
      try {
        const updated = await Model.findByIdAndUpdate(
          req.params.id,
          { isActive },
          { new: true },
        );
        res.json({ message: `${path} status updated`, updated });
      } catch (err) {
        console.error("Toggle Error:", err);
        res.status(500).json({ message: `Failed to toggle ${path} status` });
      }
    },
  );

  // toggle Recommended
  router.patch(
    `/toggle-${path}-recommended/:id`,
    jwtAuthMiddleware,
    async (req, res) => {
      const { isRecommended } = req.body;
      try {
        const updated = await Model.findByIdAndUpdate(
          req.params.id,
          { isRecommended },
          { new: true },
        );
        res.json({ message: `${path} status updated`, updated });
      } catch (err) {
        console.error("Toggle Error:", err);
        res.status(500).json({ message: `Failed to toggle ${path} status` });
      }
    },
  );

  router.get(
    `/get-categorized-${path}`,
    jwtAuthMiddleware,
    async (req, res) => {
      try {
        const { category } = req.query;
        let query = {};

        if (category) {
          query.category = category;
        }

        const items = await Model.find(query);
        res.json(items);
      } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to fetch items" });
      }
    },
  );
};

generateCRUDRoutes("category", Category);
generateCRUDRoutes("company", Company);
generateCRUDRoutes("book", Book);
generateCRUDRoutes("language", Language);
generateCRUDRoutes("quantity-counting", QuantityCounting);
generateCRUDRoutes("coupon", Coupon);
generateCRUDRoutes("contact", Contact);
generateCRUDRoutes("order", Order);
generateCRUDRoutes("user", User);
generateCRUDRoutes("transporter", Transporter);

  router.post(`/add-coupon-section`, jwtAuthMiddleware, async (req, res) => {
    try {
      const item = new Coupon(req.body);
      await item.save();
      res.json({ message: `Coupon added`, item });
    } catch (error) {
      console.error("Server Error:", error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  });

//get all users with role USER
router.get("/get-all-users", jwtAuthMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/get-one-user/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -resetPasswordOtp -resetPasswordOtpExpires -resetPasswordVerified",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile = await Profile.findOne({
      userId: user._id,
    }).populate("favoriteGenres.catId", "name");

    return res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (err) {
    console.error("Get single user error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/get-all-orders-by-single-user/:userId", jwtAuthMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;

      // Get all orders of this user
      const orders = await Order.find({ userId })
        .populate("userId", "name email mobileNumber")
        .sort({ createdAt: -1 });

      if (!orders || orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No orders found for this user",
        });
      }

      // Get user profile
      const profile = await Profile.findOne({
        userId,
      }).populate("favoriteGenres.catId", "name");

      // Add company and transporter details to every order
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          let company = null;
          let transporter = null;

          // Company
          if (order.company?.companyId) {
            company = await Company.findById(order.company.companyId).lean();
          }

          // Transporter
          if (order.transporter?.transporterId) {
            transporter = await Transporter.findById(
              order.transporter.transporterId,
            )
              .populate("userId", "name email phone")
              .lean();
          }

          return {
            ...order.toObject(),
            company,
            transporter,
          };
        }),
      );
      return res.status(200).json({
        success: true,
        user: orders[0].userId,
        profile,
        orders: ordersWithDetails,
      });
    } catch (err) {
      console.error("Get user orders error:", err);

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

//order status
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
    );

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

//Ger single order details
router.get("/get-single-order-details/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let company = null;
    let transporter = null;
    let profile = null;

    // Get user profile
    if (order.userId?._id) {
      profile = await Profile.findOne({
        userId: order.userId._id,
      }).select("mobile birthday gender");
    }

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
      profile,
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

router.put("/edit_book/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const isAdmin = await checkAdminRole(userData.id);
    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Unauthorized. Only admin can create a candidate." });
    }
    const {
      title,
      author,
      category_id,
      publishedYear,
      price,
      description,
      coverImageLink,
      quantity,
    } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        category_id,
        publishedYear,
        price,
        description,
        coverImageLink,
        quantity,
      },
      { new: true },
    );
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Route for delete book by id

router.delete("/delete_book/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const isAdmin = await checkAdminRole(userData.id);
    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Unauthorized. Only admin can create a candidate." });
    }
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Route for get book by category id

router.get("/get_books_by_category/:category_id", async (req, res) => {
  try {
    const books = await Book.find({ category_id: req.params.category_id });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//Add transporter route
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

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Create transporter profile
    const transporter = await Transporter.create({
      userId: user._id,
      transportername: name,
      company: {
        companyId: company._id,
        companyName: company.companyName,
      },
      vehicleNumber,
      vehicleType,
      licenseNumber,
      email,
      phone,
      createdBy: req.user.id || req.user._id,
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
router.get("/get-all-transporters", jwtAuthMiddleware, async (req, res) => {
  try {
    const transporters = await Transporter.find().populate("userId", "name email phone").sort({ createdAt: -1 });
    res.json({ transporters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transporters" });
  }
});

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

router.put("/update-transporter-details/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const {
      transportername,
      companyId,
      email,
      phone,
      vehicleNumber,
      vehicleType,
      licenseNumber,
    } = req.body;

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
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

    const transporter = await Transporter.findById(req.params.id);

    if (!transporter) {
      return res.status(404).json({
        success: false,
        message: "Transporter not found",
      });
    }

    transporter.transportername = transportername;

    transporter.company = {
      companyId: company._id,
      companyName: company.companyName,
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
});

//Get available transporters for a specific company
router.get("/get-available-transporters/:companyId", jwtAuthMiddleware, async (req, res) => {
    const transporters = await Transporter.find({
      "company.companyId": req.params.companyId,
      isAvailable: true,
      isActive: true,
    });

    res.json(transporters);
  },
);

//Assign transporter to an order
router.put("/assign-transporter/:orderId", jwtAuthMiddleware, async (req, res) => {
    try {
      const { transporterId, companyId } = req.body;

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

      const company = await Company.findById(companyId);

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

      res.json({
        success: true,
        message: "Transporter assigned successfully",
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

//assign company to an order
router.put("/assign-company/:orderId", jwtAuthMiddleware, async (req, res) => {
    try {
      const { companyId } = req.body;

      const order = await Order.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const company = await Company.findById(companyId);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }

      // Update order

      order.company = {
        companyId: company._id,
        companyName: company.companyName,
      };

      await order.save();

      // Create Company Assignment
      const companyAssignment = await CompanyAssignment.create({
        companyId: company._id,
        orderId: order._id,
        assignedDate: new Date(),
        estimatedDelivery: order.estimatedDelivery,
        status: "Assigned",
      });

      res.json({
        success: true,
        message: "Company assigned successfully",
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

//Add Company route
router.post("/add-company-details", jwtAuthMiddleware, async (req, res) => {
  try {
    const {
      companyName,
      email,
      username,
      password,
      mobileNumber,
      
    } = req.body;

    // Check email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Check username already exists
    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already exists.",
      });
    }

    // Create login user
    const user = await User.create({
      name: companyName,
      email,
      username:email,
      password,
      phone: mobileNumber,
      role: "company",
    });

    // Create transporter profile
    const companyProfile = await Company.create({
      userId: user._id,
      companyName: companyName,
      email: email,
      mobileNumber: mobileNumber,
    });

    res.status(201).json({
      success: true,
      message: "Company added successfully.",
      user,
      companyProfile,
    });
  }  catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/update-company-details/:id", jwtAuthMiddleware, async (req, res) => {
    try {
      const {
        companyName,
        email,
        mobileNumber,
      } = req.body;

      const company = await Company.findById(req.params.id);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }

      company.companyName = companyName;
      company.email = email;
      company.mobileNumber = mobileNumber;
      
      await company.save();

      // Update login user details too
      await User.findByIdAndUpdate(company.userId, {
        name: companyName,
        email,
        phone: mobileNumber,
      });

      res.json({
        success: true,
        message: "Company updated successfully",
        company,
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

router.get(`/get-fullcontact-details`, jwtAuthMiddleware, async (req, res) => {
  try {
    const items = await Contact.find().sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});
module.exports = router;
