const fs = require("fs");
const path = require("path");
const { createFile, vectoriseFile } = require("../services/openaiVectoriseFile");

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
			const vectoriseResult = await vectoriseFile(fileId);
			console.log("Vectorise result:", JSON.stringify(vectoriseResult, null, 2));

			// Return the vectorise result so you can see what it contains
			res.status(200).json({
				success: true,
				message: "PDF uploaded and vectorised successfully",
				data: {
					fileName,
					originalName,
					filePath,
					fileSize: req.file.size,
					uploadTime: new Date().toISOString(),
					fileId,
					vectoriseResult,
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
