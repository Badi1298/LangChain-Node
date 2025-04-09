const { ProductTypesId } = require("../config/constants.js");

const productTypePrompts = {
	[ProductTypesId.PHOENIX_AUTOCALL]: {
		improvedDecorrelation: {
			systemPrompt: `You are a financial analyst assistant. Your task is to explain potential sector decorrelation between a selected stock and a list of suggested stocks, focusing concisely on macroeconomic factors.`,
			userPrompt: ({ selectedInfo, suggestionsInfo, referenceStock }) => {
				return `
                    The user selected: ${selectedInfo}.

                    Based on filtering criteria (same country, specific volatility range, decorrelated sector), the following stocks were suggested:
                    ${suggestionsInfo}

                    Instructions:
                    Choose 5 stocks from above, provide a brief explanation (1-2 sentences maximum per stock) of why its sector might be decorrelated from the selected stock's sector (${referenceStock.sector}).
                    Focus specifically on how their business models might cause them to react differently to common macroeconomic events (e.g., changes in interest rates, inflation, economic growth phases, commodity prices, etc.).
                    Do not give investment advice. Present the explanations clearly for each suggested stock.
                    Example structure for one stock:
                    "[Suggested Stock Name]: Its [Sector Name] sector often reacts differently to [Macro Event] because [brief reason]."
                `;
			},
		},
		higherVolatility: {
			systemPrompt: `You are a financial analyst assistant. Your task is to explain potential reasons why suggested stocks, despite being in a similar sector/industry to the selected stock, currently exhibit volatility in the lower end of their historical 52-week range.`,
			userPrompt: ({ selectedInfo, suggestionsInfo, referenceStock }) => {
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
			},
		},
	},
};

module.exports = {
	productTypePrompts,
};
