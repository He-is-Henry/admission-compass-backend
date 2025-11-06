const crypto = require("crypto");
const Payment = require("../models/Payment.js");
const axios = require("axios");

const initiatePayment = async (req, res) => {
  try {
    const { id, email, name } = req.user;
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: 1000 * 100,
        currency: "NGN",
        metadata: {
          id,
          name,
        },
        callback_url: `${process.env.FRONTEND_URL}/pay/success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    res.json({ url: response.data.data.authorization_url });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};

const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // Validate Paystack signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.body)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Parse event
    const event = JSON.parse(req.body);

    // Only handle successful charge events
    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const data = event.data;

    // Avoid duplicated writes
    const existing = await Payment.findOne({ reference: data.reference });
    if (existing) {
      return res.sendStatus(200);
    }

    // Save payment
    await Payment.create({
      reference: data.reference,
      amount: data.amount / 100, // kobo → naira
      user: data.metadata.id,
    });

    return res.sendStatus(200);
  } catch (err) {
    console.log("Webhook error:", err);
    return res.sendStatus(500);
  }
};

module.exports = {
  initiatePayment,
  paystackWebhook,
};
