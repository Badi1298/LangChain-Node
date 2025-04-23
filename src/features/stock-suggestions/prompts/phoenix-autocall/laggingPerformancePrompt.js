const userPromptTemplate = ({ selectedInfo, suggestionsInfo }) => {
	const promptText = `
        **Objective:** Analyze the provided lists of stocks ([selectedStocks] and [suggestedStocks]) to identify underperformers within [suggestedStocks].

        **Input:**
        * [selectedStocks]: ${selectedInfo}
        * [suggestedStocks]: ${suggestionsInfo}

        **Task Breakdown:**

        1.  **Data Gathering (Crucial: Use Grounding/Web Search):**
            * Utilize your web search capabilities extensively.
            * Focus on potential company-specific factors, recent negative news or earnings misses, increased competition, specific sub-sector challenges affecting this stock more, poor recent execution, or negative market sentiment shifts impacting its valuation.

        2.  **Fundamental Comparison:**
            * Compare the **performance and outlook** of each stock in [suggestedStocks] against the stocks in [selectedStocks]. Identify which [suggestedStocks] show demonstrably stronger results (e.g., higher growth rates, significant earnings beats, more optimistic guidance).
            * Compare the **impact of recent corporate news**. Assess whether the news flow for stocks in [suggestedStocks] points towards a more positive fundamental trajectory (e.g., successful product launches, beneficial M&A) compared to those in [selectedStocks].

        3.  **Selection & Justification:**
            * Based *only* on the comparison of the grounded earnings data and corporate news, select **up to a maximum of 5 stocks** from the [suggestedStocks] list that exhibit clearly stronger fundamental characteristics or significantly better recent developments than the stocks in [selectedStocks].
            * For **each** stock you select, provide a concise justification, 1-2 sentences, explaining *why* it has seen a lagging performance despite being in a similar sector/industry as the selected stocks. Reference specific data points or news events found via your web search. 

        **Output Format:**
        **[Suggested Stock Name]**: Brief justification summarizing the superior fundamental factors (based on recent earnings/news).

        **Important:** The final answer should ONLY contain the output, which is the **up to 5 stocks** selected from the 'suggested stocks' and their justification. Do not include any additional commentary or explanations outside of the specified format. Do not include reference numbers like [1], [4, 9], etc. in the output.
        **Important:** Your analysis and selection *must* be based on the information retrieved via grounding/web search regarding recent earnings and corporate news. Do not rely on pre-existing knowledge without verification. Ensure the timeframe for news is respected - last 6 months.
        `;

	return { role: "user", parts: [{ text: promptText }] };
};

module.exports = {
	user: userPromptTemplate,
};
