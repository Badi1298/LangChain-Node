const fs = require("fs");

const openaiInstance = require("./openaiClient");

async function createFile(filePath) {
	let result;
	if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
		// Download the file content from the URL
		const res = await fetch(filePath);
		const buffer = await res.arrayBuffer();
		const urlParts = filePath.split("/");
		const fileName = urlParts[urlParts.length - 1];
		const file = new File([buffer], fileName);
		result = await openaiInstance.files.create({
			file: file,
			purpose: "assistants",
		});
	} else {
		// Handle local file path
		const fileContent = fs.createReadStream(filePath);
		result = await openaiInstance.files.create({
			file: fileContent,
			purpose: "assistants",
		});
	}
	return result.id;
}

async function vectoriseFile(fileId) {
	const vectorStore = await openaiInstance.vectorStores.create({
		name: "precomplete",
	});

	// Ensure we have a valid ID before proceeding
	if (!vectorStore.id || typeof vectorStore.id !== "string") {
		throw new Error("Invalid vector store ID received from OpenAI");
	}

	await openaiInstance.vectorStores.files.create(vectorStore.id, {
		file_id: fileId,
	});

	await openaiInstance.vectorStores.files.list(vectorStore.id);

	return vectorStore.id;
}

module.exports = { createFile, vectoriseFile };
