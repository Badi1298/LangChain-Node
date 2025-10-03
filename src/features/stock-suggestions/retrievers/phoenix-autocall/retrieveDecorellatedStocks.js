const fs = require("fs");
const path = require("path");

const openai = require("../../../../services/openaiClient.js");

async function retrieveDecorrelatedStocks({ selectedStocks }) {
	if (!selectedStocks || selectedStocks.length === 0) {
		console.error("Retrieval Error: No selected stocks provided for context.");
		return [];
	}

	const stockTickersPath = path.join(process.cwd(), "stock-tickers.json");
	let stocksList;

	try {
		const rawData = fs.readFileSync(stockTickersPath, "utf8");
		stocksList = JSON.stringify(JSON.parse(rawData), null, 2);
	} catch (err) {
		console.error(`Error reading stock tickers file: ${err.message}`);
		return "Failed to read stock tickers file.";
	}

	// --- 1. Prepare Context for Prompt ---
	const selectedStocksData = selectedStocks.map((stock) => stock.ticker);

	// --- 2. Prepare Prompt ---
	const userMessage = `
		Objective: Find approximately 100 stocks from a provided list of approximately 2500 that are from the
		same country and from very decorrelated sectors compared to the 2-3 designated "seed" stocks.

		Input Data:
		I will provide you with a list containing approximately 2500 stocks tickers. 
		I will also clearly identify 2-3 stocks from this list that you should use as the "seed" stocks for 
		decorrelation comparison.

		Your Task:
		1. Identify the approximately 100 stocks from the provided list that are from the
		same country and from very decorrelated sectors compared to to the "seed" stocks.
		2. Do NOT include the "seed" stocks in your output.
		3. Do NOT return back all the stock, choose approximately 100 stocks.
		4. Provide the output in a JSON format that can be read in JS with JSON.parse with the following 
		structure:
		[ "AAPL", "MSFT", ... ]
		5. Do not include any additional information or explanations in the output.

		Seed Stocks - here are the stocks I already have selected, make your decorrelation analysis based on 
		these stocks:
		${JSON.stringify(selectedStocksData, null, 2)}

		Stocks List - here is the list of 2500 stocks tickers to choose from:
		${stocksList}
	`;

	// --- 3. Call OpenAI API ---
	try {
		const chatModel = "gpt-4o-mini";
		console.log(`[LLM Service] Requesting explanation from ${chatModel}...`);

		const response = await openai.chat.completions.create({
			model: chatModel,
			messages: [{ role: "user", content: userMessage }],
			temperature: 0.5,
			n: 1,
		});

		const explanation = response.choices[0]?.message?.content?.trim();

		if (explanation) {
			console.log("[LLM Service] Explanation received.");
			console.log("[LLM Service] Explanation:", explanation);
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

	// --- 4. Parse Response ---
	const responseText = response.choices[0].message.content;
	const decorrelatedStocks = responseText
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line) => {
			const [ticker, name] = line.split(":").map((part) => part.trim());
			return { ticker, name };
		});

	// --- 5. Return Decorrelated Stocks ---
	return decorrelatedStocks;
}

module.exports = { retrieveDecorrelatedStocks };
