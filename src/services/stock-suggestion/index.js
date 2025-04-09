const { ProductTypesId } = require("../../config/constants.js");
const improvedDecorrelation = require("./phoenix-autocall/decorellatedStocks.js");

const stockSuggestionFunctions = ({
	selectedStocksInput, // Input array with structure { id, country, sector, volatility_6, ... }
	pineconeIndex,
	vectorDimension, // Assuming this is passed in or available in the context
	decorrelationProvider,
	topK,
}) => {
	return {
		[ProductTypesId.PHOENIX_AUTOCALL]: {
			improvedDecorrelation: improvedDecorrelation({
				selectedStocksInput,
				pineconeIndex,
				vectorDimension,
				decorrelationProvider,
				topK,
			}),
		},
	};
};

module.exports = stockSuggestionFunctions;
