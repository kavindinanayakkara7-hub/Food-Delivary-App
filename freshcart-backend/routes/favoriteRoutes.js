const express = require("express");

const router = express.Router();

const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require("../controllers/favoriteController");

const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// GET MY FAVORITES
// GET /api/favorites
// =====================================================

router.get(
  "/",
  authMiddleware,
  getFavorites
);

// =====================================================
// ADD FAVORITE
// POST /api/favorites
// =====================================================

router.post(
  "/",
  authMiddleware,
  addFavorite
);

// =====================================================
// CHECK FAVORITE
// GET /api/favorites/check/:productId
// =====================================================

router.get(
  "/check/:productId",
  authMiddleware,
  checkFavorite
);

// =====================================================
// REMOVE FAVORITE
// DELETE /api/favorites/:productId
// =====================================================

router.delete(
  "/:productId",
  authMiddleware,
  removeFavorite
);

module.exports = router;