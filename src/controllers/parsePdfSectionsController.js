const fs = require("fs");
const openaiInstance = require("../services/openaiClient");
const { createFile, vectoriseFile } = require("../services/openaiVectoriseFile");

const { SizeTypes } = require("../config/constants");

const parsePdfSectionsController = {
	vectorialisePdf: async (req, res) => {
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

			const overallEndTime = performance.now();
			console.log(`Total time taken: ${overallEndTime - startTime}ms`);

			res.status(200).json({
				success: true,
				message: "PDF file processed and vectorised successfully",
				data: {
					fileName: originalName,
					filePath: filePath,
					fileId: fileId,
					vectorStoreId,
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

	getInformation: async (req, res) => {
		try {
			const { vectorStoreId } = req.body;
			if (!vectorStoreId) {
				return res.status(400).json({
					success: false,
					error: "vectorStoreId is required.",
				});
			}

			const response = await openaiInstance.responses.create({
				model: "gpt-5-mini",
				input: `
          Your entire response must be a single, valid JSON object. Do not add any explanatory text, notes, or markdown formatting before or after the JSON.
          Use the following definitions to find and extract the required information from the provided PDF document. Do not guess or use external information.
          If a piece of information cannot be found in the document, use null as the value in the final JSON.

          Field Definitions:
          ISIN: null
          Does the product quote in "Notional" or "Units": null
          Issuer: null
          Currency: null

          Now, using the information you've extracted based on the definitions above, complete the following JSON structure.
          {
            "isin": null,
            "quoteType": null,
            "issuer": null,
            "currency": null
          }
        `,
				tools: [
					{
						type: "file_search",
						vector_store_ids: [vectorStoreId],
					},
				],
			});

			const responseData = JSON.parse(response.output_text);

			// Map the response data to the expected format
			const mappedResponseData = {
				isin: responseData.isin || null,
				quoteType: SizeTypes[responseData?.quoteType?.toUpperCase()] || null,
				issuer: responseData.issuer || null,
				currency: responseData.currency || null,
			};

			res.status(200).json({
				success: true,
				message: "Section 1 processed successfully.",
				data: mappedResponseData,
			});
		} catch (error) {
			console.error("Error processing Section 1:", error);
			res.status(500).json({
				success: false,
				error: "Internal server error while processing Section 1.",
			});
		}
	},

	getDetails: async (req, res) => {
		try {
			const { vectorStoreId } = req.body;
			if (!vectorStoreId) {
				return res.status(400).json({
					success: false,
					error: "vectorStoreId is required.",
				});
			}

			const response = await openaiInstance.responses.create({
				model: "gpt-5-mini",
				input: `
          Your entire response must be a single, valid JSON object. Do not add any explanatory text, notes, or markdown formatting before or after the JSON.
          Use the following definitions to find and extract the required information from the provided PDF document. Do not guess or use external information.
          All date formats must be dd.mm.yyyy, like 28.10.2015
          If a piece of information cannot be found in the document, use null as the value in the final JSON.

          Field Definitions:
          Initial Fixing Date (Also called "Trade Date" or "Strike Date", it's the date when the fixing of the underlyings occurred): null
          Valuation Date (also called "issue date", it's when the settlement occurs, generally 1 or 2 weeks after Initial Fixing Date): null
          Final Fixing Date (also called "valuation date", it's the date when we observe the final levels of the underlyings on the closing): null
          Maturity Date (also called "redemption date", it's when the settlement occurs to end the product, so it's 1 or 2 weeks after the Final Fixing Date generally): null
          Maturity in Months (round to closest integer. Maturity is the difference between the Initial Fixing Date and Final Fixing Date. Only an integer number e.g. 12, 18, ...): null
          Observations Frequency (monthly, quarterly, semi_annually, annually or other): null
          Coupon Barrier (as a number, e.g., for 70%, use 70): null
          Coupon Level (per period, as a number): null
          Memory Effect on the Coupon (i.e. will all the possibly missed coupons be paid when a coupon is paid? true or false): null
          Non-Call period (number of observed periods where the product can NOT be ealry redeemed, we just observe the coupon. Integer number, 1, 2, 3, etc.): null
          Autocall Trigger ("Fix" or "Stepdown". Autocall Trigger is the level above which all underlyings must close on an observation date for the product to be early redeemed. Fix means it's always the same level. Stepdown is when the level decreases on each observation): null
          Capital Protection Level (as a number. If at least one stock decreases below this level then the capital is impacted): null
          Protection Type (it's "Low Strike", "European Barrier", "American Barrier" or "Daily Close Barrier". Low Strike is when the loss begins from another level than the Initial Fixing Level of the worst performing underlying. European Barrier is when the loss starts from the Initial Fixing Level, with a barrier observation at Maturity. American barrier is when the barrier observation is continuous during the product lifetime. Daily close is as american barrier but we don't observe all trading levels, only the closing levels, during the product lifetime. We can have both one of the 3 barriers AND a low strike, meaning the observation on the underlying level is from a certain level (the barrier) and the loss starts from a lower level than the Initial Fixing, in this case the Protection Type is NOT low strike, it's one of the 3 barriers): null
          Do we have both a Low Strike and a Barrier ? (true / false): null
          If we have both a Low Strike and a Barrier, what is the Low Strike Level (as a number): null
          Redemption Type (Cash/Physical. If you see “Cash and Physical” or similar wording, then it's Physical. Physical is when the investor receives shares of the worst performing underlying at maturity in the negative scenario): null
          Asset Class (Equity, Index, Credit, Commodities, FX, Rates or Mixed. Not that if you think the underlying is and index or ETF containing stocks and you have other underlyings being stocks, you can put "Equity". Else it's Mixed.): null
          Valoren/Common code (string): null
          Denomination (integer, number): null
          Issue Price (number, can be % if it quote si Notional or not if it's in Units): null
          Minimum Trading Size (if no information about minumum trading size, then use denomination for this value as well): null

          Now, using the information you've extracted based on the definitions above, complete the following JSON structure.
          {
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
          }
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
				message: "Section 2 processed successfully.",
				data: response.output_text,
			});
		} catch (error) {
			console.error("Error processing Section 2:", error);
			res.status(500).json({
				success: false,
				error: "Internal server error while processing Section 2.",
			});
		}
	},

	getUnderlyings: async (req, res) => {
		try {
			const { vectorStoreId } = req.body;
			if (!vectorStoreId) {
				return res.status(400).json({
					success: false,
					error: "vectorStoreId is required.",
				});
			}

			const response = await openaiInstance.responses.create({
				model: "gpt-5",
				input: `
          Your entire response must be a single, valid JSON object. Do not add any explanatory text, notes, or markdown formatting before or after the JSON.
          Use the following definitions to find and extract the required information from the provided PDF document. Do not guess or use external information.
          If a piece of information cannot be found in the document, use null as the value in the final JSON.

          Field Definitions:
          List of all Underlyings (it's possible that there's only 1. Put only Ticker + Initial Fixing. For instance: AAPL US ; 304.24. Please make sure to always return the full ticker - example: "AAPL US", "NVDA UW" - not just "AAPL", "NVDA"). If an Underlying has an initial fixing in GBP or GBp, you need to consider the initial fixing in GBp (so in pence). Example: if Rolls Royce has a fixing of 11.68 GBP, you must consider the initial fixing to be 1168 (because 1 GBP = 100 GBp)

          Now, using the information you've extracted based on the definitions above, complete the following JSON structure.
          {
            "underlyings": [
              {
                "ticker": null,
                "initialFixing": null
              }
            ]
          }
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
				message: "Section 3 processed successfully.",
				data: response.output_text,
			});
		} catch (error) {
			console.error("Error processing Section 3:", error);
			res.status(500).json({
				success: false,
				error: "Internal server error while processing Section 3.",
			});
		}
	},

	getEvents: async (req, res) => {
		try {
			const { vectorStoreId } = req.body;
			if (!vectorStoreId) {
				return res.status(400).json({
					success: false,
					error: "vectorStoreId is required.",
				});
			}

			const response = await openaiInstance.responses.create({
				model: "gpt-5",
				input: `
          Your entire response must be a single, valid JSON object. Do not add any explanatory text, notes, or markdown formatting before or after the JSON.
          Use the following definitions to find and extract the required information from the provided PDF document. Do not guess or use external information.
          All date formats must be dd.mm.yyyy, like 28.10.2015
          If a piece of information cannot be found in the document, use null as the value in the final JSON.

          Field Definitions:
          Please create a table with all intermediary observation dates, with 4 columns 
          (Observation Date, Payment Date, Autocall Trigger level for said observation date 
          in number format 100, 85, etc., not 0, -15, "Coupon" or "Autocall+Coupon" if on the said 
          observation date we observe only the coupon or also the early redemption). 
          The very last event you'll create is the Maturity. For this one you must force an 
          Autocall Trigger Level, which level is equal to : i) if Autocall Trigger is Fix, 
          then the Autocall Trigger Level ii) if Stepdown, then the last level is either 
          explicitely put in the termsheet for this date, else, a) if the stepdown is a 
          sequence from observation to observation (e.g. all autocall triggers are 5% lower)
          please continue the sequence for this last Autocall Trigger while talking into 
          account a floor level equal to the Capital Protection Level (the lowest between 
          the Barrier or the Low Strike, if any), else b) if it's not a sequence, then put 
          the level of the last Autocall Trigger

          Now, using the information you've extracted based on the definitions above, complete the following JSON structure.
          {
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
				tools: [
					{
						type: "file_search",
						vector_store_ids: [vectorStoreId],
					},
				],
			});

			res.status(200).json({
				success: true,
				message: "Section 4 processed successfully.",
				data: response.output_text,
			});
		} catch (error) {
			console.error("Error processing Section 4:", error);
			res.status(500).json({
				success: false,
				error: "Internal server error while processing Section 4.",
			});
		}
	},
};

module.exports = parsePdfSectionsController;
