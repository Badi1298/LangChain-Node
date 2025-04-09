const systemPrompt = `You are a financial analyst assistant. Your task is to explain potential reasons why suggested stocks, despite being in a similar sector/industry to the selected stock, currently exhibit volatility in the lower end of their historical 52-week range.`;

const userPromptTemplate = ({ selectedInfo, suggestionsInfo, referenceStock }) => {
	// Assuming referenceStock has properties like name, sector, industry
	// Assuming selectedInfo might contain details about the reference stock's current volatility context if relevant.
	return `
        The user selected: ${selectedInfo} (Sector: ${referenceStock.sector}, Industry: ${referenceStock.sub_sector}).

        Based on filtering criteria (similar sector/industry, current volatility within the lowest tier of its 52-week high/low range), the following stocks were suggested:
        ${suggestionsInfo}

        Instructions:
        Choose up to 5 stocks from the suggestions.
        Provide a brief explanation (1-2 sentences maximum per stock) suggesting potential reasons why this stock's current volatility is in the lower part of its recent historical (52-week) range, despite being in a similar business area as the selected stock (${referenceStock.name}).
        Focus on potential company-specific factors, recent stabilization after prior events, market positioning, or lack of recent impactful news that might explain the lower current volatility relative to its own history.
        Do not give investment advice. Present the explanations clearly for each suggested stock.
        Example structure for one stock:
        "[Suggested Stock Name]: Its currently lower relative volatility might stem from [brief potential reason, e.g., a period of consolidation after recent earnings, less exposure to current specific sub-sector news, successful debt restructuring calming markets, etc.]."
    `;
};

module.exports = {
	systemPrompt,
	user: userPromptTemplate,
};
