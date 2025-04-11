const {
	systemPrompt: decorrelationSystem,
	user: decorrelationUser,
} = require("./phoenix-autocall/decorrelationPrompt.js");
const {
	systemPrompt: volatilitySystem,
	user: volatilityUser,
} = require("./phoenix-autocall/higherVolatilityPrompt.js");
const { user: similarVolatilityUser } = require("./phoenix-autocall/similarVolatilityPrompt.js");

module.exports = {
	phoenixAutocallPrompts: {
		similarVolatility: {
			user: similarVolatilityUser,
		},
		decorrelation: {
			system: decorrelationSystem,
			user: decorrelationUser,
		},
		volatility: {
			system: volatilitySystem,
			user: volatilityUser,
		},
	},
};
