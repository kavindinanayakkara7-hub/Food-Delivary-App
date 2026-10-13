const express = require("express");

const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

// Create order
router.post(
  "/",
  authMiddleware,
  createOrder
);

// Get logged-in user's orders
router.get(
  "/my-orders",
  authMiddleware,
  getMyOrders
);

// Get single order
router.get(
  "/:id",
  authMiddleware,
  getOrderById
);

module.exports = router;