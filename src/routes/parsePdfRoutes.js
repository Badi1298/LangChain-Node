const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const parsePdfController = require("../controllers/parsePdfController");

// POST route for uploading and parsing PDF files
router.post("/upload", upload.single("file"), parsePdfController.parseUploadedPdf);

module.exports = router;
