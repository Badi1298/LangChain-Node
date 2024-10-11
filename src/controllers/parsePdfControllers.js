const path = require("path");
const fs = require("fs").promises; // Using fs promises to delete files asynchronously

const { initializeRagChain } = require("../services/ragChain");

const queries = require("../utils/productDetailsQueries");
const {
  isActiveFlag,
  parseUnderlyings,
  computeFrequency,
  parseInitialFixings,
  calculateCouponLevel,
  checkBarrierConditions,
} = require("../services/product-details/parseProductDetailsPdf");

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
          "Can you tell me who the Issuer is from the General Information section?"
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

    if (issuer.toLocaleLowerCase().includes("i don't know")) throw new Error();

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
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const pdfPath = path.join(process.cwd(), req.file.path);
    const runnableRagChain = await initializeRagChain(pdfPath);

    const [
      isLowStrike,
      maturity,
      frequency,
      denomination,
      couponLevel,
      underlyings,
      initialFixings,
    ] = await Promise.all(
      queries[9].map((query) => runnableRagChain.invoke(query))
    );

    const result = {
      isLowStrike: isActiveFlag(isLowStrike),
      maturity: Math.round(parseInt(maturity) / 30),
      frequency: computeFrequency(
        Math.round(parseInt(maturity) / 30),
        frequency
      ),
      denomination,
      couponLevel: calculateCouponLevel(couponLevel, denomination),
      underlyings: parseUnderlyings(underlyings),
      initialFixings: parseInitialFixings(initialFixings),
    };

    await checkBarrierConditions(result, runnableRagChain);

    await fs.unlink(pdfPath);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading PDF" });
  }
};
