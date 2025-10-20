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
					vectorStoreId: vectorStoreId,
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
