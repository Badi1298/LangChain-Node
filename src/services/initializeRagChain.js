require("dotenv").config();

const { spawn } = require("child_process");
const path = require("path");

const { PromptTemplate } = require("@langchain/core/prompts");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");

const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnablePassthrough, RunnableSequence } = require("@langchain/core/runnables");
const { formatDocumentsAsString } = require("langchain/util/document");

function extractTablesFromPDF(pdfPath) {
	return new Promise((resolve, reject) => {
		// Spawn a child process to run the Python script
		const pythonProcess = spawn("python3", [
			path.join(__dirname, "../../scripts/extract_tables.py"),
			pdfPath,
		]);

		// Collect data from Python script
		let result = "";
		pythonProcess.stdout.on("data", (data) => {
			result += data.toString();
		});

		// Handle errors
		pythonProcess.stderr.on("data", (data) => {
			reject(`Error: ${data}`);
		});

		// Resolve the promise when the script finishes
		pythonProcess.on("close", (code) => {
			if (code === 0) {
				resolve(result);
			} else {
				reject(`Python script exited with code ${code}`);
			}
		});
	});
}

const initializeRagChain = async (pdfPath, parseTables = false) => {
	let extractedTables = "";

	if (parseTables) {
		extractedTables = await extractTablesFromPDF(pdfPath);
		console.log(extractedTables);
	}

	const loader = new PDFLoader(pdfPath, {
		// you may need to add `.then(m => m.default)` to the end of the import
		pdfjs: () => import("pdfjs-dist/legacy/build/pdf.mjs"),
		splitPages: false,
		parsedItemSeparator: "",
	});

	// Load and parse the PDF using PDFLoader
	const loadedDocs = await loader.load();

	if (parseTables) {
		const combinedExtractedTable = loadedDocs[0].pageContent.concat("\n", extractedTables);

		loadedDocs[0].pageContent = combinedExtractedTable;
	}

	// Split the parsed PDF text into smaller chunks for processing
	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 1000, // Each chunk will be 1000 characters long
		chunkOverlap: 200, // Overlap 200 characters between chunks to preserve context
	});
	const allSplits = await splitter.splitDocuments(loadedDocs);

	// Create an in-memory vector store from the document chunks using embeddings
	const inMemoryVectorStore = await MemoryVectorStore.fromDocuments(
		allSplits,
		new OpenAIEmbeddings() // Using OpenAI embeddings to convert text to vectors
	);

	// Set up a retriever to perform similarity-based search in the vector store
	const vectorStoreRetriever = inMemoryVectorStore.asRetriever({
		k: 6, // Return the top 6 most similar chunks
		searchType: "similarity", // Search based on similarity
	});

	// Set up the language model (ChatGPT) for processing text
	const llm = new ChatOpenAI({
		model: "gpt-5-mini", // GPT model being used
	});

	const customTemplate = `You are a financial expert. Given the following context from the document, 
    please answer the question as accurately and concisely as possible. 
    Return only the requested information, do not include any additional explanations or context. 
    If the information is not directly found in the context, do not guess, do not use any external 
    information, do not use any prior knowledge. Just respond with null.

    Context: {context}

    Question: {question}

    Answer:`;

	const customRagPrompt = PromptTemplate.fromTemplate(customTemplate);

	// Create a chain of processes to format documents, ask questions, and generate responses
	const runnableRagChain = RunnableSequence.from([
		{
			context: RunnableSequence.from([
				(input) => input.vectorQuery,
				vectorStoreRetriever,
				formatDocumentsAsString,
			]),
			question: (input) => input.llmPrompt,
		},
		new RunnablePassthrough({
			func: (input) => {
				// This logging step is now even more useful!
				console.log("Context provided to LLM:\n\n", input.context);
				console.log("Question (LLM Prompt) provided to LLM:\n\n", input.question);
				return input;
			},
		}),
		customRagPrompt, // Use the RAG prompt
		llm, // Use the language model
		new StringOutputParser(), // Parse the model's output
	]);

	return runnableRagChain;
};

module.exports = { initializeRagChain };
