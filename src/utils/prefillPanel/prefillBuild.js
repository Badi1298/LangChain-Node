const prefillMappings = require("./prefillMap");

function buildPrefillPanel(productTypeId, ragResults) {
  const mapping = prefillMappings[productTypeId];
  if (!mapping) {
    throw new Error("Mapping not found for this product type");
  }

  return mapping.fields.map((field) => {
    const value = ragResults[field.valueKey];
    return {
      key: field.key,
      value: field.process ? field.process(value, ragResults) : value,
    };
  });
}

module.exports = { buildPrefillPanel };
