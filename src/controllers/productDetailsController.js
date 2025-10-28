const { z } = require("zod");

const { createRagChain } = require("../services/initializeRagChain");
const { getVectorStore } = require("./vectorizeController");

const queryMap = require("../utils/queries/productDetailsQueries");
const underlyingsQueryMap = require("../utils/queries/productUnderlyingsQueries");

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
		const { fileId } = req.body;

		if (!fileId) {
			return res.status(400).json({ message: "No fileId provided" });
		}

		const vectorStore = getVectorStore(fileId);

		if (!vectorStore) {
			return res.status(404).json({ message: "Vector store not found for the given fileId" });
		}

		const responseSchema = z.object({ protection_type: z.string() });

		const agent = await createRagChain(vectorStore, responseSchema);

		const inputMessage = `
		Field definition to generate the query for the tool:
		Protection Type - it's 'Low Strike', 'European Barrier', 
		'American Barrier' or 'Daily Close Barrier'. Low Strike is when the loss begins from 
		another level than the Initial Fixing Level of the worst performing underlying. European 
		Barrier is when the loss starts from the Initial Fixing Level, with a barrier observation 
		at Maturity. American barrier is when the barrier observation is continuous during the 
		product lifetime. Daily close is as american barrier but we don't observe all trading 
		levels, only the closing levels, during the product lifetime. We can have both one of the 
		3 barriers AND a low strike, meaning the observation on the underlying level is from a 
		certain level (the barrier) and the loss starts from a lower level than the Initial Fixing, 
		in this case the Protection Type is NOT low strike, it's one of the 3 barriers
		
		Using the above field definition, please identify and return the 'protection_type' only.

		Make sure your final answer contains ONLY the protection_type value, without any explanations 
		or additional information.`;

		let agentInputs = { messages: [{ role: "user", content: inputMessage }] };

		const result = await agent.invoke(agentInputs);

		res.json({
			success: true,
			messages: result.messages,
			data: result.structuredResponse,
		});
	} catch (error) {
		// Log the error details in the server console.
		console.error(error);

		// Send a 500 Internal Server Error response with an appropriate error message.
		res.status(500).json({ message: "Error processing request" });
	}
};

exports.parseProductUnderlyings = async (req, res) => {
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

		const queries = underlyingsQueryMap[issuerId][categoryId];

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
