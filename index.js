require("dotenv").config();

const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs/promises");
const express = require("express");

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

const { getIssuer, isNotional } = require("./parseAddProductPdf");
const { isActiveFlag } = require("./parseProductDetailsPdf");

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" }); // Files will be stored in the 'uploads' folder

// Create an Express app
const app = express();
const PORT = 8002;

app.use(cors());

const initializeRagChain = async (req) => {
  // Get the path of the uploaded PDF file
  const pdfPath = path.join(__dirname, req.file.path);

  // Load and parse the PDF using PDFLoader
  const loader = new PDFLoader(pdfPath, { splitPages: false });
  const loadedDocs = await loader.load();

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

  // const real = await vectorStoreRetriever.invoke(
  //   "Is the string 'closing level' present between the sections titled 'Barrier Event' and 'Barrier Observation Period'?"
  // );

  // console.log(real);

  // Set up the language model (ChatGPT) for processing text
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini", // GPT model being used
    temperature: 0, // Use deterministic output (low temperature)
  });

  const customTemplate = `Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Give really concise answers.

    {context}

    Question: {question}

    Helpful Answer:`;

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

// Define an endpoint to handle file upload and parse
app.post(
  "/parse-product-information-termsheet",
  upload.single("pdf"),
  async (req, res) => {
    try {
      // Check if a file is uploaded
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const pdfPath = path.join(__dirname, req.file.path);

      const runnableRagChain = await initializeRagChain(req);

      // Initialize the result object to store extracted data
      let result = {
        issuer: null,
        issuer_code: "",
        notional: "",
        isin: "",
        currency: "",
      };

      let issuer = "";

      // Execute all queries (streams) concurrently
      const [issuerChunks, notionalChunks, isinChunks, currencyChunks] =
        await Promise.all([
          runnableRagChain.stream(
            "What is the Issuer found inside the General Information section?"
          ),
          runnableRagChain.stream(
            "What is the Issue Price and Issue Size inside the Product Details section?"
          ),
          runnableRagChain.stream(
            "What is the ISIN found inside the Product Details section? Display only the ISIN itself."
          ),
          runnableRagChain.stream("What is the currency?"),
        ]);

      for await (const chunk of issuerChunks) {
        issuer += chunk;
      }
      // Extract the issuer ID and code from the result
      issuer = getIssuer(issuer);
      result.issuer = issuer.id;
      result.issuer_code = issuer.issuer_code;

      for await (const chunk of notionalChunks) {
        result.notional += chunk;
      }
      console.log(result.notional);
      result.notional = isNotional(result.notional);

      for await (const chunk of isinChunks) {
        result.isin += chunk;
      }

      for await (const chunk of currencyChunks) {
        result.currency += chunk;
      }

      // Delete the uploaded file from the server after processing is complete
      await fs.unlink(pdfPath);

      // Send the result back to the client
      res.json({ success: true, data: result });
    } catch (error) {
      // Log the error and send an error response if something goes wrong
      console.error(error);
      res.status(500).json({ message: "Error loading PDF" });
    }
  }
);

app.post(
  "/parse-product-details-termsheet",
  upload.single("pdf"),
  async (req, res) => {
    try {
      // Check if a file is uploaded
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const pdfPath = path.join(__dirname, req.file.path);

      const runnableRagChain = await initializeRagChain(req);

      // Initialize the result object to store extracted data
      let result = {
        isLowStrike: "",
        isEuropeanBarrier: "",
        isAmericanBarrier: "",
      };

      // Execute all queries (streams) concurrently
      const [flagChunks] = await Promise.all([
        runnableRagChain.stream(
          "Does the document have the exact string 'Barrier Event'?"
        ),
      ]);

      for await (const chunk of flagChunks) {
        result.isLowStrike += chunk;
      }

      console.log(result.isLowStrike);

      result.isLowStrike = isActiveFlag(result.isLowStrike);

      if (!result.isLowStrike) {
        const europeanBarrierChunks = await runnableRagChain.stream(
          "Does the document contain the text 'Barrier Observation Period'?"
        );

        for await (const chunk of europeanBarrierChunks) {
          result.isEuropeanBarrier += chunk;
        }
      }

      console.log(result.isEuropeanBarrier);

      result.isEuropeanBarrier = isActiveFlag(result.isEuropeanBarrier);

      if (!result.isLowStrike && !result.isEuropeanBarrier) {
        const americanBarrierChunks = await runnableRagChain.stream(
          "Is the string 'closing level' present between the sections titled 'Barrier Event' and 'Barrier Observation Period'?"
        );

        for await (const chunk of americanBarrierChunks) {
          result.isAmericanBarrier += chunk;
        }
      }

      console.log(result.isAmericanBarrier);

      result.isAmericanBarrier = isActiveFlag(result.isAmericanBarrier);

      // Delete the uploaded file from the server after processing is complete
      await fs.unlink(pdfPath);

      // Send the result back to the client
      res.json({ success: true, data: result });
    } catch (error) {
      // Log the error and send an error response if something goes wrong
      console.error(error);
      res.status(500).json({ message: "Error loading PDF" });
    }
  }
);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
