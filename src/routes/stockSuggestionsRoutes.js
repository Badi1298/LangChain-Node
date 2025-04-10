const express = require("express");

const router = express.Router();

const stockSuggestionsController = require("../controllers/stockSuggestionsController");

const decorrelationProvider = require("../services/decorrelationProvider.js");
const { generateStockSuggestions } = require("../services/llmService.js");

const { stockSuggestionFields } = require("../services/stock-suggestion/index.js");

router.post("/decorrelated", async (req, res) => {
	const { selectedStocks, productType } = req.body;

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

	// Assuming this code is inside an async function (e.g., an Express route handler)
	// async (req, res) => { ... }

	const responseJson = [];
	const productTypeValues = Object.values(stockSuggestionFields[productType]);

	// Create an array of promises using map
	const promises = productTypeValues.map(async (productTypeFields) => {
		const { retriever, systemPrompt, userPrompt, sectionTitle } = productTypeFields;

		// --- Input Validation ---
		// Throw errors instead of sending responses directly inside the loop
		if (!retriever) {
			// Throw an error that includes status information if needed
			const error = new Error("Invalid product type or retriever not found.");
			error.statusCode = 400; // Add custom property for status
			throw error;
		}

		if (!systemPrompt || !userPrompt) {
			const error = new Error("Missing system or user prompt for LLM generation.");
			error.statusCode = 400;
			throw error;
		}

		// --- Process Each Product Type Field ---
		// Keep the try/catch for operations specific to this iteration,
		// but re-throw the error if it's critical to stop processing
		try {
			// --- Step 1: Retrieve Stocks ---
			const retrievalResults = await retriever({
				// Use the retriever directly
				selectedStocks,
				pineconeIndex,
				vectorDimension,
				decorrelationProvider,
				topK: 50,
			});

			// --- Step 2: Generate Explanation (if stocks found) ---
			let explanation = "No suitable decorrelated stocks found matching the criteria.";
			if (retrievalResults.length > 0) {
				console.log(
					`[API Route] Generating explanation for ${retrievalResults.length} suggestions for ${sectionTitle}...`
				);

				// Generate explanation using LLM
				explanation = await generateStockSuggestions({
					selectedStocks,
					retrievalResults,
					systemPrompt,
					userPrompt,
				});
			} else {
				console.log(
					`[API Route] No retrieval results for ${sectionTitle}, skipping LLM explanation.`
				);
			}

			// Push the result for this iteration *after* async operations complete
			// Note: Pushing here is a side effect. Alternatively, you could return
			// the object and collect results after Promise.all resolves. Pushing
			// works fine as long as errors are handled correctly.
			responseJson.push({
				sectionTitle,
				explanation,
			});
		} catch (error) {
			// Log the specific error for this iteration
			console.error(`Error processing section "${sectionTitle}":`, error);
			// Re-throw the error to make Promise.all fail
			// Add status code if it's not already set
			if (!error.statusCode) {
				error.statusCode = 500; // Default to internal server error
			}
			error.message = `Failed during processing for section "${sectionTitle}": ${error.message}`; // Add context
			throw error;
		}
	}); // End of map callback

	// --- Wait for all promises and send response ---
	try {
		// Wait for all the promises generated by map() to resolve
		await Promise.all(promises);

		// Now responseJson is populated (if no errors occurred)
		console.log("[API Route] All suggestions processed successfully.");
		res.json({
			message: "Stock suggestions processed successfully.",
			suggestions: responseJson, // responseJson has been populated by the map callbacks
		});
	} catch (error) {
		// Catch any error thrown from inside the map or from Promise.all itself
		console.error("Error processing stock suggestions:", error);
		// Use the status code attached to the error, or default to 500
		const statusCode = error.statusCode || 500;
		const errorMessage = error.message || "Internal server error during suggestion processing.";
		// Ensure response hasn't already been sent (important if using older Express versions or custom middleware)
		if (!res.headersSent) {
			res.status(statusCode).json({ error: errorMessage });
		} else {
			console.error(
				"[API Route] Attempted to send error response, but headers were already sent."
			);
		}
	}
});
router.post("/compute-stock-suggestions", stockSuggestionsController.computeStockSuggestions);

module.exports = router;
