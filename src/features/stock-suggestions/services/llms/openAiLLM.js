const openai = require("../../../../services/openaiClient.js");

/**
 * Generates an explanation for stock decorrelation using an LLM.
 *
 * @param {Array<object>} selectedStocks - The user's selected stocks (input structure).
 * @param {Array<object>} retrievalResults - The stocks retrieved from Pinecone.
 * @returns {Promise<string>} - A string containing the LLM-generated explanation.
 */
async function openAiSuggestions({ selectedStocks, retrievalResults, systemPrompt, userPrompt }) {
	if (
		!selectedStocks ||
		selectedStocks.length === 0 ||
		!retrievalResults ||
		retrievalResults.length === 0
	) {
		console.error("[LLM Service] Error: Missing input data for LLM generation.");
		return;
	}

	let allStocks = [];

	// --- 0. Fetch Stock Data ---
	try {
		const response = await fetch("http://localhost:7018/api/open/autobots/get-list");
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		allStocks = data;
	} catch (error) {
		console.error("Error fetching stock data:", error);
		return [];
	}

	// --- 1. Prepare Context for Prompt ---
	const selectedStocksData = selectedStocks.map((stock) => ({
		name: stock.name,
		ticker: stock.ticker,
		volatility_12: stock.volatility_6,
	}));

	const retrievedStocksData = retrievalResults.map((stock) => {
		const stockDetails = allStocks.find((s) => s.ticker === stock);

		if (stockDetails) {
			return {
				name: stockDetails.name,
				ticker: stockDetails.ticker,
				volatility_12: stockDetails.volatility_12,
			};
		}

		return null; // Handle case where stock is not found
	});

	const userMessage = userPrompt({
		selectedInfo: JSON.stringify(selectedStocksData, null, 2),
		suggestionsInfo: JSON.stringify(retrievedStocksData, null, 2),
	});

	console.log(`[LLM Service] User message: ${userMessage}`);
	// return;

	// --- 2. Call OpenAI API ---
	try {
		const chatModel = "gpt-4o";
		console.log(`[LLM Service] Requesting explanation from ${chatModel}...`);

		const response = await openai.chat.completions.create({
			model: chatModel, // Use the specified chat model
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userMessage },
			],
			temperature: 0.5, // Adjust for desired creativity/factuality balance
			max_tokens: 500, // Adjust based on expected length (e.g., 10 stocks * 2 lines * ~20 tokens/line)
			n: 1, // Request one response
		});

		const explanation = response.choices[0]?.message?.content?.trim();

		if (explanation) {
			console.log("[LLM Service] Explanation received.");
			return explanation;
		} else {
			console.error("[LLM Service] Error: OpenAI response missing content.", response);
			return "Failed to generate explanation from AI.";
		}
	} catch (error) {
		console.error("[LLM Service] Error calling OpenAI API:", error);
		// Consider checking error type (e.g., rate limit, auth) for specific messages
		return `Error generating explanation: ${error.message || "Unknown API error"}`;
	}
}

module.exports = {
	openAiSuggestions,
};
