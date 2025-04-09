const { ProductTypesId } = require("../../config/constants.js");
const { retrieveDecorrelatedStocks } = require("./phoenix-autocall/decorellatedStocks.js");
const {
	systemPrompt: decorrelationSystem,
	user: decorrelationUser,
} = require("../../prompts/phoenix-autocall/decorrelationPrompt.js");
const {
	systemPrompt: volatilitySystem,
	user: volatilityUser,
} = require("../../prompts/phoenix-autocall/higherVolatilityPrompt.js");

const stockSuggestionFields = {
	[ProductTypesId.PHOENIX_AUTOCALL]: [
		{
			retriever: retrieveDecorrelatedStocks,
			systemPrompt: decorrelationSystem,
			userPrompt: decorrelationUser,
		},
	],
};

module.exports = { stockSuggestionFields };
