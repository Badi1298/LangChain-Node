const path = require("path");
const fs = require("fs").promises; // Using fs promises to delete files asynchronously

const { initializeRag } = require("../services/initializeRag");

const queries = require("../utils/productDetailsQueries");
const {
  isActiveFlag,
  parseUnderlyings,
  computeFrequency,
  parseInitialFixings,
  calculateCouponLevel,
  checkBarrierConditions,
} = require("../services/product-details/parseProductDetails");

exports.parseProductDetailsTermsheet = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const pdfPath = path.join(process.cwd(), req.file.path);
    const runnableRagChain = await initializeRag(pdfPath);

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
