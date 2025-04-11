const { openAiSuggestions } = require("./llms/openAiLLM.js");
const { geminiSuggestions } = require("./llms/geminiLLM.js");

module.exports = {
	llms: {
		openAiSuggestions,
		geminiSuggestions,
	},
};
