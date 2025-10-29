module.exports = {
	protectionType:
		"Protection Type - it's 'Low Strike', 'European Barrier', 'American Barrier' or 'Daily Close Barrier'. Low Strike is when the loss begins from another level than the Initial Fixing Level of the worst performing underlying. European Barrier is when the loss starts from the Initial Fixing Level, with a barrier observation at Maturity. American barrier is when the barrier observation is continuous during the product lifetime. Daily close is as american barrier but we don't observe all trading levels, only the closing levels, during the product lifetime. We can have both one of the 3 barriers AND a low strike, meaning the observation on the underlying level is from a certain level (the barrier) and the loss starts from a lower level than the Initial Fixing, in this case the Protection Type is NOT low strike, it's one of the 3 barriers",
	maturityInMonths:
		"Maturity is the difference between the Initial Fixing Date and Final Fixing Date (also knows as Initial Valuation Date and Final Valuation Date). Return only an integer number e.g. 12, 18, ...)",
	observationsFrequency:
		"What is the Observations Frequency (monthly, quarterly, semi_annually, annually or other)? Return only one of these values: monthly, quarterly, semi_annually, annually or other.",
	couponBarrierPercentage:
		"What is the Coupon Barrier Level, as a number, e.g., for 70%, use 70.",
	couponLevelPerPeriod:
		"Coupon Level (per period, as a number). It is probably a percentage of the denomination. Do not confuse it with the coupon barrier. Return only a number, no %.",
	hasMemoryEffect:
		"Memory effect on coupons — check if missed coupon payments are accumulated and paid at the next coupon date (i.e. do unpaid coupons roll over? Will all the possibly missed coupons be paid when a coupon is paid?). Return true or false.",
	nonCallPeriods:
		"Non-Call period (number of observed periods where the product can NOT be early redeemed, we just observe the coupon. Integer number, 1, 2, 3, etc.)",
	autocallTriggerType:
		"Autocall Trigger ('Fix' or 'Stepdown'). Autocall Trigger is the level above which all underlyings must close on an observation date for the product to be early redeemed. Fix means it's always the same level. Stepdown is when the level decreases on each observation",
	initialFixingDate:
		"Initial Fixing Date (Also called 'Trade Date' or 'Strike Date'), it's the date when the fixing of the underlyings occurred. Return only the date in DD.MM.YYYY format.",
	valuationDate:
		"Valuation Date (also called 'Issue Date'), it's when the settlement occurs, generally 1 or 2 weeks after Initial Fixing Date. Return only the date in DD.MM.YYYY format.",
	finalFixingDate:
		"Final Fixing Date (also called 'Valuation Date'), it's the date when we observe the final levels of the underlyings on the closing. Return only the date in DD.MM.YYYY format.",
	maturityDate:
		"Maturity Date (also called 'Redemption Date'), it's when the settlement occurs to end the product, so it's 1 or 2 weeks after the Final Fixing Date generally. Return only the date in DD.MM.YYYY format.",
	// hasLowStrikeAndBarrier: {
	// 	vectorQuery: "Low Strike, Barrier Level, Knock-in Level",
	// 	llmPrompt:
	// 		"Does the product have both a Low Strike and a Barrier Level (Knock-in Level)? Return true or false.",
	// },
	// lowStrikeLevelPercentage: {
	// 	vectorQuery: "Low Strike Level",
	// 	llmPrompt: "What is the Low Strike Level, as a number, e.g., for 80%, use 80.",
	// },
	// redemptionType: {
	// 	vectorQuery:
	// 		"Final Redemption settlement method (Cash or Physical), Payout at maturity in case of barrier breach",
	// 	llmPrompt:
	// 		"Redemption Type (Cash/Physical). If you see “Cash and Physical” or similar wording, then it's Physical. Physical is when the investor receives shares of the worst performing underlying at maturity in the negative scenario.",
	// },
	// assetClass: {
	// 	vectorQuery: "Underlying Asset Class, Equity, Index, ETF, Commodity, FX",
	// 	llmPrompt:
	// 		"What is the Asset Class (Equity, Index, Credit, Commodities, FX, Rates or Mixed). Note that if you think the underlying is an index or ETF containing stocks and you have other underlyings being stocks, you can put 'Equity'. Else it's Mixed.",
	// },
	// valoren: {
	// 	vectorQuery: "Valoren Number, Valoren, Common Code",
	// 	llmPrompt: "What is the Valoren / Common Code of the product?",
	// },
	// denomination: {
	// 	vectorQuery: "Denomination, Nominal Value, Face Value",
	// 	llmPrompt:
	// 		"What is the Denomination (also called Nominal Value or Face Value) of the product, as a number? For example, for 1,000 CHF, return 1000.",
	// },
	// issuePrice: {
	// 	vectorQuery: "Issue Price",
	// 	llmPrompt:
	// 		"Issue Price (number, can be % if it quote in Notional or not if it's in Units). Return only a number, no % sign.",
	// },
	// minimumTradingSize: {
	// 	vectorQuery: "Minimum Trading Size, Denomination, Nominal Value, Face Value",
	// 	llmPrompt:
	// 		"Minimum Trading Size (if no information about minimum trading size, then use the denomination for this value). Return only a number.",
	// },
};
