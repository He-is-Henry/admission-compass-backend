const User = require("../models/User");

const verifyUserJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.user;

    if (!token) {
      return res.status(401).json({ error: "Token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
