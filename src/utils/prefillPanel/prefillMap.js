const { ProductTypesId } = require("../../config/constants.js");
const prefillPanelFields = require("./prefillPanelFields.js");

module.exports = {
	[ProductTypesId.REVERSE_CONVERTIBLE]: {
		fields: [
			prefillPanelFields.MATU,
			prefillPanelFields.FREQ,
			prefillPanelFields.CPN_LEVEL_PP,
			prefillPanelFields.K_PROTECT_LEVEL,
			prefillPanelFields.CASH_PHY,
		],
	},
	// Add more product type configurations here...
};
