const { retrieveDecorrelatedStocks } = require("./retrieveDecorellatedStocks.js");
const { retrieveLowVolatilityHLRatioStocks } = require("./retrieveLowVolatilityStocks.js");

module.exports = {
	phoenixAutocallRetriever: {
		decorrelation: retrieveDecorrelatedStocks,
		volatility: retrieveLowVolatilityHLRatioStocks,
	},
};
