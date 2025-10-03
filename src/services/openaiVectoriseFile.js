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
		name: "knowledge_base",
	});

	await openai.vectorStores.files.create(vectorStore.id, {
		file_id: fileId,
	});

	const result = await openai.vectorStores.files.list({
		vector_store_id: vectorStore.id,
	});

	return result;
}

module.exports = { createFile, vectoriseFile };
