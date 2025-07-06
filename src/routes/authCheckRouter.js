// ✅ Protected route using userAuth middleware
const express = require("express");
const authCheckRouter = express.Router();
const { userAuth } = require("../middlewares/auth");

authCheckRouter.get("/check", userAuth, (req, res) => {
  res.status(200).json({ authenticated: true, user: req.user });
});

module.exports = authCheckRouter;
