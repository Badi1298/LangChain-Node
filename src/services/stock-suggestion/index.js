const { ProductTypesId } = require("../../config/constants.js");
const { retrieveDecorrelatedStocks } = require("./phoenix-autocall/decorellatedStocks.js");
const { decorrelationSystem, decorrelationUser } = require("../../prompts/index.js");

const stockSuggestionFields = {
	[ProductTypesId.PHOENIX_AUTOCALL]: [
		{
			retriever: retrieveDecorrelatedStocks,
			systemPrompt: decorrelationSystem,
			userPrompt: decorrelationUser,
			sectionTitle: "Same country, improved decorrelation/volatility",
		},
	],
};

module.exports = { stockSuggestionFields };
