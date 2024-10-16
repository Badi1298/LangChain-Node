require("dotenv").config();

const { PromptTemplate } = require("@langchain/core/prompts");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");

const { StringOutputParser } = require("@langchain/core/output_parsers");
const {
  RunnablePassthrough,
  RunnableSequence,
} = require("@langchain/core/runnables");
const { formatDocumentsAsString } = require("langchain/util/document");

const initializeRagChain = async (pdfPath) => {
  // Get the path of the uploaded PDF file

  const loader = new PDFLoader(pdfPath, {
    // you may need to add `.then(m => m.default)` to the end of the import
    pdfjs: () => import("pdfjs-dist/legacy/build/pdf.mjs"),
    splitPages: false,
    parsedItemSeparator: "",
  });
  // Load and parse the PDF using PDFLoader
  const loadedDocs = await loader.load();

  // Split the parsed PDF text into smaller chunks for processing
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000, // Each chunk will be 1000 characters long
    chunkOverlap: 400, // Overlap 200 characters between chunks to preserve context
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

  const data = await vectorStoreRetriever.invoke(
    "What is the Initial Fixing Level of the underlyings inside the Underlying table?"
  );

  console.log(data);

  // Set up the language model (ChatGPT) for processing text
  const llm = new ChatOpenAI({
    model: "gpt-4o", // GPT model being used
    temperature: 0, // Use deterministic output (low temperature)
  });

  const customTemplate = `You are a financial expert. Given the following context from the document, 
    please answer the question as accurately and concisely as possible. If the information is not directly 
    found in the context, use your financial knowledge to deduce the answer. If you are unable to answer 
    based on the context or your knowledge, respond with "I don't know."

    {context}

    Question: {question}

    Answer:`;

  const customRagPrompt = PromptTemplate.fromTemplate(customTemplate);

  // Create a chain of processes to format documents, ask questions, and generate responses
  const runnableRagChain = RunnableSequence.from([
    {
      context: vectorStoreRetriever.pipe(formatDocumentsAsString), // Convert documents to string for the model
      question: new RunnablePassthrough(), // Pass the question directly
    },
    customRagPrompt, // Use the RAG prompt
    llm, // Use the language model
    new StringOutputParser(), // Parse the model's output
  ]);

  return runnableRagChain;
};

module.exports = { initializeRagChain };
