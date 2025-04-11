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

module.exports = { IssuersId, ProductTypesId, Frequencies, RedemptionTypes };
