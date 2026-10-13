const express = require("express");

const {
  getProducts,
  getAllProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ===============================
// PUBLIC
// ===============================

router.get(
  "/",
  getProducts
);

router.get(
  "/:id",
  getProduct
);

// ===============================
// ADMIN
// ===============================

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllProducts
);

// ===============================
// ADD PRODUCT
// ===============================

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  addProduct
);

// ===============================
// UPDATE PRODUCT
// ===============================

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateProduct
);

// ===============================
// DELETE PRODUCT
// ===============================

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

module.exports = router;