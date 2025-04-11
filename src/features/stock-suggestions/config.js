const { ProductTypesId } = require("../../config/constants.js");

const { llms } = require("./services/index.js");
const { phoenixAutocallPrompts } = require("./prompts/index.js");
const { phoenixAutocallRetrievers } = require("./retrievers/phoenix-autocall/index.js");

const stockSuggestionConfigs = {
	[ProductTypesId.PHOENIX_AUTOCALL]: {
		sameSubSectors: [
			{
				retriever: phoenixAutocallRetrievers.similarVolatility,
				llmService: llms.geminiSuggestions,
				userPrompt: phoenixAutocallPrompts.similarVolatility.user,
				sectionTitle: "Optimal suggestions to improve Level",
			},
		],
		differentSubSectors: [
			{
				retriever: phoenixAutocallRetrievers.decorrelation,
				llmService: llms.openAiSuggestions,
				systemPrompt: phoenixAutocallPrompts.decorrelation.system,
				userPrompt: phoenixAutocallPrompts.decorrelation.user,
				sectionTitle: "Same country, improved decorrelation/volatility",
			},
			{
				retriever: phoenixAutocallRetrievers.volatility,
				llmService: llms.openAiSuggestions,
				systemPrompt: phoenixAutocallPrompts.volatility.system,
				userPrompt: phoenixAutocallPrompts.volatility.user,
				sectionTitle: "Similar underlyings with volatility lower than usual",
			},
		],
	},
};

module.exports = { stockSuggestionConfigs };
