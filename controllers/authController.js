const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getClientInfo } = require("../utils/getClientInfo");
const { createInvitation } = require("./invitationController");
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";
const ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY;
const REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY;

const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, parent } = req.body;
    const { ref } = req.query;
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists)
      return res.status(409).json({ error: "Email already exists" });
    const hashed = await bcrypt.hash(password, 10);
    if (!firstName || lastName || email || password)
      return res.status(400).json({ error: "Incomplete info" });
    const referrer = await User.findById(ref);
    if (!referrer) return res.status(400).json({ error: "Invalid ref" });
    const role = parent ? "parent" : "user";
    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      password: hashed,
      role,
    });
    const { password: pwd, sessions, ...filtered } = user;

    if (ref) await createInvitation(ref, user._id);
    res.json(filtered);
  } catch (err) {
    console.log(err);
  }
};

const login = async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password)
    return res.status(400).json({ error: "Email and password are required" });
  let message = "Success, ";
  try {
    const existingToken = req.cookies?.jwt;
    console.log(existingToken);
    let tokenUserId = null;

    if (existingToken) {
      try {
        const decoded = jwt.verify(existingToken, REFRESH_TOKEN_KEY);
        tokenUserId = decoded?.id;
        const existingUser = await User.findById(tokenUserId);
        if (existingUser) {
          existingUser.sessions = existingUser.sessions.filter(
            (s) => s.refreshToken !== existingToken
          );
          await existingUser.save();
        }
      } catch (err) {
        console.log("Invalid or expired token, skipping cleanup.");
      }
    }
    const user = await User.findOne({
      $or: [{ email: id }, { username: id }],
    });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.sendStatus(401);
    // Step 3: Enforce session limit
    if (user.sessions.length >= 5) {
      user.sessions.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      user.sessions.shift(); // remove oldest
    }

    // Step 4: Create tokens
    const payload = { id: user._id, email: user.email };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_KEY, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_KEY, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    // Step 5: Store session
    const client = getClientInfo(req);
    user.sessions.push({
      refreshToken,
      accessToken,
      createdAt: new Date(),
      ...client,
    });
    await user.save();

    // Step 6: Send response with cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.sendStatus(500);
    console.log(err);
  }
};

const handleRefresh = async (req, res) => {
  const token = req?.cookies?.jwt;
  if (!token) return res.status(401).json({ error: "No token found" });
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("!user");
      return res.status(403).json({ error: "Token invalid or expired" });
    }
    console.log(token);
    console.log(user.sessions.map((session) => session.refreshToken));
    const match = user.sessions.find(
      (session) => session.refreshToken === token
    );
    if (!match) {
      console.log("!match");
      return res.status(403).json({ error: "Token invalid or expired" });
    }
    user.sessions = user.sessions.filter(
      (session) => session.refreshToken !== token
    );
    const payload = { id: user._id, email: user.email };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
    const { createdAt, ...client } = getClientInfo(req);
    user.sessions.push({
      refreshToken,
      accessToken,
      createdAt: match.createdAt,
      lastUsed: Date.now(),
      ...client,
    });
    await user.save();
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user: { id: user._id, name: user.name } });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { signup, login, handleRefresh };
