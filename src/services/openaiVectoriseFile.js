const fs = require("fs");
const { OpenAI } = require("openai");

const openai = new OpenAI();

async function createFile(filePath) {
	let result;
	if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
		// Download the file content from the URL
		const res = await fetch(filePath);
		const buffer = await res.arrayBuffer();
		const urlParts = filePath.split("/");
		const fileName = urlParts[urlParts.length - 1];
		const file = new File([buffer], fileName);
		result = await openai.files.create({
			file: file,
			purpose: "assistants",
		});
	} else {
		// Handle local file path
		const fileContent = fs.createReadStream(filePath);
		result = await openai.files.create({
			file: fileContent,
			purpose: "assistants",
		});
	}
	return result.id;
}

async function vectoriseFile(fileId) {
	const vectorStore = await openai.vectorStores.create({
		name: "precomplete",
	});

	// Debug the full vectorStore object structure
	console.log("Full vectorStore object:", JSON.stringify(vectorStore, null, 2));
	console.log("vectorStore.id:", vectorStore.id);
	console.log("Type of vectorStore.id:", typeof vectorStore.id);

	// Ensure we have a valid ID before proceeding
	if (!vectorStore.id || typeof vectorStore.id !== "string") {
		throw new Error("Invalid vector store ID received from OpenAI");
	}

	console.log("Adding file to vector store with ID:", vectorStore.id);
	await openai.vectorStores.files.create(vectorStore.id, {
		file_id: fileId,
	});

	console.log("Listing files in vector store with ID:", vectorStore.id);

	const result = await openai.vectorStores.files.list(vectorStore.id);

	console.log("Files in vector store with ID:", vectorStore.id);

	return result;
}

module.exports = { createFile, vectoriseFile };
