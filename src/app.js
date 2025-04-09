const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

const pdfRoutes = require("./routes/parsePdfRoutes");
const stockSuggestionsRoutes = require("./routes/stockSuggestionsRoutes");

const config = require("./utils/config.js");
const pineconeIndexInstance = require("./services/pineconeClient.js");
const openaiInstance = require("./services/openaiClient.js");

// Create an Express app
const app = express();
const PORT = 8002;

// Initialize and attach to app.locals
try {
	app.locals.pineconeIndex = pineconeIndexInstance;
	app.locals.openai = openaiInstance;
	app.locals.vectorDimension = config.vectorDimension;
	console.log("Attached Pinecone index and OpenAI instance to app.locals.");
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
