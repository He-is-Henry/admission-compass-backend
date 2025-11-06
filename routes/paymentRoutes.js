const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/", paymentController.initiatePayment);
router.post(
  "/confirm",
  express.raw({ type: "*/*" }),
  paymentController.paystackWebhook
);

module.exports = router;
