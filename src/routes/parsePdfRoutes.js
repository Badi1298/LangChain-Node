const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const parsePdfController = require("../controllers/parsePdfController");

// POST route for uploading and parsing PDF files
router.post("/prefill", parsePdfController.parseUploadedPdf);

// POST route for uploading and parsing PDF files with custom model and prompt
router.post(
	"/prefill/custom",
	upload.single("pdf"),
	parsePdfController.parseUploadedPdfWithCustomPrompt
);

module.exports = router;
