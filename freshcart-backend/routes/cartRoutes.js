const express = require("express");

const router = express.Router();

const {
  getCart,
  saveCart,
  clearCart,
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getCart);

router.put("/", authMiddleware, saveCart);

router.delete("/", authMiddleware, clearCart);

module.exports = router;