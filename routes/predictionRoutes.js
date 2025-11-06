const express = require("express");
const router = express.Router();
const predictionController = require("../controllers/predictionControllers");

router.get("/lasu", predictionController.predictLASU);
router.get("/eksu", predictionController.predictEKSU);

module.exports = router;
