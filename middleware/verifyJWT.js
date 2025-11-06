const User = require("../models/User");
const jwt = require("jsonwebtoken");

const verifyUserJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ error: "Token not found" });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
    const userId = decoded.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = user;
    req.role = user.role;

    next();
  } catch (error) {
    console.log("JWT verification error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyUserJWT;
