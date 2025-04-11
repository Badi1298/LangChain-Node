const { sectorDecorrelationMap } = require("../../../config/sectorDecorrelations.js");

const getDecorrelatedSectors = (sectors) => {
	// Create a Set to store decorrelated sectors
	const decorrelatedSectors = new Set();

	// Iterate through each sector in the input array
	sectors.forEach((sector) => {
		// Check if the sector exists in the correlation matrix
		if (sectorDecorrelationMap[sector]) {
			// Iterate through the correlated sectors of the current sector
			sectorDecorrelationMap[sector].forEach((correlatedSector) => {
				// Add the correlated sector to the decorrelated sectors set
				decorrelatedSectors.add(correlatedSector);
			});
		}
	});

	return Array.from(decorrelatedSectors);
};

module.exports = {
	getDecorrelatedSectors,
};
