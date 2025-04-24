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

        2.  **Fundamental Explanation:**
            * Analyze the gathered data to identify the fundamental reasons for the lagging performance of the stocks in [suggestedStocks].
            * Consider factors such as earnings misses, negative news, increased competition, specific sub-sector challenges affecting this stock more, poor recent execution, or negative market sentiment shifts impacting its valuation.

        3.  **Selection & Justification:**
            * Based *only* on the comparison of the grounded earnings data and corporate news, select **up to a maximum of 5 stocks** from the [suggestedStocks] list which are likely to recover from their lagging performance.
            * Focus on the **fundamental** reasons for the lagging performance, avoiding technical analysis or speculative reasons.
            * For **each** stock you select, provide a concise justification, 1-2 sentences, explaining *why* it has seen a lagging performance despite being in a similar sector/industry as the selected stocks. Reference specific data points or news events found via your web search. 

        **Output Format:**
        **[Suggested Stock Name]**: Brief justification summarizing the reasons for lagging performance, including any relevant data points or news events.

        **Important:** The final answer should ONLY contain the output, which is the **up to 5 stocks** selected from the 'suggested stocks' and their justification. Do not include any additional commentary or explanations outside of the specified format. Do not include reference numbers like [1], [4, 9], etc. in the output.
        **Important:** Your analysis and selection *must* be based on the information retrieved via grounding/web search regarding recent earnings and corporate news. Do not rely on pre-existing knowledge without verification. Ensure the timeframe for news is respected - last 6 months.
        **Important:** Return only the suggestions, do not give an introduction like "Here are the suggested stocks...".
        `;

	return { role: "user", parts: [{ text: promptText }] };
};

module.exports = {
	user: userPromptTemplate,
};
