/**
 * Calculates the element-wise average of multiple vectors.
 * Assumes all vectors have the same dimension.
 *
 * @param vectors An array of vectors (each vector is an array of numbers).
 * @returns A single vector representing the average, or null if input is invalid.
 */
function averageVectors(vectors) {
	if (!vectors || vectors.length === 0) {
		console.error("Cannot average empty list of vectors.");
		return null;
	}

	const numVectors = vectors.length;
	// Check if all vectors are valid arrays and get the dimension from the first one
	if (!Array.isArray(vectors[0]) || vectors[0].length === 0) {
		console.error("Invalid vector data found.");
		return null;
	}
	const dimension = vectors[0].length;

	// Initialize sum vector with zeros
	const sumVector = new Array(dimension).fill(0);

	// Sum up all vectors element-wise
	for (const vector of vectors) {
		// Basic validation
		if (!Array.isArray(vector) || vector.length !== dimension) {
			console.error(
				`Vector dimension mismatch or invalid vector found. Expected dimension ${dimension}, found vector:`,
				vector
			);
			return null; // Or handle error differently
		}
		for (let i = 0; i < dimension; i++) {
			sumVector[i] += vector[i];
		}
	}

	// Divide by the number of vectors to get the average
	const averageVector = sumVector.map((sum) => sum / numVectors);

	return averageVector;
}

module.exports = { averageVectors };
