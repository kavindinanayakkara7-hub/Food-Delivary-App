const User = require("../models/User");

// ===============================
// GET PROFILE
// ===============================
const getProfile = async (req, res) => {
  try {
    console.log("PROFILE USER ID:", req.user.userId);

    const user = await User.findById(req.user.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile loaded successfully",

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
    console.log("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load profile",
      error: error.message,
    });
  }
};


// ===============================
// UPDATE PROFILE
// ===============================
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (address !== undefined) {
      user.address = address.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",

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
    console.log("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};


// ===============================
// UPLOAD PROFILE IMAGE
// ===============================
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image selected",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const imagePath =
      `/uploads/profiles/${req.file.filename}`;

    user.profileImage = imagePath;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        profileImage: user.profileImage,
      },
    });

  } catch (error) {
    console.log("PROFILE IMAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload profile image",
      error: error.message,
    });
  }
};


module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
};