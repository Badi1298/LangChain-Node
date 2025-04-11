const { retrieveDecorrelatedStocks } = require("./phoenix-autocall/retrieveDecorellatedStocks.js");
const { retrieveSimilarVolatilityStocks } = require("./phoenix-autocall/retrieveSimilarVolatility.js");
const { retrieveLowVolatilityHLRatioStocks } = require("./phoenix-autocall/retrieveLowVolatilityStocks.js");

module.exports = {
	phoenixAutocallRetrievers: {
		similarVolatility: retrieveSimilarVolatilityStocks,
		decorrelation: retrieveDecorrelatedStocks,
		volatility: retrieveLowVolatilityHLRatioStocks,
	},
};
