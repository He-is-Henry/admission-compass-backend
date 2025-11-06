const mongoose = require("mongoose");
const schema = mongoose.Schema;

const invitationSchema = new schema({
  referrer: { type: schema.Types.ObjectId, ref: "User", required: true },
  referred: { type: schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("invitation", invitationSchema);
