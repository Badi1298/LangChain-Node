const IssuersId = Object.freeze({
	EFG_INTERNATIONAL: 9,
});

const ProductTypesId = Object.freeze({
	PHOENIX_AUTOCALL: 2,
	REVERSE_CONVERTIBLE: 9,
});

const BarrierTypes = Object.freeze({
	LOW_STRIKE_LEVEL: 1,
	EUROPEAN_CAPITAL_BARRIER: 2,
	AMERICAN_CAPITAL_BARRIER: 3,
	DAILY_CLOSE_BARRIER: 4,
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

const AutocallTriggerTypes = Object.freeze({
	FIX: 1,
	STEPDOWN: 2,
});

const MemoryTypes = Object.freeze({
	YES: 1,
	NO: 2,
});

const SizeTypes = Object.freeze({
	NOTIONAL: 1,
	UNITS: 2,
});

const RedemptionTypes = Object.freeze({
	CASH: 1,
	PHYSICAL: 2,
});

const DividendTypes = Object.freeze({
	DISCOUNTED: 1,
	REINVESTED: 2,
	IN_CASH_POCKET: 3,
});

const FxRiskTypes = Object.freeze({
	HEDGED: 1,
	NON_HEDGED: 2,
});

const SesameOfferingTypes = Object.freeze({
	YES: 1,
	NO: 2,
});

module.exports = {
	IssuersId,
	ProductTypesId,
	BarrierTypes,
	Frequencies,
	AutocallTriggerTypes,
	MemoryTypes,
	SizeTypes,
	RedemptionTypes,
	DividendTypes,
	FxRiskTypes,
	SesameOfferingTypes,
};
