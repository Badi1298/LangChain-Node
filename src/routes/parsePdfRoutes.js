const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const pdfController = require("../controllers/parsePdfControllers");

router.post(
  "/parse-product-information-termsheet",
  upload.single("pdf"),
  pdfController.parseProductInformationTermsheet
);

router.post(
  "/parse-product-details-termsheet",
  upload.single("pdf"),
  pdfController.parseProductDetailsTermsheet
);

module.exports = router;
