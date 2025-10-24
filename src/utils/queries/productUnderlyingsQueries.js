const { IssuersId, ProductTypesId } = require("../../config/constants.js");

module.exports = {
	[IssuersId.EFG_INTERNATIONAL]: {
		[ProductTypesId.PHOENIX_AUTOCALL]: {
			underlyings: {
				vectorQuery: "Underlyings, Underlying Shares, Bloomberg Code, GBP / GBp",
				llmPrompt: `
                List of all Underlyings (it's possible that there's only 1. 
                Put only Ticker + Initial Fixing. For instance: AAPL US ; 304.24. 
                Please make sure to always return the full ticker - example: 'AAPL US', 
                'NVDA UW' - not just 'AAPL', 'NVDA'). If an Underlying has an initial fixing in 
                GBP or GBp, you need to consider the initial fixing in GBp (so in pence). 
                Example: if Rolls Royce has a fixing of 11.68 GBP, you must consider the initial 
                fixing to be 1168 (because 1 GBP = 100 GBp). Return the information in the 
                following format:
                [
                    {
                        "ticker": "AAPL US",
                        "initialFixing": 30424
                    },
                    {
                        "ticker": "NVDA UW",
                        "initialFixing": 50234
                    }
                ]
                If you can't find the information, return an empty array: []
                `,
			},
		},
	},
};
