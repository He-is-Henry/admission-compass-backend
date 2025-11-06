const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyUserJWT = require("../middleware/verifyJWT");

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.get("/refresh", authController.handleRefresh);
router.get("/current", verifyUserJWT, authController.getCurrentUser);

module.exports = router;
