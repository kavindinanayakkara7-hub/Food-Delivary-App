const crypto = require("crypto");
const Order = require("../models/Order");

// =====================================================
// HELPERS
// =====================================================

const md5 = (value) => {
  return crypto
    .createHash("md5")
    .update(value)
    .digest("hex");
};

const generatePayHereHash = (
  merchantId,
  orderId,
  amount,
  currency,
  merchantSecret
) => {
  const formattedAmount =
    Number(amount).toFixed(2);

  const hashedSecret =
    md5(merchantSecret).toUpperCase();

  return md5(
    merchantId +
      orderId +
      formattedAmount +
      currency +
      hashedSecret
  ).toUpperCase();
};

// =====================================================
// CREATE PAYMENT
// =====================================================

const createPayment = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const {
      orderId,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message:
          "Order ID is required",
      });
    }

    const order =
      await Order.findOne({
        _id: orderId,
        userId,
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    if (
      order.paymentStatus ===
      "PAID"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order is already paid",
      });
    }

    // =================================================
    // PAYHERE SETTINGS
    // =================================================

    const merchantId =
      process.env.PAYHERE_MERCHANT_ID;

    const merchantSecret =
      process.env.PAYHERE_MERCHANT_SECRET;

    if (
      !merchantId ||
      !merchantSecret
    ) {
      return res.status(500).json({
        success: false,
        message:
          "PayHere credentials are not configured",
      });
    }

    const currency =
      order.currency || "LKR";

    const amount =
      Number(order.total).toFixed(2);

    const hash =
      generatePayHereHash(
        merchantId,
        order.orderNumber,
        amount,
        currency,
        merchantSecret
      );

    const publicUrl =
      process.env.BACKEND_PUBLIC_URL;

    if (!publicUrl) {
      return res.status(500).json({
        success: false,
        message:
          "BACKEND_PUBLIC_URL is not configured",
      });
    }

    const isSandbox =
      String(
        process.env.PAYHERE_SANDBOX
      ).toLowerCase() ===
      "true";

    const checkoutUrl =
      isSandbox
        ? "https://sandbox.payhere.lk/pay/checkout"
        : "https://www.payhere.lk/pay/checkout";

    // =================================================
    // CUSTOMER NAME
    // =================================================

    const fullName =
      order.customer.name.trim();

    const nameParts =
      fullName.split(" ");

    const firstName =
      nameParts.shift() ||
      "Customer";

    const lastName =
      nameParts.join(" ") ||
      "Customer";

    // =================================================
    // PAYMENT DATA
    // =================================================

    const paymentData = {
      merchant_id:
        merchantId,

      return_url:
        `${publicUrl}/api/payment/return?order_id=${order.orderNumber}`,

      cancel_url:
        `${publicUrl}/api/payment/cancel?order_id=${order.orderNumber}`,

      notify_url:
        `${publicUrl}/api/payment/notify`,

      first_name:
        firstName,

      last_name:
        lastName,

      email:
        order.customer.email,

      phone:
        order.customer.phone,

      address:
        order.customer.address,

      city:
        order.customer.city ||
        "Sri Lanka",

      country:
        "Sri Lanka",

      order_id:
        order.orderNumber,

      items:
        `FreshCart Order ${order.orderNumber}`,

      currency,

      amount,

      hash,
    };

    return res.json({
      success: true,

      checkoutUrl,

      paymentData,
    });
  } catch (error) {
    console.error(
      "CREATE PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create payment",
      error: error.message,
    });
  }
};

// =====================================================
// PAYHERE NOTIFY
// =====================================================

const paymentNotify = async (
  req,
  res
) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      method,
      status_message,
    } = req.body;

    console.log(
      "================================="
    );

    console.log(
      "PAYHERE NOTIFICATION"
    );

    console.log(
      req.body
    );

    console.log(
      "================================="
    );

    // -------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------

    if (
      !merchant_id ||
      !order_id ||
      !payhere_amount ||
      !payhere_currency ||
      !status_code ||
      !md5sig
    ) {
      return res.status(400).send(
        "Invalid payment notification"
      );
    }

    const merchantId =
      process.env.PAYHERE_MERCHANT_ID;

    const merchantSecret =
      process.env.PAYHERE_MERCHANT_SECRET;

    // -------------------------------------------------
    // VERIFY MERCHANT
    // -------------------------------------------------

    if (
      merchant_id !==
      merchantId
    ) {
      return res.status(400).send(
        "Invalid merchant"
      );
    }

    // -------------------------------------------------
    // GENERATE LOCAL SIGNATURE
    // -------------------------------------------------

    const hashedSecret =
      md5(
        merchantSecret
      ).toUpperCase();

    const localMd5 =
      md5(
        merchant_id +
          order_id +
          payhere_amount +
          payhere_currency +
          status_code +
          hashedSecret
      ).toUpperCase();

    // -------------------------------------------------
    // VERIFY SIGNATURE
    // -------------------------------------------------

    if (
      localMd5 !==
      String(md5sig).toUpperCase()
    ) {
      console.error(
        "PAYHERE SIGNATURE INVALID"
      );

      return res.status(400).send(
        "Invalid signature"
      );
    }

    // -------------------------------------------------
    // FIND ORDER
    // -------------------------------------------------

    const order =
      await Order.findOne({
        orderNumber:
          order_id,
      });

    if (!order) {
      return res.status(404).send(
        "Order not found"
      );
    }

    // -------------------------------------------------
    // VERIFY AMOUNT
    // -------------------------------------------------

    const receivedAmount =
      Number(
        payhere_amount
      ).toFixed(2);

    const orderAmount =
      Number(
        order.total
      ).toFixed(2);

    if (
      receivedAmount !==
      orderAmount
    ) {
      console.error(
        "PAYMENT AMOUNT MISMATCH"
      );

      order.paymentStatus =
        "FAILED";

      order.paymentMessage =
        "Payment amount mismatch";

      await order.save();

      return res.status(400).send(
        "Payment amount mismatch"
      );
    }

    // -------------------------------------------------
    // PAYMENT SUCCESS
    // -------------------------------------------------

    if (
      String(status_code) ===
      "2"
    ) {
      order.paymentStatus =
        "PAID";

      order.orderStatus =
        "CONFIRMED";

      order.paymentId =
        payment_id || "";

      order.paymentMethodUsed =
        method || "";

      order.paymentMessage =
        status_message || "Payment successful";

      order.paidAt =
        new Date();

      await order.save();

      console.log(
        "PAYMENT SUCCESS:",
        order.orderNumber
      );
    }

    // -------------------------------------------------
    // PAYMENT PENDING
    // -------------------------------------------------

    else if (
      String(status_code) ===
      "0"
    ) {
      order.paymentStatus =
        "PENDING";

      order.paymentMessage =
        status_message ||
        "Payment pending";

      await order.save();
    }

    // -------------------------------------------------
    // PAYMENT CANCELLED
    // -------------------------------------------------

    else if (
      String(status_code) ===
      "-1"
    ) {
      order.paymentStatus =
        "CANCELLED";

      order.paymentMessage =
        status_message ||
        "Payment cancelled";

      await order.save();
    }

    // -------------------------------------------------
    // PAYMENT FAILED
    // -------------------------------------------------

    else if (
      String(status_code) ===
      "-2"
    ) {
      order.paymentStatus =
        "FAILED";

      order.paymentMessage =
        status_message ||
        "Payment failed";

      await order.save();
    }

    // -------------------------------------------------
    // CHARGEBACK
    // -------------------------------------------------

    else if (
      String(status_code) ===
      "-3"
    ) {
      order.paymentStatus =
        "FAILED";

      order.paymentMessage =
        status_message ||
        "Payment chargedback";

      await order.save();
    }

    return res.status(200).send(
      "OK"
    );
  } catch (error) {
    console.error(
      "PAYMENT NOTIFY ERROR:",
      error
    );

    return res.status(500).send(
      "Server error"
    );
  }
};

// =====================================================
// RETURN
// =====================================================

const paymentReturn = async (
  req,
  res
) => {
  const {
    order_id,
  } = req.query;

  return res.send(`
    <html>
      <head>
        <title>FreshCart Payment</title>
      </head>

      <body
        style="
          font-family: Arial;
          text-align: center;
          padding-top: 80px;
        "
      >
        <h1>FreshCart</h1>

        <h2>Payment Processing</h2>

        <p>
          Order:
          ${order_id || ""}
        </p>

        <p>
          Please return to the FreshCart app.
        </p>
      </body>
    </html>
  `);
};

// =====================================================
// CANCEL
// =====================================================

const paymentCancel = async (
  req,
  res
) => {
  const {
    order_id,
  } = req.query;

  if (order_id) {
    await Order.findOneAndUpdate(
      {
        orderNumber:
          order_id,
      },
      {
        paymentStatus:
          "CANCELLED",
        paymentMessage:
          "Customer cancelled payment",
      }
    );
  }

  return res.send(`
    <html>
      <head>
        <title>FreshCart Payment Cancelled</title>
      </head>

      <body
        style="
          font-family: Arial;
          text-align: center;
          padding-top: 80px;
        "
      >
        <h1>FreshCart</h1>

        <h2>Payment Cancelled</h2>

        <p>
          Order:
          ${order_id || ""}
        </p>

        <p>
          You can return to the FreshCart app.
        </p>
      </body>
    </html>
  `);
};

module.exports = {
  createPayment,
  paymentNotify,
  paymentReturn,
  paymentCancel,
};