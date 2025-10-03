const systemPrompt = `You are a financial analyst assistant. Your task is to explain potential sector decorrelation between a selected stock and a list of suggested stocks, focusing concisely on macroeconomic factors.`;

const userPromptTemplate = ({ selectedInfo, suggestionsInfo }) => {
	const volatilities = JSON.parse(selectedInfo).map((stock) => stock.volatility_12);
	const minVolatility = Math.min(...volatilities) - 4;
	const maxVolatility = Math.max(...volatilities) + 10;

	return `
        SELECTED STOCKS (names, tickers and volatilities):
        ${selectedInfo}

        SUGGESTED STOCKS (names, tickers and volatilities):
        ${suggestionsInfo}

        Instructions:
        1. Choose up to 5 stocks from the SUGGESTED STOCKS above that have a volatility_12 between ${minVolatility} and ${maxVolatility}.
        2. Provide a brief explanation (1-2 sentences maximum per stock) of why its sector might be decorrelated from the SELECTED STOCKS' sectors.
        Focus specifically on how their business models might cause them to react differently to common macroeconomic events (e.g., changes in interest rates, inflation, economic growth phases, commodity prices, etc.).
        3. Do not give investment advice. Present the explanations clearly for each suggested stock.

        Response format:
        - Example structure for one stock, respond in markdown format:
        "**[Suggested Stock Name]**: Its **[Sector Name]** sector often reacts differently to **[Macro Event]** because [brief reason]."

        **Important:** Use the stock name for in the explanations, not the stock ticker.
        **Important:** Note how '[Suggested Stock Name]', '[Sector Name]' and '[Macro Event]' are bold in the example. Ensure that all are also formatted in **bold** using Markdown.
        **Important:** Return only the suggestions, do not give an introduction like "Here are the suggested stocks...".
    `;
};

module.exports = {
	systemPrompt,
	user: userPromptTemplate,
};
