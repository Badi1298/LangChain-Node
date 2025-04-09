const { ProductTypesId } = require("../config/constants.js");
const {
	systemPrompt: decorrelationSystem,
	user: decorrelationUser,
} = require("./phoenix-autocall/decorrelationPrompt.js");
const {
	systemPrompt: volatilitySystem,
	user: volatilityUser,
} = require("./phoenix-autocall/higherVolatilityPrompt.js");

const productTypePrompts = {
	[ProductTypesId.PHOENIX_AUTOCALL]: {
		improvedDecorrelation: {
			systemPrompt: decorrelationSystem,
			userPrompt: decorrelationUser,
		},
		higherVolatility: {
			systemPrompt: volatilitySystem,
			userPrompt: volatilityUser,
		},
	},
};

module.exports = {
	productTypePrompts,
};
