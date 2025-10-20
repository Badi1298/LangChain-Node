const express = require("express");
const router = express.Router();
const parsePdfSectionsController = require("../controllers/parsePdfSectionsController");

router.post("/overview", parsePdfSectionsController.getOverview);
router.post("/details", parsePdfSectionsController.getDetails);
router.post("/underlyings", parsePdfSectionsController.getUnderlyings);
router.post("/events", parsePdfSectionsController.getEvents);

module.exports = router;
