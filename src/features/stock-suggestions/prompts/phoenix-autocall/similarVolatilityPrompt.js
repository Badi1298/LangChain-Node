const systemPrompt = `You are a financial analyst assistant. Your task is to compare a list of potential stock suggestions against a list of currently selected stocks based only on the recent earnings data and news summaries. Identify up to 5 suggestions that show fundamentally stronger recent performance or outlook compared to the original selection.`;

const userPrompt = ({ selectedInfo, suggestionsInfo }) => {
	return `
        **Objective:** Analyze the provided lists of stocks ('selectedStocks' and 'suggestedStocks') to identify superior investment prospects based on recent fundamental data.

        **Input:**
        * 'selectedStocks': ${selectedInfo}
        * 'suggestedStocks': ${suggestionsInfo}

        **Task Breakdown:**

        1.  **Data Gathering (Crucial: Use Grounding/Web Search):**
            * Utilize your web search capabilities extensively.
            * Retrieve the **latest available quarterly earnings results** for all companies listed in 'selectedStocks' and 'suggestedStocks'. Focus on key metrics like revenue growth, Earnings Per Share (EPS) growth, profit margins, comparison to analyst estimates (beat/miss), and forward guidance/outlook.
            * Find significant **corporate news** published within the last **6 months** for all stocks in both lists. Look for events like major contract wins, new product launches, M&A activity, management changes, regulatory updates, or strategic partnerships.

        2.  **Fundamental Comparison:**
            * Compare the **earnings performance and outlook** of each stock in 'suggestedStocks' against the stocks in 'selectedStocks'. Identify which 'suggestedStocks' show demonstrably stronger results (e.g., higher growth rates, significant earnings beats, more optimistic guidance).
            * Compare the **impact of recent corporate news**. Assess whether the news flow for stocks in 'suggestedStocks' points towards a more positive fundamental trajectory (e.g., successful product launches, beneficial M&A) compared to those in 'selectedStocks'.

        3.  **Selection & Justification:**
            * Based *only* on the comparison of the grounded earnings data and corporate news, select **up to a maximum of 5 stocks** from the 'suggestedStocks' list that exhibit clearly stronger fundamental characteristics or significantly better recent developments than the stocks in 'selectedStocks'.
            * For **each** stock you select, provide a concise justification, 1-2 sentences, explaining *why* its recent earnings and/or news make it fundamentally more attractive than the 'selectedStocks'. Reference specific data points or news events found via your web search.

        **Output Format:**
        **[Suggested Stock Name]**: Brief justification summarizing the superior fundamental factors (based on recent earnings/news).

        **Important:** Your analysis and selection *must* be based on the information retrieved via grounding/web search regarding recent earnings and corporate news. Do not rely on pre-existing knowledge without verification. Ensure the timeframe for news is respected - last 6 months.
        `;
};
