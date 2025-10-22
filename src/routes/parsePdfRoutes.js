const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const productDetailsController = require("../controllers/productDetailsController");
const productInformationController = require("../controllers/productInformationController");

router.post(
	"/parse-product-information-termsheet",
	upload.single("pdf"),
	productInformationController.parseProductInformationTermsheet
);

router.post(
	"/parse-product-details-termsheet",
	upload.single("pdf"),
	productDetailsController.parseProductDetailsTermsheet
);

module.exports = router;
