const IssuersId = Object.freeze({
	EFG_INTERNATIONAL: 9,
});

const ProductTypesId = Object.freeze({
	PHOENIX_AUTOCALL: 2,
	REVERSE_CONVERTIBLE: 9,
});

const Frequencies = Object.freeze({
	NO_COUPON: 0,
	MONTHLY: 1,
	QUARTERLY: 2,
	SEMI_ANNUALLY: 3,
	ANNUALLY: 4,
	OTHER: 5,
	IN_FINE: 6,
});

const RedemptionTypes = Object.freeze({
	CASH: 1,
	PHYSICAL: 2,
});

const ProductTypesSuggestionsMap = Object.freeze({
	PHOENIX_AUTOCALL: {
		SAME_SUB_SECTORS: "sameSubSectors",
		DIFFERENT_SUB_SECTORS: "differentSubSectors",
		IMPROVE_LEVEL: "Optimal suggestions to improve Level",
		DECORRELATION: "Same country, improved decorrelation/volatility",
		DECORRELATION_TOO: "Improve levels through decorrelation",
		LOW_VOLATILITY: "Similar underlyings with volatility lower than usual",
	},
});

module.exports = { IssuersId, ProductTypesId, Frequencies, RedemptionTypes, ProductTypesSuggestionsMap };
