const Favorite = require("../models/Favorite");
const Product = require("../models/Product");

// =====================================================
// GET USER ID
// =====================================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    req.user?.user_id
  );
};

// =====================================================
// GET FAVORITES
// =====================================================

const getFavorites = async (req, res) => {
  try {
    const userId = getUserId(req);

    console.log("=================================");
    console.log("GET FAVORITES");
    console.log("REQ.USER:", req.user);
    console.log("USER ID:", userId);
    console.log("=================================");

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const favorites = await Favorite.find({
      userId,
    })
      .populate("productId")
      .sort({ createdAt: -1 });

    const products = favorites
      .map((favorite) => favorite.productId)
      .filter(Boolean);

    console.log("FAVORITES COUNT:", products.length);

    return res.status(200).json({
      success: true,
      count: products.length,
      favorites: products,
    });
  } catch (error) {
    console.error("GET FAVORITES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get favorites",
      error: error.message,
    });
  }
};

// =====================================================
// ADD FAVORITE
// =====================================================

const addFavorite = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.body;

    console.log("=================================");
    console.log("ADD FAVORITE");
    console.log("REQ.USER:", req.user);
    console.log("USER ID:", userId);
    console.log("PRODUCT ID:", productId);
    console.log("BODY:", req.body);
    console.log("=================================");

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check product
    const product = await Product.findById(productId);

    console.log("PRODUCT FOUND:", !!product);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check existing favorite
    const existingFavorite = await Favorite.findOne({
      userId,
      productId,
    });

    console.log(
      "EXISTING FAVORITE:",
      !!existingFavorite
    );

    if (existingFavorite) {
      return res.status(200).json({
        success: true,
        message: "Product already in watch list",
        favorite: existingFavorite,
      });
    }

    // Create favorite
    const favorite = await Favorite.create({
      userId,
      productId,
    });

    console.log(
      "FAVORITE CREATED:",
      favorite
    );

    return res.status(201).json({
      success: true,
      message: "Product added to watch list",
      favorite,
    });
  } catch (error) {
    console.error("=================================");
    console.error("ADD FAVORITE ERROR");
    console.error("MESSAGE:", error.message);
    console.error("NAME:", error.name);
    console.error("STACK:", error.stack);
    console.error("=================================");

    return res.status(500).json({
      success: false,
      message: "Failed to add favorite",
      error: error.message,
    });
  }
};

// =====================================================
// REMOVE FAVORITE
// =====================================================

const removeFavorite = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params;

    console.log("=================================");
    console.log("REMOVE FAVORITE");
    console.log("REQ.USER:", req.user);
    console.log("USER ID:", userId);
    console.log("PRODUCT ID:", productId);
    console.log("=================================");

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const deleted = await Favorite.findOneAndDelete({
      userId,
      productId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from watch list",
    });
  } catch (error) {
    console.error(
      "REMOVE FAVORITE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove favorite",
      error: error.message,
    });
  }
};

// =====================================================
// CHECK FAVORITE
// =====================================================

const checkFavorite = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params;

    console.log("=================================");
    console.log("CHECK FAVORITE");
    console.log("REQ.USER:", req.user);
    console.log("USER ID:", userId);
    console.log("PRODUCT ID:", productId);
    console.log("=================================");

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const favorite = await Favorite.findOne({
      userId,
      productId,
    });

    return res.status(200).json({
      success: true,
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error(
      "CHECK FAVORITE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to check favorite",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};