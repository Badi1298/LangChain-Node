const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");

exports.computeStockSuggestions = async (req, res) => {
	// return;

	const model = new ChatOpenAI({ model: "gpt-4o-mini" });

	const promptTemplate = ChatPromptTemplate.fromMessages([["user", "{text}"]]);

	const parser = new StringOutputParser();

	const llmChain = promptTemplate.pipe(model).pipe(parser);

	const result = await llmChain.invoke({ text: req.body.text });

	res.json({ success: true, data: result });
};
