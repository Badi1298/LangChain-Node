const { getDecorrelatedSectors } = require("../../utils/getDecorrelatedSectors.js");

/**
 * Retrieves stock suggestions based on finding decorrelated sectors within the same country
 * and a specific volatility range relative to selected stocks.
 * ADJUSTED for specific input structure and final sector list.
 *
 * @param {Array<object>} selectedStocks - Array of currently selected stock objects FROM API/FE.
 * @param {Pinecone.Index} pineconeIndex - Initialized Pinecone index object.
 * @param {number} [topK=10] - The maximum number of results to retrieve.
 * @returns {Promise<Array<object>>} - Promise resolving to an array of retrieved stock metadata objects including their IDs.
 */
async function retrieveDecorrelatedStocks({
	selectedStocks, // Input array with structure { id, country, sector, volatility_6, ... }
	pineconeIndex,
	vectorDimension, // Assuming this is passed in or available in the context
	topK,
}) {
	if (!selectedStocks || selectedStocks.length === 0) {
		console.error("Retrieval Error: No selected stocks provided for context.");
		return [];
	}
	if (typeof vectorDimension === "undefined") {
		console.error("Retrieval Error: vectorDimension is not defined.");
		return [];
	}

	// --- 1. Parse Context from selectedStocks ---
	const referenceStock = selectedStocks[0]; // Use first stock for context
	const referenceCountry = referenceStock?.country;
	const referenceSectors = [...new Set(selectedStocks.map((s) => s.sector))];
	const decorrelatedSectors = getDecorrelatedSectors(referenceSectors);
	// Ensure IDs are strings for comparison with Pinecone string IDs later
	const selectedStockIDs = selectedStocks.map((s) => String(s.id));

	if (!referenceCountry || referenceSectors.length === 0) {
		console.error(
			"[Retrieval] Error: Selected stock(s) missing 'country' or 'sector'. Received:",
			referenceStock
		);
		return [];
	}

	console.log(
		`[Retrieval] Context: Country='${referenceCountry}', Sector='${referenceSectors.join(", ")}'`
	);

	// Calculate volatility range using 'volatility_6' from the INPUT data
	let minVolatility = Infinity;
	let maxVolatility = -Infinity;
	let validVolatilityCount = 0;
	selectedStocks.forEach((stock) => {
		const volatility = stock?.volatility_6;
		if (volatility) {
			minVolatility = Math.min(minVolatility, parseFloat(volatility));
			maxVolatility = Math.max(maxVolatility, parseFloat(volatility));
			validVolatilityCount++;
		} else {
			console.warn(
				`[Retrieval] Input Stock ID ${stock.id} missing valid 'volatility_6'. Value: ${volatility}`
			);
		}
	});

	if (validVolatilityCount === 0) {
		console.error(
			"[Retrieval] Error: Could not determine valid volatility range from 'volatility_6' in selected stocks."
		);
		return [];
	}

	// Calculate target range based on the query logic (XX = min+4, YY = max+10)
	let volatilityLowerBound = minVolatility + 4;
	let volatilityUpperBound = maxVolatility + 10;
	if (volatilityLowerBound > volatilityUpperBound) {
		// Clamp if inverted
		console.warn(
			`[Retrieval] Calculated volatility bounds are inverted [${volatilityLowerBound}, ${volatilityUpperBound}]. Adjusting.`
		);
		// Example adjustment: use a fixed spread or swap bounds, clamping is simple
		volatilityLowerBound = volatilityUpperBound - 6; // Maintain the 6 point spread, centered on upper? Adjust logic as needed.
		// Or simply clamp: volatilityLowerBound = volatilityUpperBound;
	}
	console.log(
		`[Retrieval] Calculated Target Volatility Range (using input volatility_6): [${volatilityLowerBound.toFixed(
			4
		)}, ${volatilityUpperBound.toFixed(4)}]`
	);

	// --- 2. Construct Pinecone Filter ---
	const pineconeVolatilityFilterKey = "implied_volatility_12m";
	console.log(
		`[Retrieval] Filtering Pinecone metadata field: '${pineconeVolatilityFilterKey}' using calculated range.`
	);

	const filterCriteriaForPinecone = {
		$and: [
			{ country: { $eq: referenceCountry } },
			{ sector: { $nin: referenceSectors } },
			{
				[pineconeVolatilityFilterKey]: {
					$gte: volatilityLowerBound,
					$lte: volatilityUpperBound,
				},
			},
		],
	};

	// --- 4. Execute Pinecone Query ---
	console.log("[Retrieval] Querying Pinecone with filter:", JSON.stringify(filterCriteriaForPinecone));
	try {
		const zeroVector = new Array(vectorDimension).fill(0);
		const initialTopK = topK * 5 + selectedStocks.length; // Fetch more for post-filtering

		const queryResponse = await pineconeIndex.query({
			vector: zeroVector,
			filter: filterCriteriaForPinecone,
			topK: initialTopK,
			includeMetadata: true,
			includeValues: false,
		});

		console.log(`[Retrieval] Pinecone returned ${queryResponse.matches?.length || 0} potential matches.`);

		// --- 5. Process Results ---
		if (!queryResponse.matches || queryResponse.matches.length === 0) {
			return [];
		}

		// Post-filter to remove the originally selected stocks (compare Pinecone string ID with input string IDs)
		const retrievedStocks = queryResponse.matches
			.filter((match) => !selectedStockIDs.includes(match.id))
			.slice(0, topK) // Apply original topK limit
			.map((match) => ({
				id: match.id, // Keep Pinecone string ID
				...match.metadata, // Spread the retrieved metadata
			}));

		console.log(`[Retrieval] Returning ${retrievedStocks.length} decorrelated stock suggestions.`);
		return retrievedStocks;
	} catch (error) {
		console.error("[Retrieval] Error querying Pinecone:", error.message || error);
		// Consider more specific error handling (e.g., check error.status for Pinecone errors)
		return [];
	}
}

module.exports = { retrieveDecorrelatedStocks };
