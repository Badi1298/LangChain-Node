const systemPrompt = `You are a financial analyst assistant. Your task is to explain potential sector decorrelation between a selected stock and a list of suggested stocks, focusing concisely on macroeconomic factors.`;

const userPromptTemplate = ({ selectedInfo, suggestionsInfo, stocksSector }) => {
	return `
        The user selected: ${selectedInfo}.

        Based on filtering criteria (same country, specific volatility range, decorrelated sector), the following stocks were suggested:
        ${suggestionsInfo}

        Instructions:
        Choose up to 5 stocks from above.
        Provide a brief explanation (1-2 sentences maximum per stock) of why its sector might be decorrelated from the selected stocks' sectors (${stocksSector}).
        Focus specifically on how their business models might cause them to react differently to common macroeconomic events (e.g., changes in interest rates, inflation, economic growth phases, commodity prices, etc.).
        Do not give investment advice. Present the explanations clearly for each suggested stock.
        Example structure for one stock, respond in markdown format:
        "[Suggested Stock Name]: Its [Sector Name] sector often reacts differently to [Macro Event] because [brief reason]."
    `;
};

module.exports = {
	systemPrompt,
	user: userPromptTemplate,
};
