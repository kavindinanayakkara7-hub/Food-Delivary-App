const mongoose = require("mongoose");

const Order = require("../models/Order");
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
// GENERATE ORDER NUMBER
// =====================================================

const generateOrderNumber = () => {
  const time = Date.now();

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `FC-${time}-${random}`;
};

// =====================================================
// CREATE ORDER
// =====================================================

const createOrder = async (req, res) => {
  try {
    const userId = getUserId(req);

    console.log(
      "================================="
    );

    console.log(
      "CREATE ORDER REQUEST"
    );

    console.log(
      "REQ.USER:",
      req.user
    );

    console.log(
      "USER ID:",
      userId
    );

    console.log(
      "================================="
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    const {
      customer,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !customer ||
      !customer.name ||
      !customer.email ||
      !customer.phone ||
      !customer.address
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complete customer information is required",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    if (
      !["ONLINE", "CASH_ON_DELIVERY"].includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method",
      });
    }

    // =================================================
    // CHECK PRODUCTS
    // =================================================

    const orderItems = [];

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is missing",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          item.productId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
        });
      }

      const product =
        await Product.findById(
          item.productId
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            `Product not found: ${item.name}`,
        });
      }

      if (
        product.status &&
        product.status !== "active"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${product.name} is not available`,
        });
      }

      if (
        product.stock !== undefined &&
        Number(product.stock) <
          Number(item.quantity)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${product.name} does not have enough stock`,
        });
      }

      const quantity =
        Number(item.quantity);

      const price =
        Number(item.price);

      const itemTotal =
        price * quantity;

      orderItems.push({
        productId:
          product._id,

        name:
          product.name ||
          item.name,

        price,

        unit:
          item.unit ||
          product.unit ||
          "1 kg",

        image:
          item.image ||
          product.image ||
          "",

        quantity,

        itemTotal,
      });
    }

    // =================================================
    // PAYMENT STATUS
    // =================================================

    let paymentStatus = "PENDING";
    let orderStatus = "PENDING";

    if (
      paymentMethod ===
      "CASH_ON_DELIVERY"
    ) {
      paymentStatus = "COD";
      orderStatus = "PLACED";
    }

    // =================================================
    // CREATE ORDER
    // =================================================

    const order =
      await Order.create({
        orderNumber:
          generateOrderNumber(),

        userId,

        customer: {
          name:
            customer.name,

          email:
            customer.email,

          phone:
            customer.phone,

          address:
            customer.address,
        },

        items: orderItems,

        subtotal:
          Number(subtotal) || 0,

        deliveryFee:
          Number(deliveryFee) || 0,

        total:
          Number(total) || 0,

        paymentMethod,

        paymentStatus,

        orderStatus,
      });

    console.log(
      "ORDER CREATED SUCCESSFULLY:"
    );

    console.log(
      "ORDER ID:",
      order._id
    );

    console.log(
      "ORDER NUMBER:",
      order.orderNumber
    );

    return res.status(201).json({
      success: true,

      message:
        "Order created successfully",

      order,
    });
  } catch (error) {
    console.log(
      "CREATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create order",

      error:
        error.message,
    });
  }
};

// =====================================================
// GET MY ORDERS
// =====================================================

const getMyOrders = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    console.log(
      "================================="
    );

    console.log(
      "GET MY ORDERS"
    );

    console.log(
      "REQ.USER:",
      req.user
    );

    console.log(
      "USER ID:",
      userId
    );

    console.log(
      "================================="
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    const orders =
      await Order.find({
        userId: userId,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    console.log(
      "USER ORDERS COUNT:",
      orders.length
    );

    return res.status(200).json({
      success: true,

      count:
        orders.length,

      orders,
    });
  } catch (error) {
    console.log(
      "GET MY ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to load orders",

      error:
        error.message,
    });
  }
};

// =====================================================
// GET SINGLE ORDER
// =====================================================

const getOrderById = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    const orderId =
      req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID",
      });
    }

    const order =
      await Order.findOne({
        _id: orderId,

        userId: userId,
      }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    return res.status(200).json({
      success: true,

      order,
    });
  } catch (error) {
    console.log(
      "GET ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to load order",

      error:
        error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};