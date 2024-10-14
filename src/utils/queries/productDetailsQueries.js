const { IssuersId, ProductTypesId } = require("../../../config/constants");

module.exports = {
  [IssuersId.EFG_INTERNATIONAL]: {
    [ProductTypesId.REVERSE_CONVERTIBLE]: {
      isLowStrike: "Does the document have the exact string 'Barrier Event'?",
      maturity:
        "The difference in days between the Initial Fixing Date and the Final Fixing Date. Display only the number.",
      frequency:
        "How many Coupon Amount(s) and Coupon Payment Date(s) are there? Display only the amount as a number.",
      denomination:
        "What is the value of the Denomination? Display only the value without the currency.",
      couponLevel:
        "For the Coupon Amount(s) and Coupon Payment Date(s), are the values payed on all the different dates the same? Display only the value without currency if yes, say 'no' otherwise.",
      capitalProtectionLevel:
        "If the context doesn't have the exact string 'Barrier Event', then display the Strike Level, and if it has the string 'Barrier Event' then display the Barrier Level. Only display the value, without a '%'.",
      redemptionType:
        "What is the Settlement Type(s)? Display only the Settlement Type(s) itself.",
      underlyings:
        "What are the name and the Bloomberg Tickers of the underlyings inside the Underlying table? Display the tickers only.",
      initialFixings:
        "What are the Initial Fixing Level (100%) of the underlyings inside the Underlying table? Display only the fixings values without currency separated by commas.",
    },
  },
};
