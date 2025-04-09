// services/pineconeClient.js
const { Pinecone } = require("@pinecone-database/pinecone");
const { config } = require("../utils/config.js");

let pineconeIndexInstance = null;

try {
	console.log("Initializing Pinecone client...");
	const pc = new Pinecone({ apiKey: config.pinecone.apiKey });

	console.log(`Accessing Pinecone index: ${config.pinecone.indexName}`);
	pineconeIndexInstance = pc.Index(config.pinecone.indexName);

	console.log("Pinecone index object ready.");
	// Optional: Add a quick check like describeIndexStats here to confirm connection on startup
	// pineconeIndexInstance.describeIndexStats()
	//  .then(stats => console.log(`Pinecone index '${config.pinecone.indexName}' stats:`, stats))
	//  .catch(err => { console.error("Pinecone connection check failed:", err); process.exit(1); });
} catch (error) {
	console.error("CRITICAL ERROR: Failed to initialize Pinecone client/index.", error);
	process.exit(1); // Stop app if connection fails
}

// Export the single, initialized index instance
export const pineconeIndex = pineconeIndexInstance;
