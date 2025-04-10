const { ProductTypesId } = require("../../config/constants.js");
const { phoenixAutocallPrompts } = require("../../prompts/index.js");
const { phoenixAutocallRetriever } = require("./phoenix-autocall/index.js");

const stockSuggestionFields = {
	[ProductTypesId.PHOENIX_AUTOCALL]: [
		{
			retriever: phoenixAutocallRetriever.decorrelation,
			systemPrompt: phoenixAutocallPrompts.decorrelation.system,
			userPrompt: phoenixAutocallPrompts.decorrelation.user,
			sectionTitle: "Same country, improved decorrelation/volatility",
		},
		{
			retriever: phoenixAutocallRetriever.volatility,
			systemPrompt: phoenixAutocallPrompts.volatility.system,
			userPrompt: phoenixAutocallPrompts.volatility.user,
			sectionTitle: "Similar underlyings with volatility higher than usual",
		},
	],
};

module.exports = { stockSuggestionFields };
