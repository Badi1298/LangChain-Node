const { IssuersId, ProductTypesId } = require("../../config/constants.js");

module.exports = {
	[IssuersId.EFG_INTERNATIONAL]: {
		[ProductTypesId.PHOENIX_AUTOCALL]: {
			maturity: {
				vectorQuery:
					"Maturity, Initial Fixing Date, Final Fixing Date, Initial Valuation Date, Final Valuation Date",
				llmPrompt:
					"Maturity is the difference between the Initial Fixing Date and Final Fixing Date (also knows as Initial Valuation Date and Final Valuation Date). Return only an integer number e.g. 12, 18, ...)",
			},
			frequency: {
				vectorQuery: "Observations Frequency, monthly, quarterly, semi_annually, annually",
				llmPrompt:
					"What is the Observations Frequency (monthly, quarterly, semi_annually, annually or other)? Return only one of these values: monthly, quarterly, semi_annually, annually or other.",
			},
			couponBarrier: {
				vectorQuery: "Coupon Barrier Level",
				llmPrompt: "What is the Coupon Barrier Level, as a number, e.g., for 70%, use 70.",
			},
			couponLevel: {
				vectorQuery: "Coupon Level",
				llmPrompt:
					"What is the Coupon Level, as a number? Coupon Level (per period, as a number). Return only a number.",
			},
			hasMemoryEffect: {
				vectorQuery: `
					Calculation of interest coupon payments and handling of missed or unpaid previous interest payments, 
					Coupon payment calculation formula and handling of previously missed or unpaid coupons
				`,
				llmPrompt:
					"Memory effect on coupons — check if missed coupon payments are accumulated and paid at the next coupon date (i.e. do unpaid coupons roll over? Will all the possibly missed coupons be paid when a coupon is paid?). Return true or false.",
			},
			nonCallPeriods: {
				vectorQuery: "Non-Call period, early redemption",
				llmPrompt:
					"Non-Call period (number of observed periods where the product can NOT be ealry redeemed, we just observe the coupon. Integer number, 1, 2, 3, etc.)",
			},
			autocallTriggerType: {
				vectorQuery: "Autocall Trigger, Stepdown, Fix",
				llmPrompt:
					"Autocall Trigger ('Fix' or 'Stepdown'). Autocall Trigger is the level above which all underlyings must close on an observation date for the product to be early redeemed. Fix means it's always the same level. Stepdown is when the level decreases on each observation",
			},
		},
	},
};
