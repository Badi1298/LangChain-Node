const { OpenAI } = require("openai");
const config = require("../utils/config.js");

let openaiInstance = null;

try {
	console.log("Initializing OpenAI client...");
	openaiInstance = new OpenAI({ apiKey: config.openai.apiKey });
	console.log("OpenAI client initialized.");
	// Optional: Add a test call here, e.g., list models, to verify connection/key
} catch (error) {
	console.error("CRITICAL ERROR: Failed to initialize OpenAI client.", error);
	process.exit(1);
}

module.exports = openaiInstance; // Export the initialized client
