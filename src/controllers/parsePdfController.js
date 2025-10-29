const fs = require("fs");
const pdf = require("pdf-parse");
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

			const dataBuffer = fs.readFileSync(req.file.path);

			const pdfData = await pdf(dataBuffer);
			const pdfText = pdfData.text;

			// Log token count estimation (approximate)
			const tokenCount = Math.ceil(pdfText.length / 4); // Rough approximation: 1 token ≈ 4 characters
			console.log(`PDF text length: ${pdfText.length} characters`);
			console.log(`Estimated token count: ${tokenCount} tokens`);
			console.log(
				`Estimated cost (GPT-5): $${(tokenCount * 0.000002).toFixed(
					6
				)} input + output tokens`
			);

			const response = await openaiInstance.responses.create({
				model: "gpt-4.1",
				// text: { verbosity: "low" },
				input: `
				You are an expert financial analyst. 
				Your task is to extract information from the provided document text and return *only* a single, valid JSON object (no '''json flags are needed). 
				Do not add any explanatory text. Use null if a value cannot be found. 
				All dates must be in dd.mm.yyyy format.
				Here is the document text:

				TERMSHEET CONTENT START
				${pdfText}
				TERMSHEET CONTENT END

				Now, using only the text above, complete the following JSON structure.
					
				Field Definitions:

				- ISIN
				- Does the product quote in "Notional" or "Units"
				- Issuer
				- Currency
				- Initial Fixing Date (Also called "Trade Date" or "Strike Date", it's the date when the fixing of the underlyings occurred)
				- Valuation Date (also called "issue date", it's when the settlement occurs, generally 1 or 2 weeks after Initial Fixing Date)
				- Final Fixing Date (also called "valuation date", it's the date when we observe the final levels of the underlyings on the closing)
				- Maturity Date (also called "redemption date", it's when the settlement occurs to end the product, so it's 1 or 2 weeks after the Final Fixing Date generally)
				- Maturity in Months (round to closest integer. Maturity is the difference between the Initial Fixing Date and Final Fixing Date. Only an integer number e.g. 12, 18, ...)
				- Observations Frequency (monthly, quarterly, semi_annually, annually or other)
				- Coupon Barrier (as a number, e.g., for 70%, use 70)
				- Coupon Level (per period, as a number)
				- Memory Effect on the Coupon (i.e. will all the possibly missed coupons be paid when a coupon is paid? true or false)
				- Non-Call period (number of observed periods where the product can NOT be early redeemed, we just observe the coupon. Integer number, 1, 2, 3, etc. This value represents how many observation or coupon periods must pass before the product becomes eligible for early redemption or “autocall.” It can be determined by comparing the schedule of Autocall Valuation Dates and Interest Valuation Dates: the Non-Call period ends when the first Autocall Valuation Date appears. For example, if the first Autocall Valuation Date occurs on the second coupon date, the Non-Call period equals 1; if it occurs on the third coupon date, the Non-Call period equals 2, and so on. In other words, count the number of coupon observation periods before the first possible early redemption observation date. Do not confuse this with the number of years or the Autocall Barrier level itself.)
				- Autocall Trigger ("Fix" or "Stepdown". Autocall Trigger is the level above which all underlyings must close on an observation date for the product to be early redeemed. Fix means it's always the same level. Stepdown is when the level decreases on each observation)
				- Capital Protection Level (as a number. If at least one stock decreases below this level then the capital is impacted)
				- Protection Type (it's "Low Strike", "European Barrier", "American Barrier" or "Daily Close Barrier". Low Strike is when the loss begins from another level than the Initial Fixing Level of the worst performing underlying. European Barrier is when the loss starts from the Initial Fixing Level, with a barrier observation at Maturity. American barrier is when the barrier observation is continuous during the product lifetime. Daily close is as american barrier but we don't observe all trading levels, only the closing levels, during the product lifetime. We can have both one of the 3 barriers AND a low strike, meaning the observation on the underlying level is from a certain level (the barrier) and the loss starts from a lower level than the Initial Fixing, in this case the Protection Type is NOT low strike, it's one of the 3 barriers)
				- Do we have both a Low Strike and a Barrier? (true / false)
				- If we have both a Low Strike and a Barrier, what is the Low Strike Level (as a number)
				- Redemption Type (Cash/Physical. If you see “Cash and Physical” or similar wording, then it's Physical. Physical is when the investor receives shares of the worst performing underlying at maturity in the negative scenario)
				- Asset Class (Equity, Index, Credit, Commodities, FX, Rates or Mixed. Not that if you think the underlying is and index or ETF containing stocks and you have other underlyings being stocks, you can put "Equity". Else it's Mixed.)
				- Valoren or Common Code (if "Valoren" string exists then use the value from that) (string)
				- Denomination (integer, number)
				- Issue Price (number, can be % if it quote si Notional or not if it's in Units)
				- Minimum Trading Size (if no information about minumum trading size, then use denomination for this value as well)
				- List of all Underlyings (it's possible that there's only 1. Put only Ticker + Initial Fixing. For instance: AAPL US ; 304.24. Please make sure to always return the full ticker - example: "AAPL US", "NVDA UW" - not just "AAPL", "NVDA"). If an Underlying has an initial fixing in GBP or GBp, you need to consider the initial fixing in GBp (so in pence). Example: if Rolls Royce has a fixing of 11.68 GBP, you must consider the initial fixing to be 1168 (because 1 GBP = 100 GBp)
				- Events have 3 distinct fields - Observation Date, Payment Date, Autocall Trigger Level for said observation date 
				in number format 100, 85, etc., not 0, -15. The very last event you'll create is 
				the Maturity. For this one you must force an Autocall Trigger Level, which level is equal to : i) if Autocall Trigger is Fix, 
				then the Autocall Trigger Level ii) if Stepdown, then the last level is either 
				explicitely put in the termsheet for this date, else, a) if the stepdown is a 
				sequence from observation to observation (e.g. all autocall triggers are 5% lower)
				please continue the sequence for this last Autocall Trigger while talking into 
				account a floor level equal to the Capital Protection Level (the lowest between 
				the Barrier or the Low Strike, if any), else b) if it's not a sequence, then put 
				the level of the last Autocall Trigger

				JSON Structure to complete:
				{
					"isin": null,
					"quoteType": null,
					"issuer": null,
					"currency": null,
					"initialFixingDate": null,
					"valuationDate": null,
					"finalFixingDate": null,
					"maturityDate": null,
					"maturityInMonths": null,
					"observationsFrequency": null,
					"couponBarrierPercentage": null,
					"couponLevelPerPeriod": null,
					"hasMemoryEffect": null,
					"nonCallPeriods": null,
					"autocallTriggerType": null,
					"capitalProtectionPercentage": null,
					"protectionType": null,
					"hasLowStrikeAndBarrier": null,
					"lowStrikeLevelPercentage": null,
					"redemptionType": null,
					"assetClass": null,
					"valoren": null,
					"denomination": null,
					"issuePrice": null,
					"minimumTradingSize": null
					"underlyings": [
						{
							"ticker": null,
							"initialFixing": null
						}
					]
					"observationSchedule": [
						{
							"observationDate": null,
							"paymentDate": null,
							"autocallTriggerLevel": null,
							"observationType": null
						}
					]
				}
			`,
			});

			res.status(200).json({
				success: true,
				message: "Details processed successfully.",
				data: response.output_text,
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

	/**
	 * Parse uploaded PDF file with custom model and prompt
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	parseUploadedPdfWithCustomPrompt: async (req, res) => {
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

			const { model, prompt } = req.body;

			if (!model || !prompt) {
				fs.unlinkSync(req.file.path);
				return res.status(400).json({
					success: false,
					error: "Model and prompt are required in the request body.",
				});
			}

			const filePath = req.file.path;
			const originalName = req.file.originalname;

			// Create file in OpenAI and vectorise it
			console.log("Creating file in OpenAI...");
			let startTime = performance.now();
			const fileId = await createFile(filePath);
			let endTime = performance.now();
			console.log(`File created with ID: ${fileId}. Time taken: ${endTime - startTime}ms`);

			console.log("Vectorising file...");
			startTime = performance.now();
			const vectorStoreId = await vectoriseFile(fileId);
			endTime = performance.now();
			console.log(
				`File vectorised. Vector store ID: ${vectorStoreId}. Time taken: ${
					endTime - startTime
				}ms`
			);

			console.log("Getting response from OpenAI...");
			startTime = performance.now();

			const response = await openaiInstance.responses.create({
				model: model,
				input: prompt,
				tools: [
					{
						type: "file_search",
						vector_store_ids: [vectorStoreId],
					},
				],
			});
			endTime = performance.now();
			console.log(`Got response from OpenAI. Time taken: ${endTime - startTime}ms`);

			const overallEndTime = performance.now();
			console.log(`Total time taken: ${overallEndTime - startTime}ms`);

			res.status(200).json({
				success: true,
				message: "PDF file processed and vectorised successfully with custom prompt",
				data: {
					fileName: originalName,
					filePath: filePath,
					fileId: fileId,
					vectorStoreId: vectorStoreId,
					output_text: response.output_text,
				},
			});
		} catch (error) {
			console.error("Error processing PDF with custom prompt:", error);

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
				error: "Internal server error while processing PDF with custom prompt",
			});
		}
	},
};

module.exports = parsePdfController;
