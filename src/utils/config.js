// config.js
require("dotenv").config();

const config = {
	openai: {
		apiKey: process.env.OPENAI_API_KEY,
		embeddingModel: "text-embedding-3-small", // Or load from env
	},
	// Define VECTOR_DIMENSION based on the chosen embedding model
	vectorDimension: 1536,
};

module.exports = config;
