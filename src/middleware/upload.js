const multer = require("multer");
const path = require("path");

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Add unique timestamp to avoid filename conflicts
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // Set file size limit to 10MB
});

module.exports = upload;
