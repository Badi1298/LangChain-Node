/**
 * Retrieves stock suggestions based on finding stocks in similar sectors/industries
 * with the lowest 3M performances or lowest price 52-week high/low.
 *
 * @param {Array<object>} selectedStocks - Array of currently selected stock objects.
 * @param {Pinecone.Index} pineconeIndex - Initialized Pinecone index object.
 * @param {number} vectorDimension - The dimension of the vectors in the Pinecone index.
 * @param {number} [topK=20] - The maximum number of results to retrieve.
 * @returns {Promise<Array<object>>} - Promise resolving to an array of retrieved stock metadata objects including their IDs.
 */
async function retrieveLaggingPerformanceStocks({
	selectedStocks,
	pineconeIndex,
	vectorDimension,
	topK = 20,
}) {
	if (!selectedStocks || selectedStocks.length === 0) {
		console.error("[Retrieval LaggingPerformance] Error: No selected stocks provided for context.");
		return [];
	}
	if (typeof vectorDimension === "undefined") {
		console.error("[Retrieval LaggingPerformance] Error: vectorDimension is not defined.");
		return [];
	}

	// --- 1. Parse Context from selectedStocks ---
	const referenceStock = selectedStocks[0]; // Use first stock for primary context
	const referenceCountry = referenceStock?.country;
	// Get unique sectors from all selected stocks
	const referenceSectors = [...new Set(selectedStocks.map((s) => s.sector).filter(Boolean))];
	// Get unique industries from all selected stocks (handle potentially missing industry)
	const referenceIndustries = [...new Set(selectedStocks.map((s) => s.sub_sector).filter(Boolean))];
	// Ensure IDs are strings for comparison with Pinecone string IDs later
	const selectedStockIDs = selectedStocks.map((s) => String(s.id));

	if (!referenceCountry || referenceSectors.length === 0) {
		console.error(
			"[Retrieval LaggingPerformance] Error: Selected stock(s) missing 'country' or 'sector'. Received:",
			referenceStock
		);
		return [];
	}

	console.log(
		`[Retrieval LaggingPerformance] Context: Country='${referenceCountry}', Sectors='${referenceSectors.join(
			", "
		)}', Industries='${referenceIndustries.join(", ") || "N/A"}'`
	);

	// --- 2. Construct Pinecone Filter ---
	// We want stocks IN the same sectors and industries (if provided)
	const filterConditions = [{ country: { $eq: referenceCountry } }, { sector: { $in: referenceSectors } }];

	const filterCriteriaForPinecone = {
		$and: filterConditions,
	};

	// Define the metadata key for sorting
	const priceRatioKey = "price_52w_hl_ratio";
	console.log(
		`[Retrieval LaggingPerformance] Filtering Pinecone for Country/Sector/Industry. Will sort results by '${priceRatioKey}'.`
	);

	// --- 3. Execute Pinecone Query ---
	console.log(
		"[Retrieval LaggingPerformance] Querying Pinecone with filter:",
		JSON.stringify(filterCriteriaForPinecone)
	);
	try {
		const zeroVector = new Array(vectorDimension).fill(0);
		// Fetch more results initially to increase the pool for sorting by performance
		// Adjust the multiplier (e.g., 5) as needed based on data density and performance.
		const initialTopK = topK * 5 + selectedStocks.length;

		const queryResponse = await pineconeIndex.query({
			vector: zeroVector, // Using zero vector as we rely on metadata filtering + sorting
			filter: filterCriteriaForPinecone,
			topK: initialTopK,
			includeMetadata: true, // Essential for getting the performance
			includeValues: false,
		});

		console.log(
			`[Retrieval LaggingPerformance] Pinecone returned ${
				queryResponse.matches?.length || 0
			} potential matches.`
		);

		// --- 4. Process Results ---
		if (!queryResponse.matches || queryResponse.matches.length === 0) {
			return [];
		}

		// Post-filter to remove the originally selected stocks
		const potentialMatches = queryResponse.matches.filter(
			(match) => !selectedStockIDs.includes(match.id)
		);

		// Sort the filtered matches by the price_52w_hl_ratio in ascending order
		potentialMatches.sort((a, b) => {
			const ratioA = a.metadata?.[priceRatioKey];
			const ratioB = b.metadata?.[priceRatioKey];

			// Handle cases where the ratio might be missing or not a number
			if (ratioA == null && ratioB == null) return 0;
			if (ratioA == null) return 1; // Put items without ratio at the end
			if (ratioB == null) return -1; // Put items without ratio at the end

			const numA = parseFloat(ratioA);
			const numB = parseFloat(ratioB);

			if (isNaN(numA) && isNaN(numB)) return 0;
			if (isNaN(numA)) return 1;
			if (isNaN(numB)) return -1;

			return numA - numB; // Ascending sort
		});

		// Take the top K results from the sorted list
		const retrievedStocks = potentialMatches.slice(0, topK).map((match) => ({
			id: match.id, // Keep Pinecone string ID
			...match.metadata, // Spread the retrieved metadata
		}));

		console.log(
			`[Retrieval LaggingPerformance] Returning ${retrievedStocks.length} stock suggestions with the lowest '${priceRatioKey}'.`
		);
		return retrievedStocks;
	} catch (error) {
		console.error("[Retrieval LaggingPerformance] Error querying Pinecone:", error.message || error);
		return [];
	}
}

module.exports = { retrieveLaggingPerformanceStocks };
