const path = require("path");
const fs = require("fs").promises; // Using fs promises to delete files asynchronously

const { initializeRagChain } = require("../services/ragChain");

const {
  getIssuer,
  isNotional,
} = require("../services/product-information/parseProductInformation");

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
    const [issuerData, notional, isin, currency] = await Promise.all([
      runnableRagChain.invoke(
        "Can you tell me who the Issuer is from the General Information section?"
      ),
      runnableRagChain.invoke(
        "What is the Issue Price and Issue Size inside the Product Details section?"
      ),
      runnableRagChain.invoke(
        "What is the ISIN found inside the Product Details section? Display only the ISIN itself."
      ),
      runnableRagChain.invoke("What is the currency?"),
    ]);

    if (issuerData.toLocaleLowerCase().includes("i don't know"))
      throw new Error();

    issuer = getIssuer(issuerData);
    result.issuer = issuer.id;
    result.issuer_code = issuer.issuer_code;

    result.notional = isNotional(notional);
    result.isin = isin;
    result.currency = currency;

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
