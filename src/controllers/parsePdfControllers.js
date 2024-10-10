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

const Frequencies = Object.freeze({
  NO_COUPON: 0,
  MONTHLY: 1,
  QUARTERLY: 2,
  SEMI_ANNUALLY: 3,
  ANNUALLY: 4,
  OTHER: 5,
  IN_FINE: 6,
});

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
      underlyings: "",
    };

    // Execute all queries (streams) concurrently
    const [
      flagChunks,
      maturityChunks,
      frequencyChunks,
      denominationChunks,
      couponLevelChunks,
      underlyingsChunks,
    ] = await Promise.all([
      runnableRagChain.stream(
        "Does the document have the exact string 'Barrier Event'?"
      ),
      runnableRagChain.stream(
        "The difference in days between the Initial Fixing Date and the Final Fixing Date. Display only the number."
      ),
      runnableRagChain.stream(
        "How many Coupon Amount(s) and Coupon Payment Date(s) are there? Display only the amount as a number."
      ),
      runnableRagChain.stream(
        "What is the value of the Denomination? Display only the value without the currency."
      ),
      runnableRagChain.stream(
        "For the Coupon Amount(s) and Coupon Payment Date(s), are the values payed on all the different dates the same? Display only the value without currency if yes, say 'no' otherwise."
      ),
      runnableRagChain.stream(
        "From the table in the PDF under the heading 'Underlying,' extract the text in the first column labeled 'Underlying.' I only need the names of the underlying entities, like 'BANCO SANTANDER SA,' 'BARCLAYS PLC,' and 'CREDIT AGRICOLE SA.'"
      ),
    ]);

    for await (const chunk of maturityChunks) {
      result.maturity += chunk;
    }

    result.maturity = Math.round(parseInt(result.maturity) / 30);

    for await (const chunk of frequencyChunks) {
      result.frequency += chunk;
    }

    result.frequency = result.maturity / parseInt(result.frequency);

    if (result.frequency === result.maturity) {
      result.frequency = Frequencies.IN_FINE;
    } else if (result.frequency === 1) {
      result.frequency = Frequencies.MONTHLY;
    } else if (result.frequency === 3) {
      result.frequency = Frequencies.QUARTERLY;
    } else if (result.frequency === 6) {
      result.frequency = Frequencies.SEMI_ANNUALLY;
    } else if (result.frequency === 12) {
      result.frequency = Frequencies.ANNUALLY;
    }

    for await (const chunk of denominationChunks) {
      result.denomination += chunk;
    }

    for await (const chunk of couponLevelChunks) {
      result.couponLevel += chunk;
    }

    result.couponLevel = formatNumber(
      (100 * parseFloat(result.couponLevel)) / parseFloat(result.denomination)
    );

    for await (const chunk of underlyingsChunks) {
      result.underlyings += chunk;
    }

    console.log(result.underlyings);

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
