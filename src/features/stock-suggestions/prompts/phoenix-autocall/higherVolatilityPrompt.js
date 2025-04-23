const systemPrompt = `You are a financial analyst assistant. Your task is to explain potential reasons why suggested stocks, despite being in a similar sector/industry to the selected stock, currently exhibit volatility in the lower end of their historical 52-week range.`;

const userPromptTemplate = ({
	selectedInfo,
	suggestionsInfo,
	stocksName,
	stocksSector,
	stocksSubSectors,
}) => {
	return `
        The user selected: ${selectedInfo} (Sectors: ${stocksSector}; Industry: ${stocksSubSectors}).

        Based on filtering criteria (similar sector/industry, current volatility within the lowest tier of its 52-week high/low range), the following stocks were suggested:
        ${suggestionsInfo}

        Instructions:
        Choose up to 5 stocks from the suggestions.
        Provide a brief explanation (1-2 sentences maximum per stock) suggesting potential reasons why this stock's current volatility is in the lower part of its recent historical (52-week) range, despite being in a similar business area as the selected stocks (${stocksName}).
        Focus on potential company-specific factors, recent stabilization after prior events, market positioning, or lack of recent impactful news that might explain the lower current volatility relative to its own history.
        Do not give investment advice. Present the explanations clearly for each suggested stock.
        
        Use the example structure below for each stock suggestion.

        Example structure for one stock, in markdown format. Do NOT add a section header:
        "**[Suggested Stock Name]**: Its currently lower relative volatility might stem from [brief potential reason, e.g., a period of consolidation after recent earnings, less exposure to current specific sub-sector news, successful debt restructuring calming markets, etc.]."

        **Important:** Note how '[Suggested Stock Name]' is bold in the example. Ensure the actual stock name you provide in your response is also formatted in **bold** using Markdown.
    `;
};

module.exports = {
	systemPrompt,
	user: userPromptTemplate,
};
