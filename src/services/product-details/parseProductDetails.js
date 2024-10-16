const { Frequencies, RedemptionTypes } = require("../../../config/constants");

const isActiveFlag = (flag) => {
  return flag.toLowerCase().includes("no") ? 1 : 0;
};

const checkBarrierConditions = async (result, runnableRagChain) => {
  if (result.isLowStrike) return;

  const isEuropeanBarrier = await runnableRagChain.invoke(
    "Does the document contain the text 'Barrier Observation Period'?"
  );
  result.isEuropeanBarrier = isActiveFlag(isEuropeanBarrier);

  if (result.isEuropeanBarrier) return;

  // const errorCheck = await runnableRagChain.invoke(
  //   "Is the Barrier Observation Period start date different from the Barrier Observation Period end date?"
  // );
  // if (errorCheck.toLowerCase().includes("no")) throw new Error();

  const isAmericanBarrier = await runnableRagChain.invoke(
    "Is the string 'closing level' present between the sections titled 'Barrier Event' and 'Barrier Observation Period'?"
  );
  result.isAmericanBarrier = isActiveFlag(isAmericanBarrier);
};

const computeFrequency = (maturity, frequency) => {
  const freq = maturity / parseInt(frequency);

  if (freq === maturity) {
    return Frequencies.IN_FINE;
  } else if (freq === 1) {
    return Frequencies.MONTHLY;
  } else if (freq === 3) {
    return Frequencies.QUARTERLY;
  } else if (freq === 6) {
    return Frequencies.SEMI_ANNUALLY;
  } else if (freq === 12) {
    return Frequencies.ANNUALLY;
  }
};

function formatNumber(num) {
  // Convert the number to a string with at least 2 decimal places
  let formatted = num.toFixed(4);

  // Remove trailing zeros if they are not necessary
  formatted = formatted.replace(/(\.\d*?[1-9])0+$/g, "$1"); // Remove extra zeros after meaningful decimals
  formatted = formatted.replace(/\.00$/g, ""); // Remove ".00" if there are no decimal digits left

  return formatted;
}

const calculateCouponLevel = (couponLevel, denomination) => {
  return formatNumber(
    (100 * parseFloat(couponLevel)) / parseFloat(denomination)
  );
};

const computeRedemptionType = (redemptionType) => {
  if (
    redemptionType.toLowerCase() === "cash settlement or delivery of underlying"
  ) {
    return RedemptionTypes.PHYSICAL;
  }

  return RedemptionTypes.CASH;
};

const parseUnderlyings = (underlyings) => {
  return underlyings
    .split(",")
    .map((item) => item.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim());
};

const parseInitialFixings = (initialFixings) => {
  return initialFixings.split(",").map((item) => item.trim());
};

module.exports = {
  isActiveFlag,
  checkBarrierConditions,
  computeFrequency,
  calculateCouponLevel,
  computeRedemptionType,
  parseUnderlyings,
  parseInitialFixings,
};
