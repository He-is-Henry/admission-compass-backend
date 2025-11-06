const mongoose = require("mongoose");
const schema = mongoose.Schema;

const paymentSchema = new schema(
  {
    user: { type: schema.Types.ObjectId },
    reference: { type: String, unique: true },
    status: String,
    quantity: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
