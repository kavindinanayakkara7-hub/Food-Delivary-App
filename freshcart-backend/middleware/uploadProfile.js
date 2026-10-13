const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// PROFILE UPLOAD FOLDER
// ======================================================

const uploadPath = path.join(
  __dirname,
  "..",
  "uploads",
  "profiles"
);

// Create folder if it does not exist
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

// ======================================================
// STORAGE
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const fileName =
      "profile-" +
      Date.now() +
      "-" +
      Math.round(Math.random() * 100000) +
      extension;

    cb(null, fileName);
  },
});

// ======================================================
// FILE TYPE VALIDATION
// ======================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (
    allowedTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed"
      ),
      false
    );
  }
};

// ======================================================
// MULTER
// ======================================================

const uploadProfile = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = uploadProfile;