const express = require("express");

const router = express.Router();

const stockSuggestionsController = require("../controllers/stockSuggestionsController");

const decorrelationProvider = require("../../decorrelated.js");
const { retrieveDecorrelatedStocks } = require("../../retrieve-decorrelated.js");

router.post("/decorrelated", async (req, res) => {
	const { selectedStocks, query } = req.body;

	if (!selectedStocks || !Array.isArray(selectedStocks) || selectedStocks.length === 0) {
		return res
			.status(400)
			.json({ error: "Missing or invalid 'selectedStocks' array in request body." });
	}

	const pineconeIndex = req.app.locals.pineconeIndex;
	const vectorDimension = req.app.locals.vectorDimension;

	if (!pineconeIndex || !vectorDimension) {
		return res
			.status(500)
			.json({ error: "Pinecone index or vector dimension not initialized." });
	}

	try {
		const results = await retrieveDecorrelatedStocks(
			query || "Decorrelated stock suggestions query", // Use provided query or default
			selectedStocks, // Pass the array from the request
			pineconeIndex, // Your initialized Pinecone index
			vectorDimension, // Vector dimension from app.locals
			decorrelationProvider,
			30 // Desired number of suggestions (topK)
		);

		// **NEXT STEP**: If results are found, pass them to the LLM for explanation
		if (results.length > 0) {
			// Placeholder for LLM call
			// const explanation = await generateDecorrelationExplanation(query, selectedStocks, results);
			// res.json({ suggestions: results, explanation: explanation });
			res.json({ suggestions: results, explanation: "LLM explanation generation needed." }); // Send results back for now
		} else {
			res.json({
				suggestions: [],
				explanation: "No suitable decorrelated stocks found matching the criteria.",
			});
		}
	} catch (error) {
		console.error("Error in /suggest/decorrelated route:", error);
		res.status(500).json({ error: "Internal server error during suggestion retrieval." });
	}
});
router.post("/compute-stock-suggestions", stockSuggestionsController.computeStockSuggestions);

module.exports = router;
