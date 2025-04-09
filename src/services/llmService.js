const openai = require("../services/openaiClient.js");
const config = require("../utils/config.js");

/**
 * Generates an explanation for stock decorrelation using an LLM.
 *
 * @param {string} originalQuery - The original user query for context.
 * @param {Array<object>} selectedStocksInput - The user's selected stocks (input structure).
 * @param {Array<object>} suggestedStocks - The stocks retrieved from Pinecone.
 * @returns {Promise<string>} - A string containing the LLM-generated explanation.
 */
async function generateDecorrelationExplanation(
	originalQuery,
	selectedStocksInput,
	suggestedStocks
) {
	if (
		!selectedStocksInput ||
		selectedStocksInput.length === 0 ||
		!suggestedStocks ||
		suggestedStocks.length === 0
	) {
		return "Could not generate explanation: Missing input data.";
	}

	// --- 1. Prepare Context for Prompt ---
	// Use the first selected stock for primary context
	const referenceStock = selectedStocksInput[0];
	const selectedInfo = `${referenceStock.name} (Sector: ${referenceStock.sector})`;

	// Format suggested stocks concisely
	const suggestionsInfo = suggestedStocks
		.map((stock) => `- ${stock.name} (Sector: ${stock.sector})`)
		.join("\n");

	// --- 2. Construct Prompt ---
	const systemPrompt = `You are a financial analyst assistant. Your task is to explain potential sector decorrelation between a selected stock and a list of suggested stocks, focusing concisely on macroeconomic factors.`;

	const userPrompt = `
        The user selected: ${selectedInfo}.

        Based on filtering criteria (same country, specific volatility range, decorrelated sector), the following stocks were suggested:
        ${suggestionsInfo}

        Instructions:
        Choose 5 stocks from above, provide a brief explanation (1-2 sentences maximum per stock) of why its sector might be decorrelated from the selected stock's sector (${referenceStock.sector}).
        Focus specifically on how their business models might cause them to react differently to common macroeconomic events (e.g., changes in interest rates, inflation, economic growth phases, commodity prices).
        Do not give investment advice. Present the explanations clearly for each suggested stock.
        Example structure for one stock:
        "[Suggested Stock Name]: Its [Sector Name] sector often reacts differently to [Macro Event] because [brief reason], unlike the ${referenceStock.sector} sector."
    `;

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
	generateDecorrelationExplanation,
};
