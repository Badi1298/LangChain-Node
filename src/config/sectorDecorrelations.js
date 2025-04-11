/**
 * Placeholder Decorrelation Logic based on the 11 provided sectors.
 * !!! IMPORTANT: Relationships are illustrative examples ONLY.
 * Replace with actual, validated decorrelation data for production use. !!!
 */
const sectorDecorrelationMap = {
	"Communication Services": ["Utilities", "Consumer Staples", "Energy", "Materials"], // Mix of defensive and commodity-driven
	"Consumer Discretionary": ["Utilities", "Consumer Staples", "Health Care", "Energy"], // Primarily defensive sectors + Energy
	"Consumer Staples": ["Energy", "Information Technology", "Materials", "Industrials"], // Cyclicals/Commodity, less sensitive to staples' demand floor
	Energy: ["Consumer Staples", "Health Care", "Utilities", "Information Technology"], // Defensive + Tech (often different drivers than oil prices)
	Financials: ["Utilities", "Consumer Staples", "Health Care", "Energy", "Materials"], // Defensive + Commodity (often sensitive to different factors than interest rates/economy)
	"Health Care": ["Energy", "Materials", "Industrials", "Financials"], // Commodity + Cyclicals (less related to healthcare-specific factors)
	Industrials: ["Utilities", "Consumer Staples", "Health Care"], // Primarily defensive sectors
	"Information Technology": ["Utilities", "Consumer Staples", "Energy", "Materials", "Real Estate"], // Defensive, Commodity, Rate-sensitive (different drivers than tech growth)
	Materials: ["Utilities", "Consumer Staples", "Health Care", "Information Technology"], // Defensive + Tech
	"Real Estate": ["Information Technology", "Energy", "Consumer Discretionary", "Materials"], // Less interest-rate sensitive sectors, cyclicals
	Utilities: ["Information Technology", "Energy", "Materials", "Industrials", "Consumer Discretionary"], // Cyclicals/Commodity (less interest-rate sensitive)
};

// Example Usage:
// console.log(sectorDecorrelations["Information Technology"]);
// Output might be: ["Utilities", "Consumer Staples", "Energy", "Materials", "Real Estate"]

module.exports = { sectorDecorrelationMap };
