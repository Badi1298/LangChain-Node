const path = require("path");
const fs = require("fs").promises; // Using fs promises to delete files asynchronously

const { initializeRagChain } = require("../services/initializeRagChain");
const queries = require("../utils/queries/productInformationQueries");

const {
  getIssuer,
  isNotional,
} = require("../services/product-information/parseProductInformation");

/**
 * Parses product information from an uploaded PDF file and extracts details like
 * issuer, notional, ISIN, and currency using a RAG (Retrieval-Augmented Generation) chain.
 *
 * @param {Object} req - The request object containing the uploaded file.
 * @param {Object} res - The response object used to send the result or errors back to the client.
 *
 * @returns {void}
 *
 * @throws Will throw an error if no file is uploaded, if an invalid response is returned by the RAG chain,
 * or if there is an issue with PDF processing or file deletion.
 */
exports.parseProductInformationTermsheet = async (req, res) => {
  try {
    // Check if a file has been uploaded with the request.
    if (!req.file) {
      // Return a 400 Bad Request response if no file is found.
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the full file path of the uploaded PDF.
    const pdfPath = path.join(process.cwd(), req.file.path);

    // Initialize the Retrieval-Augmented Generation (RAG) chain to process the PDF.
    const runnableRagChain = await initializeRagChain(pdfPath);

    // Execute all query streams concurrently to extract issuer, notional, ISIN, and currency data.
    const [issuerData, notional, isin, currency] = await Promise.all(
      queries[9].map((query) => runnableRagChain.invoke(query))
    );

    // Check if the issuer data contains an invalid response (e.g., "I don't know").
    if (issuerData.toLocaleLowerCase().includes("i don't know")) {
      // Throw an error if the response is invalid.
      throw new Error();
    }

    // Construct the result object containing the extracted data.
    let result = {
      issuer: getIssuer(issuerData).id, // Extract the issuer ID.
      issuer_code: getIssuer(issuerData).issuer_code, // Extract the issuer code.
      notional: isNotional(notional), // Validate and extract the notional value.
      isin, // International Securities Identification Number (ISIN).
      currency, // Currency information.
    };

    // Delete the uploaded PDF file from the server after processing.
    await fs.unlink(pdfPath);

    // Send the extracted data back to the client as a successful JSON response.
    res.json({ success: true, data: result });
  } catch (error) {
    // Log the error details in the server console.
    console.error(error);

    // Send a 500 Internal Server Error response with an appropriate error message.
    res.status(500).json({ message: "Error loading PDF" });
  } finally {
    // Ensure the uploaded file is deleted, even if an error occurs.
    if (req.file) {
      const pdfPath = path.join(process.cwd(), req.file.path);
      try {
        await fs.unlink(pdfPath);
      } catch (unlinkError) {
        // Log any errors that occur during file deletion.
        console.error("Error deleting file:", unlinkError.message);
      }
    }
  }
};
