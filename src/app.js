const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

const pdfRoutes = require("./routes/parsePdfRoutes");
const stockSuggestionsRoutes = require("./routes/stockSuggestionsRoutes");

// Create an Express app
const app = express();
const PORT = 8002;

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
