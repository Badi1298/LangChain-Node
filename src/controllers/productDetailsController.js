const { createRagChain } = require("../services/initializeRagChain");
const { getVectorStore } = require("./vectorizeController");

const queryMap = require("../utils/queries/productDetailsQueries");
const {
	isActiveFlag,
	parseUnderlyings,
	parseInitialFixings,
	checkBarrierConditions,
} = require("../services/product-details/parseProductDetails");
const { buildPrefillPanel } = require("../utils/prefillPanel/prefillBuild");

/**
 * Parses product details from a vectorized PDF file, extracting information such as
 * low strike status, maturity, frequency, denomination, coupon level, underlyings, and initial fixings.
 *
 * @param {Object} req - The request object containing the fileId, issuerId, and categoryId.
 * @param {Object} res - The response object used to send the result or errors back to the client.
 *
 * @returns {void}
 *
 * @throws Will throw an error if no fileId is provided, if the vector store is not found,
 * or if there is an issue with the RAG chain.
 */
exports.parseProductDetailsTermsheet = async (req, res) => {
	try {
		const { fileId, issuerId, categoryId } = req.body;

		if (!fileId) {
			return res.status(400).json({ message: "No fileId provided" });
		}

		const vectorStore = getVectorStore(fileId);

		if (!vectorStore) {
			return res.status(404).json({ message: "Vector store not found for the given fileId" });
		}

		const runnableRagChain = await createRagChain(vectorStore);

		const queries = queryMap[issuerId][categoryId];

		const results = await Promise.all(
			Object.values(queries).map((query) => runnableRagChain.invoke(query))
		);

		// Map the results to their corresponding query names
		const ragResults = Object.keys(queries).reduce((acc, key, index) => {
			acc[key] = results[index];
			return acc;
		}, {});

		// Send the extracted data back to the client as a successful JSON response.
		res.json({
			success: true,
			data: ragResults,
		});
	} catch (error) {
		// Log the error details in the server console.
		console.error(error);

		// Send a 500 Internal Server Error response with an appropriate error message.
		res.status(500).json({ message: "Error processing request" });
	}
};
