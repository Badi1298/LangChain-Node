function extractJsonFromString(str) {
	const match = str.match(/```json\s*([\s\S]*?)\s*```/);
	if (match && match[1]) {
		return match[1];
	}
	// Fallback: attempt to find the first '{' and last '}'
	// This is a more naive approach and might not always work.
	const firstBrace = str.indexOf("[");
	const lastBrace = str.lastIndexOf("]");
	if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
		return str.substring(firstBrace, lastBrace + 1);
	}
	return str; // Return original if no clear JSON found
}

module.exports = {
	extractJsonFromString,
};
