import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
	const response = await ai.models.generateContent({
		model: "gemini-2.0-flash",
		contents: [
			"Who individually won the most bronze medals during the Paris olympics in 2024?",
		],
		config: {
			tools: [{ googleSearch: {} }],
		},
	});
	console.log(response.text);
}

await main();
