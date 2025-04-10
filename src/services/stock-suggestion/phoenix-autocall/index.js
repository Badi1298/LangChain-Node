const { retrieveDecorrelatedStocks } = require("./decorellatedStocks.js");
const { retrieveLowVolatilityHLRatioStocks } = require("./highVolatility.js");

module.exports = {
	phoenixAutocallRetriever: {
		decorrelation: retrieveDecorrelatedStocks,
		volatility: retrieveLowVolatilityHLRatioStocks,
	},
};
