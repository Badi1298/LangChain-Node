const fs = require("fs");
const path = require("path");
const { createFile, vectoriseFile } = require("../services/openaiVectoriseFile");
const openaiInstance = require("../services/openaiClient");

/**
 * Controller for handling PDF file uploads and parsing
 */
const parsePdfController = {
	/**
	 * Parse uploaded PDF file
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	parseUploadedPdf: async (req, res) => {
		try {
			// Check if file was uploaded
			if (!req.file) {
				return res.status(400).json({
					success: false,
					error: "No file uploaded. Please provide a PDF file.",
				});
			}

			// Check if uploaded file is a PDF
			if (req.file.mimetype !== "application/pdf") {
				// Clean up the uploaded file if it's not a PDF
				fs.unlinkSync(req.file.path);
				return res.status(400).json({
					success: false,
					error: "Invalid file type. Please upload a PDF file.",
				});
			}

			const filePath = req.file.path;
			const fileName = req.file.filename;
			const originalName = req.file.originalname;

			// Create file in OpenAI and vectorise it
			console.log("Creating file in OpenAI...");
			const fileId = await createFile(filePath);
			console.log("File created with ID:", fileId);

			console.log("Vectorising file...");
			const vectorStoreId = await vectoriseFile(fileId);

			const response = await openaiInstance.responses.create({
				model: "gpt-5-mini",
				input: `
				Can you complete the required information below, and keep the exact formatting (just replace the "xxx", and don't re-write the instruction between brackets for every field).

				Only take the information from the PDF document (don't guess, and don't take information from anywhere else, even if the information seems wrong to you).

				All date formats must be dd.mm.yyyy, like 28.10.2015

				

				ISIN: xxx

				Does the product quote in "Notional" or "Units": xxx

				Issuer: xxx

				Guarantor: xxx

				Currency: xxx

				Initial Fixing Date (Also called "Trade Date" or "Strike Date", it's the date when the fixing of the underlyings occurred): xxx

				Valuation Date (also called "issue date", it's when the settlement occurs, generally 1 or 2 weeks after Initial Fixing Date): xxx

				Final Fixing Date (also called "valuation date", it's the date when we observe the final levels of the underlyings on the closing): xxx

				Maturity Date (also called "redemption date", it's when the settlement occurs to end the product, so it's 1 or 2 weeks after the Final Fixing Date generally): xxx

				Maturity in Months (round to closest integer. Maturity is the difference between the Initial Fixing Date and Final Fixing Date. Only an integer number e.g. 12, 18, ...): xxx

				Observations Frequency (monthly, quarterly, semi-annually, annually or other): xxx

				Coupon Barrier (in %): xxx

				Coupon Level (per period): xxx

				Coupon Level (per annum): xxx

				Memory Effect on the Coupon (i.e. will all the possibly missed coupons be paid when a coupon is paid? Yes or No): xxx

				Non-Call period (number of observed periods where the product can NOT be ealry redeemed, we just observe the coupon. Integer number, 1, 2, 3, etc.): xxx

				Autocall Trigger ("Fix" or "Stepdown". Autocall Trigger is the level above which all underlyings must close on an observation date for the product to be early redeemed. Fix means it's always the same level. Stepdown is when the level decreases on each observation): xxx

				Capital Protection Level (in %. If at least one stock decreases below this level then the capital is impacted): xxx

				Protection Type (it's "Low Strike", "European Barrier", "American Barrier" or "Daily close barrier". Low Strike is when the loss begins from another level than the Initial Fixing Level of the worst performing underlying. European Barrier is when the loss starts from the Initial Fixing Level, with a barrier observation at Maturity. American barrier is when the barrier observation is continuous during the product lifetime. Daily close is as american barrier but we don't observe all trading levels, only the closing levels, during the product lifetime. We can have both one of the 3 barriers AND a low strike, meaning the observation on the underlying level is from a certain level (the barrier) and the loss starts from a lower level than the Initial Fixing, in this case the Protection Type is NOT low strike, it's one of the 3 barriers): xxx

				Do we have both a Low Strike and a Barrier ? (yes/no): xxx

				If we have both a Low Strike and a Barrier, what is the Low Strike Level (in %): xxx

				Redemption Type (Cash/Physical. If you see “Cash and Physical” or similar wording, then it’s Physical. Physical is when the investor receives shares of the worst performing underlying at maturity in the negative scenario): xxx

				List of all Underlyings (it's possible that there's only 1. Put only Ticker + Initial Fixing. For instance: AAPL US ; 304.24)

				Asset Class (Equity, Index, Credit, Commodities, FX, Rates or Mixed. Not that if you think the underlying is and index or ETF containing stocks and you have other underlyings being stocks, you can put "Equity". Else it's Mixed.): xxx

				Valoren/Common code: xxx

				Denomination (integer, number): xxx

				Issue Price (number, can be % if it quote si Notional or not if it's in Units): xxx

				Minimum Trading Size: xxx

				Please create a table represented as a JSON object with all intermediary observation dates, with 4 columns (Observation Date, Payment Date, Autocall Trigger level for said observation date in format "100%" "85%" etc not "0%" "-15", "Coupon" or "Autocall+Coupon" if on the said observation date we observe only the coupon or also the early redemption)
				
				`,
				tools: [
					{
						type: "file_search",
						vector_store_ids: [vectorStoreId],
					},
				],
			});

			res.status(200).json({
				success: true,
				message: "PDF file processed and vectorised successfully",
				data: {
					fileName: originalName,
					filePath: filePath,
					fileId: fileId,
					vectorStoreId: vectorStoreId,
					output_text: response.output_text,
				},
			});
		} catch (error) {
			console.error("Error processing PDF:", error);

			// Clean up uploaded file in case of error
			if (req.file && req.file.path) {
				try {
					fs.unlinkSync(req.file.path);
				} catch (cleanupError) {
					console.error("Error cleaning up file:", cleanupError);
				}
			}

			res.status(500).json({
				success: false,
				error: "Internal server error while processing PDF",
			});
		}
	},
};

module.exports = parsePdfController;
