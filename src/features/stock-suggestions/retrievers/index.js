const { retrieveDecorrelatedStocks } = require("./phoenix-autocall/retrieveDecorellatedStocks.js");
const { retrieveDecorrelatedStocksToo } = require("./phoenix-autocall/retrieveDecorellatedStocksToo.js");
const { retrieveSimilarVolatilityStocks } = require("./phoenix-autocall/retrieveSimilarVolatility.js");
const { retrieveLowVolatilityHLRatioStocks } = require("./phoenix-autocall/retrieveLowVolatilityStocks.js");

module.exports = {
	phoenixAutocallRetrievers: {
		similarVolatility: retrieveSimilarVolatilityStocks,
		decorrelation: retrieveDecorrelatedStocks,
		decorrelationToo: retrieveDecorrelatedStocksToo,
		volatility: retrieveLowVolatilityHLRatioStocks,
	},
};
