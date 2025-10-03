const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

// Create an Express app
const app = express();
const PORT = 8002;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cors());

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
