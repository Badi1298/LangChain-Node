const {
	systemPrompt: decorrelationSystem,
	user: decorrelationUser,
} = require("./phoenix-autocall/decorrelationPrompt.js");
const {
	systemPrompt: volatilitySystem,
	user: volatilityUser,
} = require("./phoenix-autocall/higherVolatilityPrompt.js");

module.exports = {
	phoenixAutocallPrompts: {
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
