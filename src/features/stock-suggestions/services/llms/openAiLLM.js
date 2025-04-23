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

	// --- 1. Prepare Context for Prompt ---
	// Use the first selected stock for primary context
	const stocksName = selectedStocks.map((stock) => stock.name).join(", ");
	const stocksSector = [...new Set(selectedStocks.map((stock) => stock.sector))].join(", ");
	const stocksSubSectors = [...new Set(selectedStocks.map((stock) => stock.sub_sector))].join(", ");
	// const suggestedStocksName = retrievalResults.map((stock) => stock.name).join(", ");

	const userMessage = userPrompt({
		selectedInfo: stocksName,
		suggestionsInfo: JSON.stringify(retrievalResults, null, 2), // Format for better readability
		stocksName,
		stocksSector,
		stocksSubSectors,
	});

	// --- 2. Call OpenAI API ---
	try {
		const chatModel = "gpt-4o-mini";
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
