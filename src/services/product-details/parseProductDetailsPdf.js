const Frequencies = Object.freeze({
  NO_COUPON: 0,
  MONTHLY: 1,
  QUARTERLY: 2,
  SEMI_ANNUALLY: 3,
  ANNUALLY: 4,
  OTHER: 5,
  IN_FINE: 6,
});

const isActiveFlag = (flag) => {
  return flag.toLowerCase().includes("no") ? 1 : 0;
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
  let formatted = num.toFixed(2);

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

const parseUnderlyings = (underlyings) => {
  return underlyings.split(",").map((item) => item.trim());
};

const parseInitialFixings = (initialFixings) => {
  return initialFixings.split(",").map((item) => item.trim());
};

module.exports = {
  isActiveFlag,
  computeFrequency,
  calculateCouponLevel,
  parseUnderlyings,
  parseInitialFixings,
};
