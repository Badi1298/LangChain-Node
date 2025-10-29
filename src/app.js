const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const parsePdfRoutes = require("./routes/parsePdfRoutes");
const parsePdfSectionsRoutes = require("./routes/parsePdfSectionsRoutes");

// Create an Express app
const app = express();
const PORT = 8002;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cors());

// Routes
app.use("/api/ai", parsePdfRoutes);
app.use("/api/v1/pdf-sections", parsePdfSectionsRoutes);

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
