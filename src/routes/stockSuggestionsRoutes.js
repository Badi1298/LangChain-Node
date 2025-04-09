const express = require("express");

const router = express.Router();

const stockSuggestionsController = require("../controllers/stockSuggestionsController");

const decorrelationProvider = require("../services/decorrelationProvider.js");
const { retrieveDecorrelatedStocks } = require("../services/stockSuggestionService.js");
const { generateDecorrelationExplanation } = require("../services/llmService.js");

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
		const retrievalResults = await retrieveDecorrelatedStocks(
			query || "Decorrelated stock suggestions query", // Use provided query or default
			selectedStocks, // Pass the array from the request
			pineconeIndex, // Your initialized Pinecone index
			vectorDimension, // Vector dimension from app.locals
			decorrelationProvider,
			50 // Desired number of suggestions (topK)
		);

		// --- Step 2: Generate Explanation (if stocks found) ---
		let explanation = "No suitable decorrelated stocks found matching the criteria.";
		if (retrievalResults.length > 0) {
			console.log(
				`[API Route] Generating explanation for ${retrievalResults.length} suggestions...`
			);
			explanation = await generateDecorrelationExplanation(
				query,
				selectedStocks, // Pass original selected stocks for context
				retrievalResults // Pass retrieved stocks for explanation
			);
		} else {
			console.log("[API Route] No retrieval results, skipping LLM explanation.");
		}

		// --- Step 3: Send Response ---
		res.json({
			suggestions: retrievalResults, // Array of suggested stock metadata
			explanation: explanation, // LLM-generated explanation string or default message
		});
	} catch (error) {
		console.error("Error in /suggest/decorrelated route:", error);
		res.status(500).json({ error: "Internal server error during suggestion retrieval." });
	}
});
router.post("/compute-stock-suggestions", stockSuggestionsController.computeStockSuggestions);

module.exports = router;
