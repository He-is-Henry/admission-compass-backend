const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const verifyUserJWT = require("../middleware/verifyJWT");

router.post("/", verifyUserJWT, paymentController.initiatePayment);
router.post(
  "/webhook",
  express.raw({ type: "*/*" }),
  verifyUserJWT,
  paymentController.paystackWebhook
);

module.exports = router;
