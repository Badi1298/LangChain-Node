const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const parsePdfController = require("../controllers/parsePdfController");

// POST route for uploading and parsing PDF files
router.post("/precomplete", upload.single("pdf"), parsePdfController.parseUploadedPdf);

// POST route for uploading and parsing PDF files with custom model and prompt
router.post(
	"/precomplete/custom",
	upload.single("pdf"),
	parsePdfController.parseUploadedPdfWithCustomPrompt
);

module.exports = router;
