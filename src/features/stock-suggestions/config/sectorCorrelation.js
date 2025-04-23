const sectorCorrelationMap = {
	"Communication Services": [
		"Information Technology", // Significant overlap in tech/internet companies, growth sensitivity
		"Consumer Discretionary", // Media & entertainment components share consumer sensitivity
	],
	"Consumer Discretionary": [
		"Industrials", // Both highly cyclical and sensitive to economic growth
		"Financials", // Consumer spending linked to credit availability, economic health impacts both
		"Information Technology", // Many tech products are discretionary purchases; shared growth focus
		"Communication Services", // Overlap in media/entertainment spending
	],
	"Consumer Staples": [
		"Utilities", // Both are classic defensive sectors, less sensitive to economic cycles
		"Health Care", // Also defensive, demand is relatively stable regardless of economy
	],
	Energy: [
		"Materials", // Both sensitive to commodity prices and global industrial demand
		"Industrials", // Energy is a major input, heavy industry often correlated
	],
	Financials: [
		"Real Estate", // Both highly sensitive to interest rate changes and credit cycles
		"Industrials", // Financial health often tied to industrial activity and investment
		"Consumer Discretionary", // Reflects broader economic health and consumer creditworthiness
	],
	"Health Care": [
		"Consumer Staples", // Both defensive, relatively inelastic demand
		"Utilities", // Also defensive, often sought for stability
	],
	Industrials: [
		"Materials", // Materials are key inputs for Industrials; shared cyclicality
		"Energy", // Energy powers industry; often move with global growth expectations
		"Consumer Discretionary", // Both are highly cyclical sectors tied to economic activity
		"Financials", // Industrial activity often linked to capital investment & lending
	],
	"Information Technology": [
		"Communication Services", // Large overlap in tech companies, internet services
		"Consumer Discretionary", // Many tech goods are discretionary; shared growth/innovation focus
	],
	Materials: [
		"Energy", // Both driven by commodity prices and global supply/demand
		"Industrials", // Key customer for materials; shared sensitivity to industrial cycle
	],
	"Real Estate": [
		"Financials", // Highly sensitive to interest rates, credit conditions, property financing
		"Utilities", // Often grouped as yield-sensitive sectors
	],
	Utilities: [
		"Consumer Staples", // Both are defensive, provide essential services/goods
		"Health Care", // Also defensive, less economically sensitive
		"Real Estate", // Both often considered income/yield plays, sensitive to interest rates
	],
};

module.exports = { sectorCorrelationMap };
