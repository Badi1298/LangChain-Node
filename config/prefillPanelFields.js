const {
  computeFrequency,
  calculateCouponLevel,
  computeRedemptionType,
} = require("../src/services/product-details/parseProductDetails");

module.exports = {
  MATU: {
    key: "MATU",
    valueKey: "maturity",
    process: (value) => Math.round(parseInt(value) / 30),
  },
  FREQ: {
    key: "FREQ",
    valueKey: "frequency",
    process: (value, ragResults) =>
      computeFrequency(Math.round(parseInt(ragResults.maturity) / 30), value),
  },
  CPN_LEVEL_PP: {
    key: "CPN_LEVEL_PP",
    valueKey: "couponLevel",
    process: (value, ragResults) =>
      calculateCouponLevel(value, ragResults.denomination),
  },
  K_PROTECT_LEVEL: {
    key: "K_PROTECT_LEVEL",
    valueKey: "capitalProtectionLevel",
  },
  CASH_PHY: {
    key: "CASH_PHY",
    valueKey: "redemptionType",
    process: (value) => computeRedemptionType(value),
  },
  // Add more fields as needed...
};
