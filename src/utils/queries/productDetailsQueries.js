const { IssuersId, ProductTypesId } = require("../../config/constants.js");

module.exports = {
	[IssuersId.EFG_INTERNATIONAL]: {
		[ProductTypesId.PHOENIX_AUTOCALL]: {
			// protectionType: {
			// 	vectorQuery:
			// 		"Knock-in Event / Barrier Level definition and its effect on Final Payout / Level, Final Redemption conditions and barrier observation at maturity, Capital protection barrier level and final payout formula, Continuous or daily barrier observation during product lifetime",
			// 	llmPrompt:
			// 		"Protection Type - it's 'Low Strike', 'European Barrier', 'American Barrier' or 'Daily Close Barrier'. Low Strike is when the loss begins from another level than the Initial Fixing Level of the worst performing underlying. European Barrier is when the loss starts from the Initial Fixing Level, with a barrier observation at Maturity. American barrier is when the barrier observation is continuous during the product lifetime. Daily close is as american barrier but we don't observe all trading levels, only the closing levels, during the product lifetime. We can have both one of the 3 barriers AND a low strike, meaning the observation on the underlying level is from a certain level (the barrier) and the loss starts from a lower level than the Initial Fixing, in this case the Protection Type is NOT low strike, it's one of the 3 barriers",
			// },
			// maturityInMonths: {
			// 	vectorQuery:
			// 		"Maturity, Initial Fixing Date, Final Fixing Date, Initial Valuation Date, Final Valuation Date",
			// 	llmPrompt:
			// 		"Maturity is the difference between the Initial Fixing Date and Final Fixing Date (also knows as Initial Valuation Date and Final Valuation Date). Return only an integer number e.g. 12, 18, ...)",
			// },
			// observationsFrequency: {
			// 	vectorQuery: "Observations Frequency, monthly, quarterly, semi_annually, annually",
			// 	llmPrompt:
			// 		"What is the Observations Frequency (monthly, quarterly, semi_annually, annually or other)? Return only one of these values: monthly, quarterly, semi_annually, annually or other.",
			// },
			// couponBarrierPercentage: {
			// 	vectorQuery: "Coupon Barrier Level",
			// 	llmPrompt: "What is the Coupon Barrier Level, as a number, e.g., for 70%, use 70.",
			// },
			// couponLevelPerPeriod: {
			// 	vectorQuery: "Coupon Level (per period / per denomination), coupon rate",
			// 	llmPrompt:
			// 		"Coupon Level (per period, as a number). It is probably a percentage of the denomination. Do not confuse it with the coupon barrier. Return only a number, no %.",
			// },
			// hasMemoryEffect: {
			// 	vectorQuery: `
			// 		Calculation of interest coupon payments and handling of missed or unpaid previous interest payments,
			// 		Coupon payment calculation formula and handling of previously missed or unpaid coupons
			// 	`,
			// 	llmPrompt:
			// 		"Memory effect on coupons — check if missed coupon payments are accumulated and paid at the next coupon date (i.e. do unpaid coupons roll over? Will all the possibly missed coupons be paid when a coupon is paid?). Return true or false.",
			// },
			// nonCallPeriods: {
			// 	vectorQuery: "Non-Call period, early redemption",
			// 	llmPrompt:
			// 		"Non-Call period (number of observed periods where the product can NOT be ealry redeemed, we just observe the coupon. Integer number, 1, 2, 3, etc.)",
			// },
			// autocallTriggerType: {
			// 	vectorQuery: "Autocall Trigger, Stepdown, Fix",
			// 	llmPrompt:
			// 		"Autocall Trigger ('Fix' or 'Stepdown'). Autocall Trigger is the level above which all underlyings must close on an observation date for the product to be early redeemed. Fix means it's always the same level. Stepdown is when the level decreases on each observation",
			// },
			// initialFixingDate: {
			// 	vectorQuery: "Initial Fixing Date, Trade Date, Strike Date",
			// 	llmPrompt:
			// 		"Initial Fixing Date (Also called 'Trade Date' or 'Strike Date'), it's the date when the fixing of the underlyings occurred.",
			// },
			valuationDate: {
				vectorQuery: "Valuation Date, Issue Date",
				llmPrompt:
					"Valuation Date (also called 'Issue Date'), it's when the settlement occurs, generally 1 or 2 weeks after Initial Fixing Date.",
			},
		},
	},
};
