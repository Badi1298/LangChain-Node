require("dotenv").config();

const { MemoryVectorStore } = require("@langchain/classic/vectorstores/memory");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");

const { initChatModel } = require("langchain");
const { z } = require("zod");
const { tool } = require("@langchain/core/tools");

const retrieveSchema = z.object({ query: z.string() });

const initializeVectorStore = async (pdfPath) => {
	const embeddings = new OpenAIEmbeddings({
		model: "text-embedding-3-large",
	});

	const vectorStore = new MemoryVectorStore(embeddings);

	const loader = new PDFLoader(pdfPath);

	// Load and parse the PDF using PDFLoader
	const loadedDocs = await loader.load();

	// Split the parsed PDF text into smaller chunks for processing
	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 1000,
		chunkOverlap: 200,
	});
	const allSplits = await splitter.splitDocuments(loadedDocs);

	// Create an in-memory vector store from the document chunks using embeddings
	await vectorStore.addDocuments(allSplits);

	return vectorStore;
};

const createRagChain = async (vectorStore) => {
	const retrieve = tool(
		async ({ query }) => {
			const retrievedDocs = await vectorStore.similaritySearch(query, 2);
			const serialized = retrievedDocs
				.map((doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
				.join("\n");
			return [serialized, retrievedDocs];
		},
		{
			name: "retrieve",
			description: "Retrieve information related to a query.",
			schema: retrieveSchema,
			responseFormat: "content_and_artifact",
		}
	);

	// Set up a retriever to perform similarity-based search in the vector store
	const tools = [retrieve];
	const systemPrompt = new SystemMessage(
		"You have access to a tool that retrieves context from a blog post. " +
			"Use the tool to help answer user queries."
	);

	const agent = createAgent({ model: "openai:gpt-5", tools, systemPrompt });

	return agent;
};

module.exports = { initializeVectorStore, createRagChain };
