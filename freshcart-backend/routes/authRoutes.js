const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  registerAdmin,
} = require("../controllers/authController");

// Customer register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Admin register
router.post("/admin/register", registerAdmin);

module.exports = router;