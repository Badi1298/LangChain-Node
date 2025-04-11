const { openAiSuggestions } = require("./openAiLLM.js");
const { geminiSuggestions } = require("./geminiLLM.js");

module.exports = {
	llms: {
		openAiSuggestions,
		geminiSuggestions,
	},
};
