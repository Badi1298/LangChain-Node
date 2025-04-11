import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function geminiGrounded(selectedStocks, retrievalResults, userPrompt) {
	if (
		!selectedStocks ||
		selectedStocks.length === 0 ||
		!retrievalResults ||
		retrievalResults.length === 0
	) {
		console.error("[LLM Service] Error: Missing input data for LLM generation.");
		return;
	}

	const response = await ai.models.generateContent({
		model: "gemini-2.0-flash",
		contents: [userPrompt({ selectedStocks, suggestionsInfo: retrievalResults })],
		config: {
			tools: [{ googleSearch: {} }],
		},
	});

	return response.text;
}

module.exports = {
	geminiGrounded,
};
