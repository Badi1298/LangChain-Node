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
      capitalProtectionLevel: `Is the product a Low Strike? If yes, then display the Strike Level (XXX%), 
        else display the Barrier Level (XXX%). Display only the value, without a '%', nothing else.`,
      redemptionType:
        "What is the Settlement Type(s)? Display only the Settlement Type(s) itself.",
      underlyings:
        "What are the underlyings inside the Underlyings table? Display nothin but their Bloomberg Tickers.",
      initialFixings:
        "What is the Initial Fixing Level (100%) of the underlyings inside the Underlying table? Display only the Initial Fixing values without currency, separated by commas. Do not display any other Level, just the Initial Fixing Level. Be careful not to display the Barrier Level, Strike Level, Autocall Trigger Level or any other level instead of the Initial Fixing Level by accident.",
      eventsType:
        "Does the product have any events? IF yes, what is the Event Type of the product?",
      events:
        "What are the Autocall Observation and Early Redemption Dates? I need the Observation Date and Early Redemption date of each one place in an array of arrays, where for each array index 0 is the Observation Date and index 1 is the Redemption Date.",
    },
  },
};
