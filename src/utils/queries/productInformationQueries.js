const { IssuersId } = require("../../config/constants.js");

module.exports = {
	[IssuersId.EFG_INTERNATIONAL]: [
		{
			vectorQuery: "Issuer Name inside the General Information section",
			llmPrompt:
				"What is the Issuer? The issuer should be found in the General Information section. You will most probably find the information in a part of a document that looks like this - 'EFG International Finance (Guernsey) Ltd., St Peter Port, Guernsey\n' + '(Rating: n/a, Supervisory Authority: FINMA, on a consolidated basis)\n' + 'Issuer\n' - in this case, the issuer is EFG International Finance.",
		},
		{
			vectorQuery: "Notional / Nominal / Denomination",
			llmPrompt:
				"What is the Notional / Nominal / Denomination of the product? If the notional is given as a percentage, return 1, otherwise return 0 (as numbers). Only return the NUMBER 1 or 0 based on the specifications just described.",
		},
		{
			vectorQuery: "ISIN",
			llmPrompt:
				"What is the ISIN of the product? The ISIN is usually a 12-character alphanumeric code that uniquely identifies a financial security. It typically starts with a two-letter country code, followed by a nine-character alphanumeric identifier, and ends with a single check digit. For example, an ISIN might look like 'US1234567890' or 'XS2972238955'.",
		},
		{
			vectorQuery: "Currency",
			llmPrompt:
				"What is the currency? Return only the currency code, for example 'USD' or 'EUR'.",
		},
	],
};
