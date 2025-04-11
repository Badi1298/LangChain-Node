const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function geminiSuggestions({ selectedStocks, retrievalResults, userPrompt }) {
	if (
		!selectedStocks ||
		selectedStocks.length === 0 ||
		!retrievalResults ||
		retrievalResults.length === 0
	) {
		console.error("[LLM Service] Error: Missing input data for LLM generation.");
		return;
	}

	const MODEL = "gemini-2.0-flash";
	// const MODEL = "gemini-2.5-pro-exp-03-25";

	const selectedStocksNames = selectedStocks.map((stock) => stock.name).join(", ");
	const suggestedStocksNames = retrievalResults.map((stock) => stock.name).join(", ");

	const finalContent = userPrompt({
		selectedInfo: selectedStocksNames,
		suggestionsInfo: suggestedStocksNames,
	});

	const response = await ai.models.generateContent({
		model: MODEL,
		contents: [finalContent],
		config: {
			tools: [{ googleSearch: {} }],
		},
	});

	return response.text;
}

module.exports = {
	geminiSuggestions,
};
