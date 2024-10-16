const { IssuersId, ProductTypesId } = require("../../../config/constants");

module.exports = {
  [IssuersId.EFG_INTERNATIONAL]: {
    [ProductTypesId.REVERSE_CONVERTIBLE]: {
      isLowStrike: "Does the document have the exact string 'Barrier Event'?",
      maturity:
        "The difference in days between the Initial Fixing Date and the Final Fixing Date. Display only the number.",
      frequency:
        "There is a section called Coupon Amount(s) and Coupon Payment Date(s). There are payments that have the format - CURRENCY VALUE paid on DATE. How many of these payments are found in the document? Display only the amount of payments as a number, nothing else.",
      denomination:
        "What is the value of the Denomination? Display only the value without the currency.",
      couponLevel:
        "For the Coupon Amount(s) and Coupon Payment Date(s), are the values payed on all the different dates the same? Display only the value without currency if yes, say 'no' otherwise.",
      capitalProtectionLevel: `Is the product a Low Strike? If yes, then display the Strike Level (XXX%),
        else display the Barrier Level (XXX%). Display only the value, without a '%', nothing else.`,
      redemptionType:
        "What is the Settlement Type(s) inside the General Information section?",
      underlyings:
        "What are the underlyings inside the Underlyings table? Display nothin but their Bloomberg Tickers separated by commas.",
      initialFixings:
        "What is the Initial Fixing Level (100%) of the underlyings inside the Underlying table? Display only the Initial Fixing values without currency, separated by commas. Do not display any other Level, just the Initial Fixing Level. Be careful not to display the Barrier Level, Strike Level, Autocall Trigger Level or any other level instead of the Initial Fixing Level by accident.",
      valoren:
        "What is the Swiss Security Number? Display only the number itself.",
    },
  },
};
