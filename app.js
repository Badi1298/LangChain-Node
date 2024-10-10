const cors = require("cors");
const express = require("express");

const pdfRoutes = require("./src/routes/parsePdfRoutes");

// Set up multer for file uploads

// Create an Express app
const app = express();
const PORT = 8002;

app.use(cors());

// Define an endpoint to handle file upload and parse
app.use("/", pdfRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
