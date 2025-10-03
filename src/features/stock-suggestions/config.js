const { ProductTypesId, ProductTypesSuggestionsMap } = require("../../config/constants.js");

const { llms } = require("./services/index.js");
const { selectors } = require("./utils/getSuggestionSelector.js");
const { phoenixAutocallPrompts } = require("./prompts/index.js");
const { phoenixAutocallRetrievers } = require("./retrievers/index.js");

const stockSuggestionConfigs = {
	[ProductTypesId.PHOENIX_AUTOCALL]: {
		[ProductTypesSuggestionsMap.PHOENIX_AUTOCALL.SAME_SUB_SECTORS]: [
			{
				retriever: phoenixAutocallRetrievers.similarVolatility,
				llmService: llms.geminiSuggestions,
				userPrompt: phoenixAutocallPrompts.similarVolatility.user,
				sectionTitle: ProductTypesSuggestionsMap.PHOENIX_AUTOCALL.IMPROVE_LEVEL,
			},
		],
		[ProductTypesSuggestionsMap.PHOENIX_AUTOCALL.DIFFERENT_SUB_SECTORS]: [
			{
				retriever: phoenixAutocallRetrievers.decorrelation,
				llmService: llms.openAiSuggestions,
				systemPrompt: phoenixAutocallPrompts.decorrelation.system,
				userPrompt: phoenixAutocallPrompts.decorrelation.user,
				sectionTitle: ProductTypesSuggestionsMap.PHOENIX_AUTOCALL.DECORRELATION,
			},
			// {
			// 	retriever: phoenixAutocallRetrievers.decorrelationToo,
			// 	llmService: llms.openAiSuggestions,
			// 	systemPrompt: phoenixAutocallPrompts.decorrelationToo.system,
			// 	userPrompt: phoenixAutocallPrompts.decorrelationToo.user,
			// 	sectionTitle: ProductTypesSuggestionsMap.PHOENIX_AUTOCALL.DECORRELATION_TOO,
			// },
			// {
			// 	retriever: phoenixAutocallRetrievers.volatility,
			// 	llmService: llms.geminiSuggestions,
			// 	systemPrompt: phoenixAutocallPrompts.volatility.system,
			// 	userPrompt: phoenixAutocallPrompts.volatility.user,
			// 	sectionTitle: ProductTypesSuggestionsMap.PHOENIX_AUTOCALL.LOW_VOLATILITY,
			// },
			// {
			// 	retriever: phoenixAutocallRetrievers.laggingPerformance,
			// 	llmService: llms.geminiSuggestions,
			// 	userPrompt: phoenixAutocallPrompts.laggingPerformance.user,
			// 	sectionTitle: ProductTypesSuggestionsMap.PHOENIX_AUTOCALL.LAGGING_PERFORMANCE,
			// },
		],
		selector: selectors.phoenixAutocallSelector,
	},
};

module.exports = { stockSuggestionConfigs };
