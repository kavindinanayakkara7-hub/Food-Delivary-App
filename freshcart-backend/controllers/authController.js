const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// REGISTER CUSTOMER
// ===============================
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
    } = req.body;

    // Validate fields
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create customer
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password: hashedPassword,
      address: address.trim(),
      role: "customer",
      profileImage: "",
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        profileImage: user.profileImage || "",
      },
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// ===============================
// LOGIN
// ===============================
const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    console.log("LOGIN EMAIL:", cleanEmail);

    // Find user
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      console.log(
        "USER NOT FOUND:",
        cleanEmail
      );

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log(
      "USER FOUND:",
      user.email
    );

    // Compare password
    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    console.log(
      "PASSWORD MATCH:",
      passwordMatch
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        profileImage:
          user.profileImage || "",
      },
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// ===============================
// ADMIN REGISTER
// ===============================
const registerAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    // Check existing account
    const existingUser =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // Create admin
    const admin = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone
        ? phone.trim()
        : "",
      password: hashedPassword,
      address: address
        ? address.trim()
        : "",
      role: "admin",
      profileImage: "",
    });

    // Create JWT
    const token = jwt.sign(
      {
        userId: admin._id.toString(),
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      success: true,
      message:
        "Admin account created successfully",

      token,

      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        address: admin.address,
        role: admin.role,
        profileImage:
          admin.profileImage || "",
      },
    });

  } catch (error) {
    console.log(
      "ADMIN REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Admin registration failed",
      error: error.message,
    });
  }
};

// ===============================
// EXPORTS
// ===============================
module.exports = {
  registerUser,
  loginUser,
  registerAdmin,
};