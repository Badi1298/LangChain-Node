const { ProductTypesId } = require("../../config/constants.js");
const { phoenixAutocallPrompts } = require("./prompts/index.js");
const { phoenixAutocallRetrievers } = require("./retrievers/phoenix-autocall/index.js");

const stockSuggestionFields = {
	[ProductTypesId.PHOENIX_AUTOCALL]: {
		sameSubSectors: [
			{
				retriever: phoenixAutocallRetrievers.similarVolatility,
				userPrompt: phoenixAutocallPrompts.similarVolatility.user,
				sectionTitle: "Same sector, similar volatility",
			},
		],
		differentSubSectors: [
			{
				retriever: phoenixAutocallRetrievers.decorrelation,
				systemPrompt: phoenixAutocallPrompts.decorrelation.system,
				userPrompt: phoenixAutocallPrompts.decorrelation.user,
				sectionTitle: "Same country, improved decorrelation/volatility",
			},
			{
				retriever: phoenixAutocallRetrievers.volatility,
				systemPrompt: phoenixAutocallPrompts.volatility.system,
				userPrompt: phoenixAutocallPrompts.volatility.user,
				sectionTitle: "Similar underlyings with volatility lower than usual",
			},
		],
	},
};

module.exports = { stockSuggestionFields };
