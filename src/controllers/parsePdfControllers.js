const path = require("path");
const fs = require("fs").promises; // Using fs promises to delete files asynchronously

const { initializeRagChain } = require("../services/ragChain");
const { isActiveFlag } = require("../services/parseProductDetailsPdf");
const { getIssuer, isNotional } = require("../services/parseAddProductPdf");

exports.parseProductInformationTermsheet = async (req, res) => {
  try {
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const pdfPath = path.join(process.cwd(), req.file.path);

    // Initialize the RAG Chain
    const runnableRagChain = await initializeRagChain(pdfPath);

    // Initialize result object to store extracted data
    let result = {
      issuer: null,
      issuer_code: "",
      notional: "",
      isin: "",
      currency: "",
    };

    let issuer = "";

    // Execute all queries (streams) concurrently
    const [issuerChunks, notionalChunks, isinChunks, currencyChunks] =
      await Promise.all([
        runnableRagChain.stream(
          "What is the name of the Issuer inside the General Information section?"
        ),
        runnableRagChain.stream(
          "What is the Issue Price and Issue Size inside the Product Details section?"
        ),
        runnableRagChain.stream(
          "What is the ISIN found inside the Product Details section? Display only the ISIN itself."
        ),
        runnableRagChain.stream("What is the currency?"),
      ]);

    // Process streams
    for await (const chunk of issuerChunks) {
      issuer += chunk;
    }

    console.log(issuer);

    issuer = getIssuer(issuer);
    result.issuer = issuer.id;
    result.issuer_code = issuer.issuer_code;

    for await (const chunk of notionalChunks) {
      result.notional += chunk;
    }
    result.notional = isNotional(result.notional);

    for await (const chunk of isinChunks) {
      result.isin += chunk;
    }

    for await (const chunk of currencyChunks) {
      result.currency += chunk;
    }

    // Delete the uploaded file from the server after processing
    await fs.unlink(pdfPath);

    // Send the result back to the client
    res.json({ success: true, data: result });
  } catch (error) {
    // Log the error and send an error response
    console.error(error);
    res.status(500).json({ message: "Error loading PDF" });
  }
};

exports.parseProductDetailsTermsheet = async (req, res) => {
  try {
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const pdfPath = path.join(process.cwd(), req.file.path);

    const runnableRagChain = await initializeRagChain(pdfPath);

    // Initialize the result object to store extracted data
    let result = {
      isLowStrike: "",
      isEuropeanBarrier: "",
      isAmericanBarrier: "",
    };

    // Execute all queries (streams) concurrently
    const [flagChunks] = await Promise.all([
      runnableRagChain.stream(
        "Does the document have the exact string 'Barrier Event'?"
      ),
    ]);

    for await (const chunk of flagChunks) {
      result.isLowStrike += chunk;
    }

    console.log(result.isLowStrike);

    result.isLowStrike = isActiveFlag(result.isLowStrike);

    if (!result.isLowStrike) {
      const europeanBarrierChunks = await runnableRagChain.stream(
        "Does the document contain the text 'Barrier Observation Period'?"
      );

      for await (const chunk of europeanBarrierChunks) {
        result.isEuropeanBarrier += chunk;
      }
    }

    console.log(result.isEuropeanBarrier);

    result.isEuropeanBarrier = isActiveFlag(result.isEuropeanBarrier);

    if (!result.isLowStrike && !result.isEuropeanBarrier) {
      const errorChunks = await runnableRagChain.stream(
        "Is the Barrier Observation Period start date different from the Barrier Observation Period end date?"
      );

      let error = "";

      for await (const chunk of errorChunks) {
        error += chunk;
      }

      if (error.toLocaleLowerCase().includes("no")) {
        res.status(500).json({
          message: "Barrier Observation Period dates are the same.",
        });
      }

      const americanBarrierChunks = await runnableRagChain.stream(
        "Is the string 'closing level' present between the sections titled 'Barrier Event' and 'Barrier Observation Period'?"
      );

      for await (const chunk of americanBarrierChunks) {
        result.isAmericanBarrier += chunk;
      }
    }

    console.log(result.isAmericanBarrier);

    result.isAmericanBarrier = isActiveFlag(result.isAmericanBarrier);

    // Delete the uploaded file from the server after processing is complete
    await fs.unlink(pdfPath);

    // Send the result back to the client
    res.json({ success: true, data: result });
  } catch (error) {
    // Log the error and send an error response if something goes wrong
    console.error(error);
    res.status(500).json({ message: "Error loading PDF" });
  }
};
