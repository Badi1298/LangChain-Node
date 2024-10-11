const issuers_list = require("../../utils/issuerList");

const getIssuer = (issuer) => {
  return issuers_list.find((iss) => issuer.includes(iss.name));
};

const isNotional = (issuerPrice) => {
  return issuerPrice.includes("%") ? 1 : 0;
};

// Export the functions
module.exports = {
  getIssuer,
  isNotional,
};
