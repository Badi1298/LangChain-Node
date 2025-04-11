require("dotenv").config();

const config = {
	pinecone: {
		apiKey: process.env.PINECONE_API_KEY,
		indexName: process.env.PINECONE_INDEX_NAME || "stock-data",
		// Add region/cloud if needed by your Pinecone client version/setup
	},
	openai: {
		apiKey: process.env.OPENAI_API_KEY,
		embeddingModel: "text-embedding-3-small", // Or load from env
	},
	// Define VECTOR_DIMENSION based on the chosen embedding model
	vectorDimension: 1536,
};

// Basic validation on startup
if (!config.pinecone.apiKey || !config.openai.apiKey) {
	console.error("CRITICAL ERROR: Missing PINECONE_API_KEY or OPENAI_API_KEY in environment variables.");
	process.exit(1); // Stop the application if critical config is missing
}

module.exports = config;
