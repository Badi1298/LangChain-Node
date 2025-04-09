const { ProductTypesId } = require("../../config/constants.js");
const { retrieveDecorrelatedStocks } = require("./phoenix-autocall/decorellatedStocks.js");

const stockSuggestionFunctions = {
	[ProductTypesId.PHOENIX_AUTOCALL]: {
		retrieveDecorrelatedStocks,
	},
};

module.exports = { stockSuggestionFunctions };
