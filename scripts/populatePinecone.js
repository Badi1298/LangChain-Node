const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const fs = require("fs/promises");
const path = require("path");

dotenv.config();

// --- Configuration ---
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Get OpenAI key
const INDEX_NAME = "stock-data"; // Your Pinecone index name
// Use OpenAI's recommended embedding model
const EMBEDDING_MODEL_NAME = "text-embedding-3-small";
const VECTOR_DIMENSION = 1536; // Dimension for text-embedding-3-small
const YOUR_STOCK_DATA_FILE = "stocks.json"; // Your data file
const BATCH_SIZE = 100; // Pinecone upsert batch size (can be up to 100 usually)

// --- Helper Functions  ---
function toSnakeCase(str) {
	// Simplified version assuming keys are reasonably formatted
	return str
		.replace(/\s+/g, "_")
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, "");
}

function safeParseFloat(value) {
	if (value === null || typeof value === "undefined") {
		return null;
	}
	const num = parseFloat(value);
	return isNaN(num) ? null : num;
}

async function runIndexer() {
	if (!PINECONE_API_KEY || !OPENAI_API_KEY) {
		console.error(
			"Error: PINECONE_API_KEY or OPENAI_API_KEY not found in environment variables."
		);
		process.exit(1);
	}

	try {
		// --- Initialize Connections ---
		console.log("Initializing Pinecone connection...");
		const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

		console.log("Initializing OpenAI client...");
		const openai = new OpenAI({ apiKey: OPENAI_API_KEY }); // Initialize OpenAI client
		console.log("OpenAI client initialized.");

		// --- Delete Index if it exists ---
		console.log(`Checking if index '${INDEX_NAME}' exists...`);
		const existingIndexes = await pinecone.listIndexes();
		if (existingIndexes.includes(INDEX_NAME)) {
			console.log(`Index '${INDEX_NAME}' exists. Deleting...`);
			await pinecone.deleteIndex(INDEX_NAME);
		}

		console.log(`Creating index '${INDEX_NAME}' with dimension ${VECTOR_DIMENSION}...`);
		await pinecone.createIndex({
			name: INDEX_NAME,
			dimension: VECTOR_DIMENSION,
			metric: "cosine",
			spec: {
				serverless: {
					cloud: "aws",
					region: "us-east-1",
				},
			},
		});
		console.log(`Index '${INDEX_NAME}' created. Waiting for initialization...`);
		await new Promise((resolve) => setTimeout(resolve, 30000)); // Delay

		// --- Connect to the Index ---
		const index = pinecone.Index(INDEX_NAME);
		console.log("Connected to index.");
		console.log(await index.describeIndexStats());

		// --- Load your Stock Data ---
		console.log(`Loading stock data from ${YOUR_STOCK_DATA_FILE}...`);
		const data = await fs.readFile(path.resolve(YOUR_STOCK_DATA_FILE), "utf-8");
		const stocks = JSON.parse(data);
		console.log(`Loaded ${stocks.length} stock records.`);

		// --- Prepare and Upsert Data in Batches ---
		console.log(`Preparing and upserting data in batches of ${BATCH_SIZE}...`);
		for (let i = 0; i < stocks.length; i += BATCH_SIZE) {
			const pineconeBatch = stocks.slice(i, i + BATCH_SIZE);
			const vectorsToUpsert = [];
			const textsToEmbedBatch = [];
			const batchStockInfo = []; // Store corresponding stock IDs and metadata temporarily

			console.log(
				`Processing Pinecone batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(
					stocks.length / BATCH_SIZE
				)}...`
			);

			// 1. Prepare texts and metadata for the batch
			for (const stock of pineconeBatch) {
				try {
					if (stock.id === null || typeof stock.id === "undefined") {
						console.warn("Skipping stock record with missing ID:", stock);
						continue;
					}
					const stockId = String(stock.id);

					// Prepare text for embedding
					const textToEmbed = `Ticker: ${stock.ticker || ""}, Name: ${
						stock.name || ""
					}. Sector: ${stock.sector || ""}, Sub-sector: ${
						stock.sub_sector || ""
					}. Country: ${stock.country || ""}.`;
					textsToEmbedBatch.push(textToEmbed);

					// Prepare metadata (same logic as before)
					const metadata = {};
					// ... (metadata creation logic identical to the previous script)
					for (const key in stock) {
						if (key === "id") continue;
						const value = stock[key];
						if (value === null || typeof value === "undefined") continue;
						const cleanKey = toSnakeCase(key);
						if (
							[
								"market_capitalization_in_usd",
								"52w_highlow",
								"est_12m_dividend_yield",
								"12m_implied_volatility",
								"volatility_52w_highlow",
								"3m_perf",
							].includes(cleanKey)
						) {
							const numValue = safeParseFloat(value);
							if (numValue !== null) {
								if (cleanKey === "market_capitalization_in_usd")
									metadata["market_cap_usd"] = numValue;
								else if (cleanKey === "52w_highlow")
									metadata["price_52w_hl_ratio"] = numValue;
								else if (cleanKey === "est_12m_dividend_yield")
									metadata["dividend_yield_12m"] = numValue;
								else if (cleanKey === "12m_implied_volatility")
									metadata["implied_volatility_12m"] = numValue;
								else if (cleanKey === "volatility_52w_highlow")
									metadata["volatility_52w_hl_ratio"] = numValue;
								else if (cleanKey === "3m_perf") metadata["perf_3m"] = numValue;
							} else {
								console.warn(
									`Could not parse numeric value for key '${key}' in stock ID ${stockId}. Value: ${value}. Omitting field.`
								);
							}
						} else {
							metadata[cleanKey] = String(value);
						}
					}

					batchStockInfo.push({ id: stockId, metadata: metadata });
				} catch (error) {
					console.error(
						`Error preparing stock ID ${stock?.id || "N/A"} for embedding:`,
						error
					);
				}
			} // End loop through pineconeBatch prep

			// 2. Get Embeddings from OpenAI for the prepared texts (in smaller batches if needed)
			if (textsToEmbedBatch.length > 0) {
				try {
					console.log(`Requesting ${textsToEmbedBatch.length} embeddings from OpenAI...`);
					// OpenAI's API can handle batches, respecting potential rate limits might require smaller sub-batches in production
					const embeddingsResponse = await openai.embeddings.create({
						model: EMBEDDING_MODEL_NAME,
						input: textsToEmbedBatch,
					});

					// Check if the number of embeddings matches the number of texts sent
					if (
						embeddingsResponse.data &&
						embeddingsResponse.data.length === textsToEmbedBatch.length
					) {
						embeddingsResponse.data.forEach((embeddingData, index) => {
							const stockInfo = batchStockInfo[index]; // Match embedding to original stock info by index
							vectorsToUpsert.push({
								id: stockInfo.id,
								values: embeddingData.embedding, // The vector from OpenAI
								metadata: stockInfo.metadata,
							});
						});
					} else {
						console.error(
							`Error: Mismatch between requested embeddings (<span class="math-inline">\{textsToEmbedBatch\.length\}\) and received embeddings \(</span>{embeddingsResponse.data?.length || 0}). Skipping batch.`
						);
					}
				} catch (error) {
					console.error("Error getting embeddings from OpenAI:", error);
					// Decide how to handle: skip batch, retry, log?
					// If rate limit error, implement exponential backoff/retry
				}
			}

			// 3. Upsert the batch to Pinecone if vectors were created
			if (vectorsToUpsert.length > 0) {
				console.log(`Upserting batch of ${vectorsToUpsert.length} vectors to Pinecone...`);
				try {
					await index.upsert(vectorsToUpsert);
				} catch (pineconeError) {
					console.error("Error upserting batch to Pinecone:", pineconeError);
				}
			} else if (pineconeBatch.length > 0) {
				console.warn(
					`No vectors were generated for Pinecone batch ${
						Math.floor(i / BATCH_SIZE) + 1
					}. Nothing to upsert.`
				);
			}
		} // End loop through stock data in batches

		console.log("Data upsert process complete.");
		console.log(await index.describeIndexStats());
	} catch (error) {
		console.error("An error occurred during the indexing process:", error);
		process.exit(1);
	}
}

// --- Run the script ---
runIndexer();
