const systemPrompt = `
You are a specialized financial analyst assistant. Your purpose is to explain potential sources of sector-level decorrelation between stocks. You focus *only* on sector characteristics (e.g., different economic sensitivities, customer bases, regulatory environments) and avoid stock-specific analysis or investment advice.
`;

const userPromptTemplate = ({ selectedInfo, suggestionsInfo, stocksSector }) => {
	// Ensure suggestionsInfo is clearly formatted, e.g., a numbered or bulleted list string.
	// Example format for suggestionsInfo:
	// "- Stock A (TickerA, Sector: Technology)\n- Stock B (TickerB, Sector: Healthcare)\n- Stock C (TickerC, Sector: Utilities)"

	return `
        User's selected stocks: ${selectedInfo} (Sectors: ${stocksSector})

        Based on filtering criteria focusing on potential sector decorrelation and volatility, the following stocks were identified:
        ${suggestionsInfo}

        Instructions:
        For EACH stock in the list above:
        1.  Provide a brief explanation (maximum 1-2 sentences) outlining a plausible reason why its sector might be decorrelated from the selected stock's sector (${stocksSector}). Focus specifically on differences in their respective sectors' typical economic drivers or business models.
        2.  Choose up to 5 stocks from the list above. If there are fewer than 5, use all available stocks.
        3.  Format the output in Markdown. Start each explanation with the stock's name in **bold**.
        4.  Strictly avoid giving any investment advice, price predictions, or opinions on the quality of the stocks.

        Example structure for one stock:
        "**[Suggested Stock Name]**: This stock's [Suggested Sector Name] sector often exhibits decorrelation from ${stocksSector} because it is driven by [brief reason, e.g., different consumer spending patterns, regulatory changes, commodity price sensitivity]."

        **Important Formatting:** Ensure every stock name is enclosed in **bold** Markdown tags (e.g., **Stock Name**). Respond only with the explanations for the provided stocks.
    `;
};

module.exports = {
	systemPrompt,
	user: userPromptTemplate,
};
