require("dotenv").config();

const { MemoryVectorStore } = require("@langchain/classic/vectorstores/memory");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");

const { z } = require("zod");
const { createAgent } = require("langchain");
const { tool } = require("@langchain/core/tools");
const { SystemMessage, HumanMessage } = require("@langchain/core/messages");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");

const retrieveSchema = z.object({ query: z.string() });
const responseSchema = z.object({ protection_type: z.string() });

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
	const model = new ChatOpenAI({
		model: "gpt-5-mini",
		apiKey: process.env.OPENAI_API_KEY,
	});

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
	const systemPrompt =
		"You have access to a tool that retrieves context from a financial Termsheet. " +
		"Use the tool to help answer user queries.";

	const prompt = ChatPromptTemplate.fromMessages([
		["system", systemPrompt],
		new MessagesPlaceholder("messages"),
	]);

	const agent = createAgent({
		model,
		tools,
		prompt,
		responseFormat: responseSchema,
	});

	return agent;
};

module.exports = { initializeVectorStore, createRagChain };
