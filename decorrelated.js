/**
 * Placeholder Decorrelation Logic based on the 11 provided sectors.
 * !!! IMPORTANT: Relationships are illustrative examples ONLY.
 * Replace with actual, validated decorrelation data for production use. !!!
 */
const sectorDecorrelationMap = {
	"Communication Services": [
		"Utilities",
		"Consumer Staples",
		"Health Care",
		"Energy",
		"Materials",
		"Real Estate",
		"Financials",
	],
	"Consumer Discretionary": [
		"Utilities",
		"Consumer Staples",
		"Health Care",
		"Energy",
		"Materials",
		"Real Estate",
		"Information Technology",
	],
	"Consumer Staples": [
		"Information Technology",
		"Consumer Discretionary",
		"Financials",
		"Energy",
		"Industrials",
		"Materials",
	],
	Energy: [
		"Information Technology",
		"Health Care",
		"Consumer Staples",
		"Utilities",
		"Financials",
		"Communication Services",
	],
	Financials: [
		"Utilities",
		"Consumer Staples",
		"Health Care",
		"Energy",
		"Materials",
		"Information Technology",
		"Real Estate",
	],
	"Health Care": [
		"Information Technology",
		"Financials",
		"Energy",
		"Materials",
		"Consumer Discretionary",
		"Industrials",
		"Communication Services",
	],
	Industrials: [
		"Utilities",
		"Consumer Staples",
		"Health Care",
		"Information Technology",
		"Communication Services",
		"Real Estate",
	],
	"Information Technology": [
		"Utilities",
		"Consumer Staples",
		"Health Care",
		"Energy",
		"Materials",
		"Real Estate",
		"Financials",
	],
	Materials: [
		"Information Technology",
		"Health Care",
		"Financials",
		"Consumer Discretionary",
		"Communication Services",
		"Utilities",
	],
	"Real Estate": [
		"Information Technology",
		"Energy",
		"Materials",
		"Industrials",
		"Health Care",
		"Consumer Staples",
		"Utilities",
	],
	Utilities: [
		"Information Technology",
		"Consumer Discretionary",
		"Financials",
		"Industrials",
		"Energy",
		"Materials",
		"Communication Services",
	],
};

const decorrelationProvider = {
	/**
	 * Gets a list of sectors generally considered decorrelated from the input sector.
	 * Uses the definitive list of 11 sectors.
	 * @param {string} selectedSector - The sector from the user's selection.
	 * @returns {Array<string>} A list of decorrelated sector names.
	 */
	getDecorrelatedSectors: (selectedSector) => {
		// Direct lookup using the provided sector names
		return sectorDecorrelationMap[selectedSector] || [];
	},
};

module.exports = decorrelationProvider;
