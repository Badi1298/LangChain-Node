const express = require("express");

const router = express.Router();

const stockSuggestionsController = require("../controllers/stockSuggestionsController");

router.post("/stock-suggestions", stockSuggestionsController.computeStockSuggestions);

module.exports = router;
