const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const {
  getProfile,
  updateProfile,
  uploadProfileImage,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");


// ===============================
// MULTER STORAGE
// ===============================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles");
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname);

    const filename =
      `profile-${req.user.userId}-${Date.now()}${extension}`;

    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, PNG and WEBP images are allowed"
        )
      );
    }
  },
});


// ===============================
// PROFILE
// ===============================

router.get(
  "/profile",
  authMiddleware,
  getProfile
);


router.put(
  "/profile",
  authMiddleware,
  updateProfile
);


// ===============================
// PROFILE IMAGE
// ===============================

router.post(
  "/profile/image",
  authMiddleware,
  upload.single("profileImage"),
  uploadProfileImage
);


module.exports = router;