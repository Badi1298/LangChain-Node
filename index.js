require("dotenv").config();

const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs/promises");
const express = require("express");

const { pull } = require("langchain/hub");
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

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" }); // Files will be stored in the 'uploads' folder

// Create an Express app
const app = express();
const PORT = 8002;

app.use(cors());

// Define an endpoint to handle file upload
app.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
  try {
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the uploaded file's path
    const pdfPath = path.join(__dirname, req.file.path);

    // Load and parse the PDF using PDFLoader
    const loader = new PDFLoader(pdfPath);
    const loadedDocs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const allSplits = await splitter.splitDocuments(loadedDocs);

    const inMemoryVectorStore = await MemoryVectorStore.fromDocuments(
      allSplits,
      new OpenAIEmbeddings()
    );

    const vectorStoreRetriever = inMemoryVectorStore.asRetriever({
      k: 6,
      searchType: "similarity",
    });

    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
    });

    const ragPrompt = await pull("rlm/rag-prompt");

    const runnableRagChain = RunnableSequence.from([
      {
        context: vectorStoreRetriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      ragPrompt,
      llm,
      new StringOutputParser(),
    ]);

    let result = {
      issuer: null,
      issuer_code: "",
      notional: "",
      isin: "",
      currency: "",
    };

    let issuer = "";

    // Execute all streams concurrently
    const [issuerChunks, notionalChunks, isinChunks, currencyChunks] =
      await Promise.all([
        runnableRagChain.stream(
          "What is the Issuer found inside the General Information section? Display only the issuer itself."
        ),
        runnableRagChain.stream(
          "What is the value of the Issuer Price found inside the Product Details section?"
        ),
        runnableRagChain.stream(
          "What is the ISIN found inside the Product Details section? Display only the ISIN itself."
        ),
        runnableRagChain.stream("What is the currency?"),
      ]);

    // Process the chunks for each query
    for await (const chunk of issuerChunks) {
      issuer += chunk;
    }
    issuer = getIssuer(issuer);
    result.issuer = issuer.id;
    result.issuer_code = issuer.issuer_code;

    for await (const chunk of notionalChunks) {
      result.notional += chunk;
    }
    result.notional = isNotional(result.notional);

    for await (const chunk of isinChunks) {
      result.isin += chunk;
    }

    for await (const chunk of currencyChunks) {
      result.currency += chunk;
    }

    // Clean up the uploaded file after processing
    await fs.unlink(pdfPath);

    // Send the number of docs as a response
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading PDF" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
