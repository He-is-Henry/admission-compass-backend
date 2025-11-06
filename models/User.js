const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  password: String,
  oLevel: [{ subject: String, grade: String }],
  sessions: [
    {
      device: String, // e.g., "Chrome on Android"
      location: String, // e.g., "Lagos, Nigeria"
      ipAddress: String, // from req.ip or headers
      accessToken: String, // optional: for tracing
      refreshToken: String, // the only session identifier needed
      userAgent: String, // raw user-agent string
      browser: String, // parsed (optional)
      os: String, // parsed (optional)
      platform: String, // "mobile" / "desktop"
      isMobile: Boolean, // optional
      lastUsed: { type: Date, default: Date.now }, // update on refresh
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  referredBy: { type: schema.Types.ObjectId },
  role: { type: String, enum: ["user", "admin", "parent"], default: "user" },
});

module.exports = mongoose.model("User", userSchema);
