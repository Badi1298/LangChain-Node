const { retrieveDecorrelatedStocks } = require("./retrieveDecorellatedStocks.js");
const { retrieveLowVolatilityHLRatioStocks } = require("./retrieveLowVolatilityStocks.js");
const { retrieveSimilarVolatilityStocks } = require("./retrieveSimilarVolatility.js");

module.exports = {
	phoenixAutocallRetrievers: {
		similarVolatility: retrieveSimilarVolatilityStocks,
		decorrelation: retrieveDecorrelatedStocks,
		volatility: retrieveLowVolatilityHLRatioStocks,
	},
};
