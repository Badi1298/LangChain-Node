const openai = require("../services/openaiClient.js");
const decorrelationPrompt = require("../prompts/phoenix-autocall/decorrelationPrompt.js");

/**
 * Generates an explanation for stock decorrelation using an LLM.
 *
 * @param {Array<object>} selectedStocksInput - The user's selected stocks (input structure).
 * @param {Array<object>} suggestedStocks - The stocks retrieved from Pinecone.
 * @returns {Promise<string>} - A string containing the LLM-generated explanation.
 */
async function generateStockSuggestions(selectedStocksInput, suggestedStocks) {
	if (
		!selectedStocksInput ||
		selectedStocksInput.length === 0 ||
		!suggestedStocks ||
		suggestedStocks.length === 0
	) {
		return "Could not generate explanation: Missing input data.";
	}

	console.log("reachedLLMService");
	return;

	// --- 1. Prepare Context for Prompt ---
	// Use the first selected stock for primary context
	const referenceStock = selectedStocksInput[0];
	const selectedInfo = `${referenceStock.name} (Sector: ${referenceStock.sector})`;

	// Format suggested stocks concisely
	const suggestionsInfo = suggestedStocks
		.map((stock) => `- ${stock.name} (Sector: ${stock.sector}, Industry: ${stock.sub_sector})`)
		.join("\n");

	// --- 2. Construct Prompt ---

	// --- 3. Call OpenAI API ---
	try {
		const chatModel = "gpt-4o-mini";
		console.log(`[LLM Service] Requesting explanation from ${chatModel}...`);

		const response = await openai.chat.completions.create({
			model: chatModel, // Use the specified chat model
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
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
	generateStockSuggestions,
};
