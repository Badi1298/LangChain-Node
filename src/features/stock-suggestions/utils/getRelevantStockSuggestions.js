function getRelevantStockSuggestions(productType, context, allConfigs) {
	const configForProduct = allConfigs[productType];

	if (!configForProduct) {
		console.warn(`No configuration found for product type: ${productType}`);
		return [];
	}

	// Check if a selector function exists
	if (typeof configForProduct.selector === "function") {
		const selectedKey = configForProduct.selector(context); // Determine the key ('sameSubSectors', 'differentSubSectors', etc.)
		return configForProduct[selectedKey] || []; // Return the array associated with that key
	} else {
		// Fallback if no selector is defined for this product type
		console.warn(`No suggestion selector function defined for product type: ${productType}`);
		// You might return a default list, an empty list, or throw an error
		// Example: return configForProduct.defaultList || [];
		return [];
	}
}

module.exports = {
	getRelevantStockSuggestions,
};
