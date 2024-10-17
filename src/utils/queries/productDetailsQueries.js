const { IssuersId, ProductTypesId } = require("../../../config/constants");

module.exports = {
  [IssuersId.EFG_INTERNATIONAL]: {
    [ProductTypesId.REVERSE_CONVERTIBLE]: {
      isLowStrike: "Does the document have the exact string 'Barrier Event'?",
      maturity:
        "Calculate the difference in days between the Initial Fixing Date and the Final Fixing Date. In the document, the Initial Fixing Date is most likely formatted as: '<DATE>Initial Fixing Date\n', and the Final Fixing Date as: '<DATE> (subject to Market Disruption Event provisions)Final Fixing Date\n'. Only display the final result as a number, nothing else.",
      frequency:
        "There is a section called Coupon Amount(s) and Coupon Payment Date(s). There are payments that have the format - CURRENCY VALUE paid on DATE. How many of these payments are found in the document? Display only the amount of payments as a number, nothing else.",
      denomination:
        "What is the value of the Denomination? Display only the value without the currency.",
      couponLevel:
        "For the Coupon Amount(s) and Coupon Payment Date(s), the format will be something like this - CUR VALUE paid on DATE. Are the values payed on all the different days the same? Display only the value without currency if yes, say 'no' otherwise.",
      capitalProtectionLevel: `Is the product a Low Strike? If yes, then display the Strike Level (XXX%),
        else display the Barrier Level (XXX%). Display only the value inside the parentheses, without the percent sign, nothing else.`,
      redemptionType:
        "What is the Settlement Type(s) inside the General Information section?",
      underlyings:
        "What are the underlyings inside the Underlyings table? Display nothin but their Bloomberg Tickers separated by commas. They should be found in the document in a structure that looks something like this - [[{'Underlying': 'AMAZON.COM INC', 'Related Exchange': 'NASDAQ', 'Bloomberg Ticker': 'AMZN UQ', 'Initial Fixing Level (100%)*': 'USD 3312.49'... .",
      initialFixings:
        "What is the Initial Fixing Level (100%) of the underlyings inside the Underlying table? Display only the Initial Fixing values without currency, separated by commas. It should be found in the document in a structure that looks something like this - [[{'Underlying': 'AMAZON.COM INC', 'Related Exchange': 'NASDAQ', 'Bloomberg Ticker': 'AMZN UQ', 'Initial Fixing Level (100%)*': 'USD 3312.49'... .Ignore 'NaN', do not display them.",
      valoren:
        "What is the Swiss Security Number? Display only the number itself.",
    },
  },
};
