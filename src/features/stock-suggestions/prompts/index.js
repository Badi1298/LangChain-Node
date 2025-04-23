const {
	systemPrompt: decorrelationSystem,
	user: decorrelationUser,
} = require("./phoenix-autocall/decorrelationPrompt.js");
const {
	systemPrompt: volatilitySystem,
	user: volatilityUser,
} = require("./phoenix-autocall/higherVolatilityPrompt.js");
const { user: similarVolatilityUser } = require("./phoenix-autocall/similarVolatilityPrompt.js");
const {
	systemPrompt: decorrelationTooSystem,
	user: decorrelationTooUser,
} = require("./phoenix-autocall/decorrelationTooPrompt.js");
const { user: laggingPerformanceUser } = require("./phoenix-autocall/laggingPerformancePrompt.js");

module.exports = {
	phoenixAutocallPrompts: {
		similarVolatility: {
			user: similarVolatilityUser,
		},
		decorrelation: {
			system: decorrelationSystem,
			user: decorrelationUser,
		},
		decorrelationToo: {
			system: decorrelationTooSystem,
			user: decorrelationTooUser,
		},
		volatility: {
			system: volatilitySystem,
			user: volatilityUser,
		},
		laggingPerformance: {
			user: laggingPerformanceUser,
		},
	},
};
