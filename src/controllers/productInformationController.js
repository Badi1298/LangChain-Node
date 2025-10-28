const { createRagAgent } = require("../services/initializeRagChain");
const queries = require("../utils/queries/productInformationQueries");
const { getVectorStore } = require("./vectorizeController");

const { getIssuer } = require("../services/product-information/parseProductInformation");

/**
 * Parses product information from a vectorized PDF file and extracts details like
 * issuer, notional, ISIN, and currency using a RAG (Retrieval-Augmented Generation) chain.
 *
 * @param {Object} req - The request object containing the fileId.
 * @param {Object} res - The response object used to send the result or errors back to the client.
 *
 * @returns {void}
 *
 * @throws Will throw an error if no fileId is provided, if the vector store is not found,
 * or if there is an issue with the RAG chain.
 */
exports.parseProductInformationTermsheet = async (req, res) => {
	try {
		const { fileId } = req.body;

		if (!fileId) {
			return res.status(400).json({ message: "No fileId provided" });
		}

		const vectorStore = getVectorStore(fileId);

		if (!vectorStore) {
			return res.status(404).json({ message: "Vector store not found for the given fileId" });
		}

		const runnableRagChain = await createRagAgent(vectorStore);

		console.log(runnableRagChain);

		// Execute all query streams concurrently to extract issuer, notional, ISIN, and currency data.
		const [issuerData, notional, isin, currency] = await Promise.all(
			queries[9].map((query) => runnableRagChain.invoke(query))
		);

		console.log(issuerData, notional, isin, currency);

		// Construct the result object containing the extracted data.
		let result = {
			issuer: getIssuer(issuerData).id, // Extract the issuer ID.
			issuer_code: getIssuer(issuerData).issuer_code, // Extract the issuer code.
			notional, // Validate and extract the notional value.
			isin, // International Securities Identification Number (ISIN).
			currency, // Currency information.
		};

		// Send the extracted data back to the client as a successful JSON response.
		res.json({ success: true, data: result });
	} catch (error) {
		// Log the error details in the server console.
		console.error(error);

		// Send a 500 Internal Server Error response with an appropriate error message.
		res.status(500).json({ message: "Error processing request" });
	}
};
