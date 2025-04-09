const sectorDecorrelationMap = require("../config/sectorDecorrelations.js");

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
