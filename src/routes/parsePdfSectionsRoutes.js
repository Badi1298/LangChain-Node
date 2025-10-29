const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const parsePdfSectionsController = require("../controllers/parsePdfSectionsController");

router.post("/vectorialise", upload.single("pdf"), parsePdfSectionsController.vectorialisePdf);
router.post("/overview", parsePdfSectionsController.getOverview);
router.post("/details", parsePdfSectionsController.getDetails);
router.post("/underlyings", parsePdfSectionsController.getUnderlyings);
router.post("/events", parsePdfSectionsController.getEvents);

module.exports = router;
