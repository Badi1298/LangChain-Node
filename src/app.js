const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

const pdfRoutes = require("./routes/parsePdfRoutes");
const stockSuggestionsRoutes = require("./routes/stockSuggestionsRoutes");

const config = require("./utils/config.js");
const { Pinecone } = require("@pinecone-database/pinecone");

// Create an Express app
const app = express();
const PORT = 8002;

// Initialize and attach to app.locals
try {
	const pc = new Pinecone({ apiKey: config.pinecone.apiKey });
	app.locals.pineconeIndex = pc.Index(config.pinecone.indexName);
	app.locals.vectorDimension = config.vectorDimension; // Attach constant too
	console.log("Pinecone index attached to app.locals");
	// Optional connection check here
} catch (error) {
	console.error("CRITICAL ERROR: Failed to initialize Pinecone.", error);
	process.exit(1);
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cors());

// Define an endpoint to handle file upload and parse
app.use("/", pdfRoutes);

app.use("/ai", stockSuggestionsRoutes);

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
