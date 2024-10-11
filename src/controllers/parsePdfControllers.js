const path = require("path");
const fs = require("fs").promises; // Using fs promises to delete files asynchronously

const { initializeRagChain } = require("../services/ragChain");
const {
  isActiveFlag,
  parseUnderlyings,
  computeFrequency,
  parseInitialFixings,
  calculateCouponLevel,
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

function formatNumber(num) {
  // Convert the number to a string with at least 2 decimal places
  let formatted = num.toFixed(2);

  // Remove trailing zeros if they are not necessary
  formatted = formatted.replace(/(\.\d*?[1-9])0+$/g, "$1"); // Remove extra zeros after meaningful decimals
  formatted = formatted.replace(/\.00$/g, ""); // Remove ".00" if there are no decimal digits left

  return formatted;
}

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
      maturity: "",
      frequency: "",
      denomination: "",
      couponLevel: "",
      underlyings: [],
      initialFixings: [],
    };

    // Execute all queries (streams) concurrently
    const [
      flagChunks,
      maturity,
      frequency,
      denomination,
      couponLevel,
      underlyings,
      initialFixings,
    ] = await Promise.all([
      runnableRagChain.stream(
        "Does the document have the exact string 'Barrier Event'?"
      ),
      runnableRagChain.invoke(
        "The difference in days between the Initial Fixing Date and the Final Fixing Date. Display only the number."
      ),
      runnableRagChain.invoke(
        "How many Coupon Amount(s) and Coupon Payment Date(s) are there? Display only the amount as a number."
      ),
      runnableRagChain.invoke(
        "What is the value of the Denomination? Display only the value without the currency."
      ),
      runnableRagChain.invoke(
        "For the Coupon Amount(s) and Coupon Payment Date(s), are the values payed on all the different dates the same? Display only the value without currency if yes, say 'no' otherwise."
      ),
      runnableRagChain.invoke(
        "What are the name and the Bloomberg Tickers of the underlyings inside the Underlying table? Display the tickers only."
      ),
      runnableRagChain.invoke(
        "What are the Initial Fixing Level (100%) of the underlyings inside the Underlying table? Display only the fixings values without currency separated by commas."
      ),
    ]);

    result.maturity = Math.round(parseInt(maturity) / 30);
    result.frequency = computeFrequency(result.maturity, frequency);

    result.denomination = denomination;
    result.couponLevel = calculateCouponLevel(couponLevel, result.denomination);

    console.log(underlyings);
    result.underlyings = parseUnderlyings(underlyings);

    console.log(initialFixings);
    result.initialFixings = parseInitialFixings(initialFixings);

    // -----------------------------------------------------------

    for await (const chunk of flagChunks) {
      result.isLowStrike += chunk;
    }

    result.isLowStrike = isActiveFlag(result.isLowStrike);

    if (!result.isLowStrike) {
      const europeanBarrierChunks = await runnableRagChain.stream(
        "Does the document contain the text 'Barrier Observation Period'?"
      );

      for await (const chunk of europeanBarrierChunks) {
        result.isEuropeanBarrier += chunk;
      }
    }

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
        throw new Error();
      }

      const americanBarrierChunks = await runnableRagChain.stream(
        "Is the string 'closing level' present between the sections titled 'Barrier Event' and 'Barrier Observation Period'?"
      );

      for await (const chunk of americanBarrierChunks) {
        result.isAmericanBarrier += chunk;
      }
    }

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
