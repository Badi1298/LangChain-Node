const path = require("path");
const fs = require("fs").promises; // Using fs promises to delete files asynchronously

const { initializeRagChain } = require("../services/initializeRagChain");

const queries = require("../utils/queries/productDetailsQueries");
const {
  isActiveFlag,
  parseUnderlyings,
  computeFrequency,
  parseInitialFixings,
  calculateCouponLevel,
  checkBarrierConditions,
  computeRedemptionType,
} = require("../services/product-details/parseProductDetails");

/**
 * Parses product details from an uploaded PDF file, extracting information such as
 * low strike status, maturity, frequency, denomination, coupon level, underlyings, and initial fixings.
 *
 * @param {Object} req - The request object containing the uploaded file.
 * @param {Object} res - The response object used to send the result or errors back to the client.
 *
 * @returns {void}
 *
 * @throws Will throw an error if no file is uploaded, if invalid data is returned, or if there is an issue with PDF processing or file deletion.
 */
exports.parseProductDetailsTermsheet = async (req, res) => {
  try {
    // Check if a file has been uploaded with the request.
    if (!req.file) {
      // Return a 400 Bad Request response if no file is found.
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the full file path of the uploaded PDF.
    const pdfPath = path.join(process.cwd(), req.file.path);

    // Initialize the Retrieval-Augmented Generation (RAG) chain to process the PDF.
    const runnableRagChain = await initializeRagChain(pdfPath);

    // Execute all query streams concurrently to extract specific product details.
    const [
      isLowStrike, // Low strike flag.
      maturity, // Maturity of the product in days.
      frequency, // Frequency of coupon payments.
      denomination, // Denomination of the product.
      couponLevel, // Coupon level of the product.
      capitalProtectionLevel,
      redemptionType,
      underlyings, // Information about the underlying assets.
      initialFixings, // Initial fixings of the product.
    ] = await Promise.all(
      queries[9][9].map((query) => runnableRagChain.invoke(query))
    );

    // Construct the result object containing the extracted data.
    const result = {
      isLowStrike: isActiveFlag(isLowStrike), // Determine if the low strike flag is active.
      underlyings: parseUnderlyings(underlyings), // Parse the underlying asset information.
      initialFixings: parseInitialFixings(initialFixings), // Parse the initial fixings of the product.
    };

    const prefillPanel = [
      {
        key: "MATU",
        value: Math.round(parseInt(maturity) / 30),
      },
      {
        key: "FREQ",
        value: computeFrequency(Math.round(parseInt(maturity) / 30), frequency),
      },
      {
        key: "CPN_LEVEL_PP",
        value: calculateCouponLevel(couponLevel, denomination),
      },
      {
        key: "K_PROTECT_LEVEL",
        value: capitalProtectionLevel,
      },
      {
        key: "CASH_PHY",
        value: computeRedemptionType(redemptionType),
      },
    ];

    // Perform additional checks on barrier conditions related to the product.
    await checkBarrierConditions(result, runnableRagChain);

    // Send the extracted data back to the client as a successful JSON response.
    res.json({ success: true, data: result, prefillPanel });
  } catch (error) {
    // Log the error details in the server console.
    console.error(error);

    // Send a 500 Internal Server Error response with an appropriate error message.
    res.status(500).json({ message: "Error loading PDF" });
  } finally {
    // Ensure the uploaded file is deleted, even if an error occurs.
    if (req.file) {
      const pdfPath = path.join(process.cwd(), req.file.path);
      try {
        await fs.unlink(pdfPath);
      } catch (unlinkError) {
        // Log any errors that occur during file deletion.
        console.error("Error deleting file:", unlinkError.message);
      }
    }
  }
};
