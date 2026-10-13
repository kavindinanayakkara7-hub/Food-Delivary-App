const Cart = require("../models/Cart");

// =====================================================
// GET USER CART
// =====================================================

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
      });
    }

    res.status(200).json({
      success: true,
      cart: cart.items,
    });
  } catch (error) {
    console.log("GET CART ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load cart",
    });
  }
};

// =====================================================
// SAVE USER CART
// =====================================================

const saveCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Cart items must be an array",
      });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      {
        userId,
        items,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json({
      success: true,
      cart: cart.items,
    });
  } catch (error) {
    console.log("SAVE CART ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save cart",
    });
  }
};

// =====================================================
// CLEAR USER CART
// =====================================================

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await Cart.findOneAndUpdate(
      { userId },
      {
        items: [],
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.log("CLEAR CART ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};

module.exports = {
  getCart,
  saveCart,
  clearCart,
};