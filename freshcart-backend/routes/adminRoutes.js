const express = require("express");

const {
  loginAdmin,
  createAdmin,
} = require("../controllers/adminController");

const router = express.Router();

router.post("/login", loginAdmin);

// Use once to create admin
router.post("/create", createAdmin);

module.exports = router;