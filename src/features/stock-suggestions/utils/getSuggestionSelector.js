const { ProductTypesSuggestionsMap } = require("../../../config/constants.js");

/**
 * Determines the strategy key ('sameSubSectors' or 'differentSubSectors')
 * based on the uniqueness of sub-sectors in the selected stocks.
 * @param {object} context - The context object.
 * @param {Array<object>} context.selectedStocks - Array of selected stock objects.
 * @param {string} context.selectedStocks[].sub_sector - The sub-sector of a stock.
 * @returns {'sameSubSectors' | 'differentSubSectors'} - The strategy key.
 */
const phoenixAutocallSelector = (context) => {
	if (!context || !Array.isArray(context.selectedStocks)) {
		console.warn("Invalid context provided to phoenixAutocallSelector");
		// Return a default or handle the error appropriately
		return "differentSubSectors"; // Or throw an error
	}
	const uniqueStocksSubSectors = [...new Set(context.selectedStocks.map((stock) => stock.sub_sector))];
	return uniqueStocksSubSectors.length === 1
		? ProductTypesSuggestionsMap.PHOENIX_AUTOCALL.SAME_SUB_SECTORS
		: ProductTypesSuggestionsMap.PHOENIX_AUTOCALL.DIFFERENT_SUB_SECTORS;
};

module.exports = {
	selectors: {
		phoenixAutocallSelector,
	},
};
