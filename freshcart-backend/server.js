const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");

const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const favoriteRoutes = require("./routes/favoriteRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const cartRoutes = require("./routes/cartRoutes");

dotenv.config();

const app = express();


// ===============================
// DATABASE
// ===============================

connectDB();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


// ===============================
// UPLOADS
// ===============================

// Profile images can be accessed through:
// http://192.168.154.166:5000/uploads/profiles/filename.jpg

app.use(
  "/uploads",
  express.static("uploads")
);


// ===============================
// ROOT
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FreshCart API is running 🚀",
  });
});


// ===============================
// AUTH ROUTES
// ===============================

app.use(
  "/api/auth",
  authRoutes
);


// ===============================
// USER ROUTES
// ===============================

app.use(
  "/api/users",
  userRoutes
);


// ===============================
// PRODUCT ROUTES
// ===============================

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/payment",
  paymentRoutes
);

app.use("/api/orders", orderRoutes);

app.use("/api/favorites", favoriteRoutes);

app.use("/api/settings", settingsRoutes);

app.use("/api/cart", cartRoutes);


// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `FreshCart Server running on port ${PORT}`
    );
  }
);