/**
 * Retrieves stock suggestions based on finding stocks within the same sub-sector and country,
 * with similar or higher volatility compared to selected stocks.
 *
 * @param {Array<object>} selectedStocks - Array of currently selected stock objects.
 * @param {Pinecone.Index} pineconeIndex - Initialized Pinecone index object.
 * @param {number} vectorDimension - The dimension of the vectors in the Pinecone index.
 * @param {number} [topK=10] - The maximum number of results to retrieve.
 * @returns {Promise<Array<object>>} - Promise resolving to an array of retrieved stock metadata objects including their IDs.
 */
async function retrieveSimilarVolatilityStocks({
	selectedStocks,
	pineconeIndex,
	vectorDimension,
	topK = 10,
}) {
	if (!selectedStocks || selectedStocks.length === 0) {
		console.error("[Similar Vol] Retrieval Error: No selected stocks provided for context.");
		return [];
	}
	if (typeof vectorDimension === "undefined") {
		console.error("[Similar Vol] Retrieval Error: vectorDimension is not defined.");
		return [];
	}

	// --- 1. Parse Context from selectedStocks ---
	const referenceStock = selectedStocks[0]; // Use first stock for context
	const referenceCountry = referenceStock?.country;
	const referenceSubSector = referenceStock?.sub_sector; // Get sub-sector from the first stock

	// Ensure IDs are strings for comparison with Pinecone string IDs later
	const selectedStockIDs = selectedStocks.map((s) => String(s.id));

	// Validate essential context fields
	if (!referenceCountry || !referenceSubSector) {
		console.error(
			`[Similar Vol] Error: First selected stock (ID: ${referenceStock?.id}) missing 'country' or 'sub_sector'. Received:`,
			referenceStock
		);
		return [];
	}

	// Optional: Warn if selected stocks span multiple sub-sectors, as the filter uses the first one.
	const uniqueSubSectors = [...new Set(selectedStocks.map((s) => s.sub_sector))];
	if (uniqueSubSectors.length > 1) {
		console.warn(
			`[Similar Vol] Warning: Selected stocks belong to multiple sub-sectors (${uniqueSubSectors.join(
				", "
			)}). Using the first sub-sector '${referenceSubSector}' for filtering.`
		);
	}

	console.log(`[Similar Vol] Context: Country='${referenceCountry}', Sub-Sector='${referenceSubSector}'`);

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

	// This minimum volatility will be the lower bound for the Pinecone query
	const volatilityLowerBound = minVolatility;
	const volatilityUpperBound = maxVolatility + 10;
	console.log(
		`[Similar Vol] Calculated Minimum Volatility (using input volatility_6): ${volatilityLowerBound.toFixed(
			4
		)}`
	);

	// --- 2. Construct Pinecone Filter ---
	const pineconeSubSectorFilterKey = "sub_sector";
	const pineconeVolatilityFilterKey = "implied_volatility_12m";

	console.log(
		`[Similar Vol] Filtering Pinecone metadata: Field '${pineconeSubSectorFilterKey}' = '${referenceSubSector}', Field '${pineconeVolatilityFilterKey}' >= ${volatilityLowerBound.toFixed(
			4
		)}`
	);

	const filterCriteriaForPinecone = {
		$and: [
			{ country: { $eq: referenceCountry } },
			// Filter for the *same* sub-sector as the reference stock
			{ [pineconeSubSectorFilterKey]: { $eq: referenceSubSector } },
			// Filter for volatility *greater than or equal to* the minimum of selected stocks
			{
				[pineconeVolatilityFilterKey]: {
					$gte: volatilityLowerBound,
					$lte: volatilityUpperBound,
				},
			},
		],
	};

	// --- 3. Execute Pinecone Query ---
	console.log("[Similar Vol] Querying Pinecone with filter:", JSON.stringify(filterCriteriaForPinecone));
	try {
		// Using a zero vector because we are filtering based on metadata, not vector similarity.
		const zeroVector = new Array(vectorDimension).fill(0);
		// Fetch more initially to allow for post-filtering of selected stocks
		const initialTopK = topK * 5 + selectedStocks.length;

		const queryResponse = await pineconeIndex.query({
			vector: zeroVector,
			filter: filterCriteriaForPinecone,
			topK: initialTopK,
			includeMetadata: true, // We need metadata (country, sub_sector, volatility, etc.)
			includeValues: false, // Vector values usually not needed for suggestions
		});

		console.log(
			`[Similar Vol] Pinecone returned ${queryResponse.matches?.length || 0} potential matches.`
		);

		// --- 4. Process Results ---
		if (!queryResponse.matches || queryResponse.matches.length === 0) {
			console.log("[Similar Vol] No matching stocks found in Pinecone.");
			return [];
		}

		// Post-filter to remove the originally selected stocks
		// Compare Pinecone string ID with input string IDs
		const retrievedStocks = queryResponse.matches
			.filter((match) => !selectedStockIDs.includes(match.id))
			.slice(0, topK) // Apply original topK limit
			.map((match) => ({
				id: match.id, // Keep Pinecone string ID
				...match.metadata, // Spread the retrieved metadata
			}));

		console.log(
			`[Similar Vol] Returning ${retrievedStocks.length} similar volatility stock suggestions.`
		);
		return retrievedStocks;
	} catch (error) {
		console.error("[Similar Vol] Error querying Pinecone:", error.message || error);
		// Consider more specific error handling (e.g., check error.status for Pinecone errors)
		return [];
	}
}

// Make sure to export the new function if using modules
module.exports = { retrieveSimilarVolatilityStocks }; // Add alongside your existing export if needed
