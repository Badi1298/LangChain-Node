const systemPrompt = `You are a financial analyst assistant. Your task is to explain potential reasons why suggested stocks, despite being in a similar sector/industry to the selected stock, are currently exhibiting lagging performance (e.g., low 3-month returns or trading near their 52-week lows).`;

const userPromptTemplate = ({
	selectedInfo,
	suggestionsInfo,
	stocksName, // Name of the originally selected stock(s) for context
	stocksSector,
	stocksSubSectors,
}) => {
	return `
        The user selected: ${selectedInfo} (Sectors: ${stocksSector}; Industry: ${stocksSubSectors}).

        Based on filtering criteria (similar sector/industry, 3-month performance in the lowest tier OR price near the lower end of its 52-week high/low range), the following stocks were suggested as potentially lagging performers:
        ${suggestionsInfo}

        Instructions:
        Choose up to 5 stocks from the suggestions.
        Provide a brief explanation (1-2 sentences maximum per stock) suggesting potential reasons why this stock might be lagging in performance (e.g., low 3-month return or trading near its 52-week low) despite being in a similar business area as the selected stocks (${stocksName}).
        Focus on potential company-specific factors, recent negative news or earnings misses, increased competition, specific sub-sector challenges affecting this stock more, poor recent execution, or negative market sentiment shifts impacting its valuation.
        Do not give investment advice. Present the explanations clearly for each suggested stock.
        
        Use the example structure below for each stock suggestion.

        Example structure for one stock, in markdown format. Do NOT add a section header:
        "**[Suggested Stock Name]**: Its recent lagging performance could be due to [brief potential reason, e.g., recent disappointing earnings results, increased competitive pressure in its main market, specific regulatory concerns, negative investor sentiment following a strategy shift, or sector headwinds disproportionately affecting its operations, etc.]."

        **Important:** Note how '[Suggested Stock Name]' is bold in the example. Ensure the actual stock name you provide in your response is also formatted in **bold** using Markdown.
    `;
};

module.exports = {
	systemPrompt,
	user: userPromptTemplate,
};
