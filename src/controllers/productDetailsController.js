const path = require("path");
const fs = require("fs").promises; // Using fs promises to delete files asynchronously

const { initializeRagChain } = require("../services/initializeRagChain");

const queryMap = require("../utils/queries/productDetailsQueries");
const {
	isActiveFlag,
	parseUnderlyings,
	parseInitialFixings,
	checkBarrierConditions,
} = require("../services/product-details/parseProductDetails");
const { buildPrefillPanel } = require("../utils/prefillPanel/prefillBuild");

/**
 * Parses product details from an uploaded PDF file, extracting information such as
 * low strike status, maturity, frequency, denomination, coupon level, underlyings, and initial fixings.
 *
 * @param {Object} req - The request object containing the uploaded file.
 * @param {Object} res - The response object used to send the result or errors back to the client.
 *
 * @returns {void}
 *
 * @throws Will throw an error if no file is uploaded, if invalid data is returned, or if there is an issue with PDF processing or file deletion.
 */
exports.parseProductDetailsTermsheet = async (req, res) => {
	try {
		// Check if a file has been uploaded with the request.
		if (!req.file) {
			// Return a 400 Bad Request response if no file is found.
			return res.status(400).json({ message: "No file uploaded" });
		}

		const { issuerId, categoryId } = req.body;

		// Get the full file path of the uploaded PDF.
		const pdfPath = path.join(process.cwd(), req.file.path);

		// Initialize the Retrieval-Augmented Generation (RAG) chain to process the PDF.
		const runnableRagChain = await initializeRagChain(pdfPath, true);

		const queries = queryMap[issuerId][categoryId]; // Get the queries for issuer 9 and product type 9

		const results = await Promise.all(
			Object.values(queries).map((query) => runnableRagChain.invoke(query))
		);

		// Map the results to their corresponding query names
		const ragResults = Object.keys(queries).reduce((acc, key, index) => {
			acc[key] = results[index];
			return acc;
		}, {});

		console.log(ragResults);

		const flags = {
			isLowStrike: isActiveFlag(ragResults.isLowStrike),
		};

		const underlyingsData = {
			underlyings: parseUnderlyings(ragResults.underlyings),
			initialFixings: parseInitialFixings(ragResults.initialFixings),
		};

		const prefillPanel = buildPrefillPanel(categoryId, ragResults);

		const events = {
			type: ragResults.eventsType,
			events: ragResults.events,
		};

		// Perform additional checks on barrier conditions related to the product.
		await checkBarrierConditions(flags, runnableRagChain);

		// Send the extracted data back to the client as a successful JSON response.
		res.json({
			flags,
			prefillPanel,
			underlyings: underlyingsData,
			valoren: ragResults.valoren,
		});
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
