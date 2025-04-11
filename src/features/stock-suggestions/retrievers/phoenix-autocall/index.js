const { retrieveDecorrelatedStocks } = require("./retrieveDecorellatedStocks.js");
const { retrieveLowVolatilityHLRatioStocks } = require("./retrieveLowVolatilityStocks.js");

module.exports = {
	phoenixAutocallRetrievers: {
		decorrelation: retrieveDecorrelatedStocks,
		volatility: retrieveLowVolatilityHLRatioStocks,
	},
};
