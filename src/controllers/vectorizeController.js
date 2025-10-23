const crypto = require("crypto");
const fs = require("fs").promises;
const { initializeVectorStore } = require("../services/initializeRagChain");

const vectorStoreCache = new Map();

const vectorizePdf = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No PDF file uploaded." });
		}

		const pdfBuffer = await fs.readFile(req.file.path);
		const hash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

		if (vectorStoreCache.has(hash)) {
			console.log(`Vector store for hash ${hash} already exists.`);
			return res.status(200).json({
				message: "Vector store already exists.",
				fileId: hash,
			});
		}

		const vectorStore = await initializeVectorStore(req.file.path);
		vectorStoreCache.set(hash, vectorStore);

		console.log(`Vector store created and cached for hash ${hash}.`);

		res.status(200).json({
			message: "PDF vectorized and cached successfully.",
			fileId: hash,
		});
	} catch (error) {
		console.error("Error vectorizing PDF:", error);
		res.status(500).json({
			error: "An error occurred while vectorizing the PDF.",
			details: error.message,
		});
	}
};

const getVectorStore = (fileId) => {
	return vectorStoreCache.get(fileId);
};

module.exports = { vectorizePdf, getVectorStore };
