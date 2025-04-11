const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function geminiSuggestions({ selectedStocks, retrievalResults, userPrompt }) {
	console.log(selectedStocks, retrievalResults, userPrompt);
	if (
		!selectedStocks ||
		selectedStocks.length === 0 ||
		!retrievalResults ||
		retrievalResults.length === 0
	) {
		console.error("[LLM Service] Error: Missing input data for LLM generation.");
		return;
	}

	const selectedStocksNames = selectedStocks.map((stock) => stock.name).join(", ");
	const suggestedStocksNames = retrievalResults.map((stock) => stock.name).join(", ");

	const finalContent = userPrompt({
		selectedInfo: selectedStocksNames,
		suggestionsInfo: suggestedStocksNames,
	});

	const response = await ai.models.generateContent({
		model: "gemini-2.0-flash",
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
