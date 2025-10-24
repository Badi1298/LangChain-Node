const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const productDetailsController = require("../controllers/productDetailsController");
const productInformationController = require("../controllers/productInformationController");
const vectorizeController = require("../controllers/vectorizeController");

router.post("/vectorize-pdf", upload.single("pdf"), vectorizeController.vectorizePdf);

router.post(
	"/parse-product-information-termsheet",
	productInformationController.parseProductInformationTermsheet
);

router.post(
	"/parse-product-details-termsheet",
	productDetailsController.parseProductDetailsTermsheet
);

router.post("/parse-product-underlyings", productDetailsController.parseProductUnderlyings);

module.exports = router;
