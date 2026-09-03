const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const razorpay = require("../api/razorpay");
//Image Storage
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const reviewUploadDir = path.join(__dirname, "../uploads/reviews");

if (!fs.existsSync(reviewUploadDir)) {
  fs.mkdirSync(reviewUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reviewUploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },

  limits: {
    // files: 10,
    fileSize: 5 * 1024 * 1024, // 5 MB per image
  },
});

const Book = require("../Models/bookModel");
const Category = require("../Models/Category");
const User = require("../Models/userModel");
const BookQuantityCounting = require("../Models/quantityCountingModel");
const Wishlist = require("../Models/wishlist");
const Cart = require("../Models/cart");
const WishlistList = require("../Models/wishlistList");
const Coupon = require("../Models/Coupon");
const Address = require("../Models/Address");
const Order = require("../Models/Order");
const Review = require("../Models/Review");
const Tracking = require("../Models/Tracking");
const Contact = require("../Models/Contact");
const Profile = require("../Models/Profile")

const { jwtAuthMiddleware, generateToken } = require("../middleware/jwt");

const sendOrderEmail = require("../services/createdOrderEmailService");
const generateInvoice = require("../utils/invoiceService");
const sendForgotPasswordOtpEmail = require("../services/sendForgotPasswordOtpEmail");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Account already exists",
      });
    }

    // Create user
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      // username: normalizedEmail,
      password,
      role: "user",
    });

    await newUser.save();

    // Create Profile
    const newProfile = new Profile({
      userId: newUser._id,
    });

    await newProfile.save();

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      userId: newUser._id,
    });
  } catch (err) {
    console.error("Error in signup:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});
// user Sign In
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email, role: "user" });
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "Given email is not valid",
      });
    }

    if (!userData.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact admin.",
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
      role: "user",
    };
    const token = generateToken(payload);
    const name = userData.name;
    const userId = userData._id;
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      name,
      userId,
    });
  } catch (err) {
    console.log("An error occured while admin login =", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

router.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "You have no account with this email.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    // Send OTP through your existing Brevo email service
    await sendForgotPasswordOtpEmail({
      name: user.name,
      email: user.email,
      otp,
    });
    res.json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to send OTP.",
    });
  }
});

router.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    if (!user.resetPasswordOtp) {
      return res.status(400).json({
        success: false,
        message: "Please request a new OTP.",
      });
    }

    if (user.resetPasswordOtpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Mark OTP as verified
    user.resetPasswordVerified = true;

    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to verify OTP.",
    });
  }
});

router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    if (!user.resetPasswordVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify OTP first.",
      });
    }

    user.password = password;

    // Clear reset data
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.resetPasswordVerified = false;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
});

//Get home category with book count respectively
router.get("/home-categories", async (req, res) => {
  try {
    // Get all active categories
    const categories = await Category.find({
      isActive: true,
    })
      .select("name")
      .sort({ name: 1 })
      .lean();

    // Count books for each category
    const categoryData = await Promise.all(
      categories.map(async (category) => {
        const bookCount = await Book.countDocuments({
          category: category.name,
          isActive: true,
        });

        return {
          name: category.name,
          books: `${bookCount} ${bookCount === 1 ? "Book" : "Books"}`,
          count: bookCount,
        };
      }),
    );

    res.json({
      success: true,
      data: categoryData,
    });
  } catch (err) {
    console.error("Category error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//recommened books with rating
router.get("/home-recommended-books", async (req, res) => {
  try {
    const books = await Book.aggregate([
      {
        $match: {
          isActive: true,
          isRecommended: true,
        },
      },

      // Get reviews
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "bookId",
          as: "reviews",
        },
      },

      // Calculate rating
      {
        $addFields: {
          rating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.rating" }, 1] },
              0,
            ],
          },

          reviewCount: {
            $size: "$reviews",
          },
        },
      },

      // Get book quantity
      {
        $lookup: {
          from: "bookquantitycountings",
          localField: "_id",
          foreignField: "bookId",
          as: "quantityData",
        },
      },

      // Calculate total available quantity
      {
        $addFields: {
          availableQuantity: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$quantityData",
                    as: "quantity",
                    cond: {
                      $eq: ["$$quantity.status", "active"],
                    },
                  },
                },
                as: "quantity",
                in: "$$quantity.available_quantity",
              },
            },
          },
        },
      },

      // Return required fields
      {
        $project: {
          title: 1,
          author: 1,
          price: 1,
          oldPrice: 1,
          coverImageLink: 1,
          category: 1,
          rating: 1,
          reviewCount: 1,
          availableQuantity: 1,
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },

      // Homepage shows only 4
      {
        $limit: 4,
      },
    ]);

    const totalBooks = await Book.countDocuments({
      isActive: true,
      isRecommended: true,
    });

    res.json({
      success: true,
      data: books,
      total: totalBooks,
    });
  } catch (err) {
    console.error("Recommended books error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//get categorized books
router.get("/categorized-books/:name", async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.name);

    const books = await Book.aggregate([
      {
        $match: {
          category: categoryName,
          isActive: true,
        },
      },

      // Get reviews
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "bookId",
          as: "reviews",
        },
      },

      // Calculate rating
      {
        $addFields: {
          rating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              {
                $round: [{ $avg: "$reviews.rating" }, 1],
              },
              0,
            ],
          },

          reviewCount: {
            $size: "$reviews",
          },
        },
      },

      // Get quantity
      {
        $lookup: {
          from: "bookquantitycountings",
          localField: "_id",
          foreignField: "bookId",
          as: "quantityData",
        },
      },

      // Calculate available quantity
      {
        $addFields: {
          availableQuantity: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$quantityData",
                    as: "quantity",
                    cond: {
                      $eq: ["$$quantity.status", "active"],
                    },
                  },
                },
                as: "quantity",
                in: "$$quantity.available_quantity",
              },
            },
          },
        },
      },

      // Required fields
      {
        $project: {
          title: 1,
          author: 1,
          price: 1,
          oldPrice: 1,
          coverImageLink: 1,
          category: 1,
          rating: 1,
          reviewCount: 1,
          availableQuantity: 1,
          createdAt: 1,
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    res.json({
      success: true,
      category: categoryName,
      count: books.length,
      data: books,
    });
  } catch (err) {
    console.error("Categorized books error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get(`/get-all-books`, async (req, res) => {
  try {
    const items = await Book.find({ isActive: true });
    res.json(items);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

router.get("/get_books", async (req, res) => {
  try {
    const { category, maxPrice, page = 1, limit } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

     const currentPage = Number(page);
     const perPage = Number(limit);

const totalBooks = await Book.countDocuments(query);

const books = await Book.find(query)
  .sort({ createdAt: -1 })
  .skip((currentPage - 1) * perPage)
  .limit(perPage);

      const bookIds = books.map((book) => book._id);

    const quantityDocs = await BookQuantityCounting.find({
      bookId: { $in: bookIds },
    });
    const quantityMap = new Map();

    quantityDocs.forEach((doc) => {
      const current = quantityMap.get(doc.bookId.toString()) || 0;
      quantityMap.set(
        doc.bookId.toString(),
        current + Number(doc.available_quantity || 0),
      );
    });

    const booksWithQuantity = books.map((book) => ({
      ...book.toObject(),
      available_quantity: quantityMap.get(book._id.toString()) || 0,
    }));

 res.json({
   books: booksWithQuantity,
   pagination: {
     currentPage,
     totalPages: Math.ceil(totalBooks / perPage),
     totalBooks,
     limit: perPage,
   },
 });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//available quantity
router.get("/get-quantity-by-bookId/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    const quantityDocs = await BookQuantityCounting.find({ bookId });

    const available_quantity = quantityDocs.reduce(
      (total, item) => total + Number(item.available_quantity || 0),
      0,
    );

    res.json({
      bookId,
      available_quantity,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching quantity",
      error: err.message,
    });
  }
});

//Route for get all books in a specific category

router.get("/get_books_by_category/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const books = await Book.find({ category: categoryId });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//Route for get a book by id

router.get("/get-single-book/:id", async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//Route for categorized book
router.get("/get_category", async (req, res) => {
  try {
    const category = await Category.find();
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//created wishlist List
router.post("/create-wishlist-list", jwtAuthMiddleware, async (req, res) => {
  try {
    const { listName } = req.body;

    const list = await WishlistList.create({
      userId: req.user.id,
      listName,
    });

    res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//get all list
router.get("/wishlist-lists", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const lists = await WishlistList.aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $lookup: {
          from: "wishlists",
          localField: "_id",
          foreignField: "listId",
          as: "items",
        },
      },
      {
        $addFields: {
          count: {
            $size: {
              $filter: {
                input: "$items",
                as: "item",
                cond: {
                  $eq: ["$$item.status", "active"],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          items: 0,
        },
      },
    ]);

    res.json({
      success: true,
      data: lists,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//move wishlist to another List
router.put("/move-wishlist", jwtAuthMiddleware, async (req, res) => {
  try {
    const { wishlistId, listId } = req.body;

    const wishlist = await Wishlist.findOne({
      _id: wishlistId,
      userId: req.user.id,
      status: "active",
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    const list = await WishlistList.findOne({
      _id: listId,
      userId: req.user.id,
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "Wishlist list not found",
      });
    }

    wishlist.listId = listId;

    await wishlist.save();

    res.json({
      success: true,
      message: "Book moved successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
//Get Books by List
router.get("/wishlist/:listId", jwtAuthMiddleware, async (req, res) => {
  const items = await Wishlist.find({
    userId: req.user.id,
    listId: req.params.listId,
    status: "active",
  });

  res.json({
    success: true,
    data: items,
  });
});

//Move Book to Another List
router.put("/move-wishlist", jwtAuthMiddleware, async (req, res) => {
  const { wishlistId, listId } = req.body;

  await Wishlist.findByIdAndUpdate(wishlistId, {
    listId,
  });

  res.json({
    success: true,
    message: "Book moved successfully",
  });
});

//Add wishlist
router.post("/add-to-wishlist", jwtAuthMiddleware, async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);

    const existing = await Wishlist.findOne({
      userId: req.user.id,
      bookId,
      status: "active",
    });

    if (existing) {
      return res.status(400).json({
        message: "Book already in wishlist",
      });
    }

    let defaultList = await WishlistList.findOne({
      userId: req.user.id,
      isDefault: true,
    });

    if (!defaultList) {
      defaultList = await WishlistList.create({
        userId: req.user.id,
        listName: "My Wishlist",
        isDefault: true,
      });
    }

    const wishlist = await Wishlist.create({
      userId: req.user.id,
      bookId,
      listId: defaultList._id,
      details: book.toObject(),
      status: "active",
    });

    res.status(201).json({
      message: "Book added to wishlist",
      wishlist,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

router.get("/check-wishlist/:bookId", jwtAuthMiddleware, async (req, res) => {
  try {
    const { bookId } = req.params;
    const wishlistItem = await Wishlist.findOne({
      userId: req.user.id,
      status: "active",
      bookId,
    });

    res.status(200).json({
      isWishlisted: !!wishlistItem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to check wishlist",
    });
  }
});

router.put(
  "/delete-from-wishlist/:wishlistId",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      const { wishlistId } = req.params;
      const wishlist = await Wishlist.findOneAndUpdate(
        {
          userId: req.user.id,
          _id: wishlistId,
          status: "active",
        },
        {
          status: "inactive",
        },
        { new: true },
      );

      if (!wishlist) {
        return res.status(404).json({
          success: false,
          message: "Wishlist item not found",
        });
      }

      res.json({
        success: true,
        message: "Removed from wishlist",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  },
);

//clear book from wishlist
router.put(
  "/clear-from-wishlist/:bookId",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      const { bookId } = req.params;

      const wishlist = await Wishlist.findOneAndUpdate(
        {
          userId: req.user.id,
          bookId,
          status: "active",
        },
        {
          status: "inactive",
        },
        { new: true },
      );

      if (!wishlist) {
        return res.status(404).json({
          success: false,
          message: "Wishlist item not found",
        });
      }

      res.json({
        success: true,
        message: "Removed from wishlist",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  },
);
//Wishlist Count by user
router.get("/wishlist-count/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Wishlist.countDocuments({
      userId,
      status: "active",
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/get-wishlist", jwtAuthMiddleware, async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({
      userId: req.user.id,
      status: "active",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: wishlistItems,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
});

//Cart section
router.post("/add-to-cart", jwtAuthMiddleware, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Already exists?
    const existingCart = await Cart.findOne({
      userId,
      bookId,
      status: "active",
    }); 

    if (existingCart) {
      existingCart.quantity += 1;

      await existingCart.save();

      return res.json({
        success: true,
        message: "Quantity updated",
      });
    }

    const cart = new Cart({
      userId,
      bookId,
      status: "active",
      details: book.toObject(),
      quantity: 1,
    });

    await cart.save();

    res.status(201).json({
      success: true,
      message: "Book added to cart",
      data: cart,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.get("/get-cart", jwtAuthMiddleware, async (req, res) => {
  try {
    const cartItems = await Cart.find({
      userId: req.user.id,
      status: "active",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: cartItems,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
});

//Cart Count by user
router.get("/cart-count/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const cartItems = await Cart.find({
      userId,
      status: "active",
    });

    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    res.status(200).json({
      success: true,
      count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/remove-cart/:cartId", jwtAuthMiddleware, async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      {
        _id: cartId,
        userId: req.user.id,
      },
      {
        status: "inactive",
      },
      { new: true },
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.put("/update-cart-qty", jwtAuthMiddleware, async (req, res) => {
  try {
    const { cartId, quantity } = req.body;

    const cart = await Cart.findOne({
      _id: cartId,
      userId: req.user.id,
      status: "active",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Count active stock of this book
    const stocks = await BookQuantityCounting.find({
      bookId: cart.bookId,
      status: "active",
    });

    const availableStock = stocks.reduce(
      (sum, item) => sum + item.available_quantity,
      0,
    );

    // Don't allow quantity greater than stock
    if (quantity > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} stock${availableStock > 1 ? "s" : ""} available`,
      });
    }

    cart.quantity = quantity;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Quantity updated",
      data: cart,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//save for later from cart page
router.post("/save-for-later", jwtAuthMiddleware, async (req, res) => {
  try {
    const { cartId } = req.body;

    const cart = await Cart.findOne({
      _id: cartId,
      userId: req.user.id,
      status: "active",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({
      userId: req.user.id,
      bookId: cart.bookId,
      status: "active",
    });

    let defaultList = await WishlistList.findOne({
      userId: req.user.id,
      isDefault: true,
    });

    if (!defaultList) {
      defaultList = await WishlistList.create({
        userId: req.user.id,
        listName: "My Wishlist",
        isDefault: true,
      });
    }

    if (!existingWishlist) {
      await Wishlist.create({
        userId: req.user.id,
        bookId: cart.bookId,
        listId: defaultList._id,
        status: "active",
        details: cart.details,
      });
    }

    cart.status = "wishlisted";
    await cart.save();

    res.json({
      success: true,
      message: "Book moved to wishlist",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.get("/show-all-coupons", jwtAuthMiddleware, async (req, res) => {
  try {
    const couponsItems = await Coupon.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: couponsItems,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
});

// router.post("/create-order", jwtAuthMiddleware, async (req, res) => {
//   try {
//     const { amount } = req.body;

//     if (!amount) {
//       return res.status(400).json({
//         message: "Amount is required",
//       });
//     }

//     const options = {
//       amount: Math.round(amount * 100),
//       currency: "INR",
//     };

//     const order = await razorpay.orders.create(options);

//     res.json(order);
//   } catch (error) {
//     console.log("RAZORPAY ERROR:", error);

//     res.status(500).json({
//       message: error.message,
//     });
//   }
// });

router.get("/get-default-address", jwtAuthMiddleware, async (req, res) => {
  const items = await Address.findOne({
    userId: req.user.id,
    isDefault: true,
    isActive: true,
  });

  res.json({
    success: true,
    data: items,
  });
});

router.post("/create-order", jwtAuthMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Amount is required",
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.log("RAZORPAY ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/confirm-book-order", jwtAuthMiddleware, async (req, res) => {
  try {
    const {
      items,
      address,
      subtotal,
      cgst,
      sgst,
      totalAmount,
      payableAmount,
      coupon,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;
    // Generate Order Number
    const orderNumber = "ORD" + Date.now() + Math.floor(Math.random() * 1000);

    const order = new Order({
      orderNumber,
      userId: req.user.id,
      books: items,
      address,
      subtotal,
      cgst,
      sgst,
      totalAmount,
      payableAmount,
      coupon,
      paymentMethod,
      paymentStatus: "Paid",
      orderStatus: "Ordered",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    });

    await order.save();

    //tracking order
    const tracking = await Tracking.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      trackingNumber: "TRK" + Date.now(),
      carrier: "Book Store Express",
      estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      currentStatus: "Ordered",
      timeline: [
        {
          status: "Ordered",
          location: "Book Store Warehouse",
          message: "Your order has been placed successfully.",
          date: new Date(),
        },
      ],
    });

    // Update inventory
    for (const item of items) {
      let remainingQty = item.quantity;

      const quantityDocs = await BookQuantityCounting.find({
        bookId: item.bookId,
        status: "active",
      }).sort({ createdAt: 1 });

      const totalAvailable = quantityDocs.reduce(
        (sum, doc) => sum + doc.available_quantity,
        0,
      );

      if (totalAvailable < remainingQty) {
        return res.status(400).json({
          success: false,
          message: `${item.title} has only ${totalAvailable} stock available.`,
        });
      }

      for (const doc of quantityDocs) {
        if (remainingQty === 0) break;

        if (doc.available_quantity >= remainingQty) {
          // This document has enough stock
          doc.used_quantity += remainingQty;
          doc.available_quantity -= remainingQty;

          if (doc.available_quantity === 0) {
            doc.status = "inactive";
          }

          await doc.save();
          remainingQty = 0;
        } else {
          // Consume all stock from this document
          remainingQty -= doc.available_quantity;

          doc.used_quantity += doc.available_quantity;
          doc.available_quantity = 0;
          doc.status = "inactive";

          await doc.save();
        }
      }
    }

    // Remove purchased items from cart
    const purchasedBookIds = items.map((i) => i.bookId);

    await Cart.updateMany(
      {
        userId: req.user.id,
        bookId: { $in: purchasedBookIds },
      },
      {
        $set: {
          status: "inactive",
        },
      },
    );

    const user = await User.findById(req.user.id);
    // console.log("Order", order);

    // console.log("User", user);
    // console.log("track", tracking);

    try {
      setImmediate(async () => {
        await sendOrderEmail({ order, user, tracking });
      });
    } catch (err) {
      console.log(err);

      console.log(err.response);

      console.log(err.response?.body);

      console.log(err.response?.text);
    }

    res.json({
      success: true,
      message: "Order placed successfully and Payment successful 🎉",
      data: order,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/get-Address", jwtAuthMiddleware, async (req, res) => {
  try {
    const addressList = await Address.find({
      userId: req.user.id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: addressList,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
});

router.put("/set-default/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    // Make all addresses non-default
    await Address.updateMany({ userId }, { $set: { isDefault: false } });

    // Make selected address default
    await Address.findByIdAndUpdate(addressId, { isDefault: true });

    res.json({
      success: true,
      message: "Default address updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/add-address", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      fullName,
      mobileNumber,
      alternateMobileNumber,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      postalCode,
      addressType,
      isDefault,
    } = req.body;

    const totalAddresses = await Address.countDocuments({ userId });

    let makeDefault = totalAddresses === 0 ? true : Boolean(req.body.isDefault);

    if (makeDefault) {
      await Address.updateMany(
        { userId },
        {
          $set: {
            isDefault: false,
          },
        },
      );
    }
    const address = await Address.create({
      userId,
      fullName,
      mobileNumber,
      alternateMobileNumber,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      postalCode,
      addressType,
      isDefault: makeDefault,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully.",
      data: address,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.delete("/delete-address/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const address = await Address.findOne({
      _id: addressId,
      userId,
      isActive: true,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await Address.findByIdAndUpdate(addressId, {
      isActive: false,
    });

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/get-address/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      data: address,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/update-address/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const {
      fullName,
      mobileNumber,
      alternateMobileNumber,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      postalCode,
      addressType,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateMany(
        { userId },
        {
          $set: {
            isDefault: false,
          },
        },
      );
    }

    const updatedAddress = await Address.findOneAndUpdate(
      {
        _id: addressId,
        userId,
      },
      {
        fullName,
        mobileNumber,
        alternateMobileNumber,
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        country,
        postalCode,
        addressType,
        isDefault,
      },
      {
        new: true,
      },
    );

    res.json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/my-orders", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter, year } = req.query;
    const user = await User.findById(userId).select("createdAt");

    let query = { userId };

    if (filter === "3months") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      query.createdAt = { $gte: threeMonthsAgo };
    }

    if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${Number(year) + 1}-01-01`);

      query.createdAt = {
        $gte: start,
        $lt: end,
      };
    }
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    for (const order of orders) {
      for (const book of order.books) {
        const stocks = await BookQuantityCounting.find({
          bookId: book.bookId,
          status: "active",
        }).lean();

        const available_quantity = stocks.reduce(
          (sum, stock) => sum + stock.available_quantity,
          0,
        );

        book.available_quantity = available_quantity;
      }
    }
    // Generate year list from signup year to current year
    const startYear = new Date(user.createdAt).getFullYear();
    const currentYear = new Date().getFullYear();

    const years = [];
    for (let y = startYear; y <= currentYear; y++) {
      years.push(y);
    }

    return res.status(200).json({
      success: true,
      data: orders,
      years,
    });
    
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/get-single-order/:orderId", jwtAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.orderId;

      const order = await Order.findOne({
        _id: orderId,
        userId,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      for (const book of order.books) {
        const stocks = await BookQuantityCounting.find({
          bookId: book.bookId,
          status: "active",
        }).lean();

        const available_quantity = stocks.reduce(
          (sum, stock) => sum + Number(stock.available_quantity || 0),
          0,
        );

        book.available_quantity = available_quantity;
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  },
);

router.post("/submit-review", jwtAuthMiddleware, upload.array("images"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const { orderId, bookId, rating, title, review } = req.body;

      const files = req.files || [];

      // console.log("Body:", req.body);

      // console.log("Files:", files.length);

      // Convert uploaded files to paths
      const imageUrls = files.map(
        (file) => `/uploads/reviews/${file.filename}`,
      );

      // If orderId exists, verify the order
      if (orderId) {
        const order = await Order.findOne({
          _id: orderId,
          userId,
          "books.bookId": bookId,
        });

        if (!order) {
          return res.status(400).json({
            success: false,
            message: "Book not found in your order.",
          });
        }

        // Prevent duplicate review for this order
        const alreadyReviewed = await Review.findOne({
          orderId,
          bookId,
          userId,
        });

        if (alreadyReviewed) {
          return res.status(400).json({
            success: false,
            message: "You already reviewed this books.",
          });
        }
      } else {
        // No orderId → check if user already reviewed this book
        const alreadyReviewed = await Review.findOne({
          bookId,
          userId,
        });

        if (alreadyReviewed) {
          return res.status(400).json({
            success: false,
            message: "You already reviewed this books.",
          });
        }
      }

      const reviewData = {
        bookId,
        userId,
        rating,
        title,
        review,
        images: imageUrls,
      };

      // Only save orderId when it exists
      if (orderId) {
        reviewData.orderId = orderId;
      }

      const newReview = await Review.create(reviewData);

      return res.status(201).json({
        success: true,
        message: "Review submitted successfully.",
        data: newReview,
      });
    } catch (err) {
      console.error("Submit review error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  },
);

//Get Review
router.get("/get-review-by-bookId/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await Review.find({
      bookId: bookId,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

//Get related books
router.get("/related-books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    const currentBook = await Book.findById(bookId);

    if (!currentBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const relatedBooks = await Book.find({
      _id: { $ne: bookId },
      category: {
        $in: currentBook.category || [],
      },
      isActive: true,
    })
      .limit(8)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: relatedBooks,
    });
  } catch (error) {
    console.error("Related books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch related books",
    });
  }
});

router.get("/track-package/:orderId", jwtAuthMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const tracking = await Tracking.findOne({
      orderId: req.params.orderId,
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Tracking not found",
      });
    }

    res.json({
      success: true,
      order,
      data: tracking,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/invoice/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    // console.log(order)
    const user = await User.findById(req.user.id);

    const pdfBuffer = await generateInvoice(order, user);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=invoice-${order.orderNumber}.pdf`,
    );

    return res.end(pdfBuffer);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//Person want to contact
router.post("/submit-contact", async (req, res) => {
  try {
    const { name, email, message, subject, status } = req.body;

    if (!["Contact", "Newsletter"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request type.",
      });
    }

    // Contact validation
    if (status === "Contact") {
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: "Name, email and message are required.",
        });
      }
    }

    // Newsletter validation
    if (status === "Newsletter") {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email address is required to subscribe.",
        });
      }

      // Check duplicate newsletter email
      const existingSubscriber = await Contact.findOne({
        email: email.toLowerCase().trim(),
        status: "Newsletter",
      });

      if (existingSubscriber) {
        return res.status(409).json({
          success: false,
          message: "This email is already subscribed to our newsletter.",
        });
      }
    }

    const newContact = new Contact({
      name: name || null,
      email: email.toLowerCase().trim(),
      message: message || null,
      subject: subject || null,
      status,
    });

    await newContact.save();

    let responseMessage = "";

    if (status === "Contact") {
      responseMessage =
        "Your message has been sent successfully. We will get back to you soon.";
    } else if (status === "Newsletter") {
      responseMessage =
        "You're subscribed successfully! You'll receive our latest updates, new book arrivals, and exclusive offers by email.";
    }

    res.status(200).json({
      success: true,
      message: responseMessage,
    });
  } catch (err) {
    console.error("Submit contact error:", err);

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
});

//Get profile details
router.get("/get-user-profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
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

    return res.json({
      success: true,
      user,
      profile,
    });
  } catch (err) {
    console.error("Get profile error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//Update user profile
router.put("/update-user-profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const {
      name,
      mobile,
      birthday,
      gender,
      favoriteGenres,
      favoriteAuthors,
      favoriteBook,
      readingPreference,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update User information
    if (name) {
      user.name = name.trim();
    }

    await user.save();

    // Convert category IDs into category objects
    let formattedGenres = [];

    if (Array.isArray(favoriteGenres)) {
      const categories = await Category.find({
        _id: { $in: favoriteGenres },
        isActive: true,
      }).select("_id name");

      formattedGenres = categories.map((category) => ({
        catId: category._id,
        categoryName: category.name,
      }));
    }

    // Find existing profile
    let profile = await Profile.findOne({
      userId: user._id,
    });

    // If profile doesn't exist, create it
    if (!profile) {
      profile = new Profile({
        userId: user._id,
      });
    }

    // Update Profile information
    profile.mobile = mobile;
    profile.birthday = birthday;
    profile.gender = gender;

    profile.favoriteGenres = formattedGenres;
    profile.favoriteAuthors = favoriteAuthors || "";
    profile.favoriteBook = favoriteBook || "";
    profile.readingPreference = readingPreference || "";

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      user,
      profile,
    });
  } catch (err) {
    console.error("Update profile error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
