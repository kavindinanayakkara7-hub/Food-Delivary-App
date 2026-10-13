const express = require("express");

const {
  createPayment,
  paymentNotify,
  paymentReturn,
  paymentCancel,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Create PayHere payment
router.post(
  "/create",
  authMiddleware,
  createPayment
);


// PayHere server notification
router.post(
  "/notify",
  paymentNotify
);


// PayHere return
router.get(
  "/return",
  paymentReturn
);


// PayHere cancel
router.get(
  "/cancel",
  paymentCancel
);


module.exports = router;