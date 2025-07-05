// routes/helpRouter.js
const express = require("express");
const helpRouter = express.Router();
const help = require("../models/help");
const { userAuth } = require("../middlewares/auth.js");


// POST: Submit Help Form
helpRouter.post("/submit", userAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, city, topic, description } = req.body;

    if (!firstName || !lastName || !email || !topic || !description) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    const helpRequest = new help({ firstName, lastName, email, city, topic, description });
    await helpRequest.save();

    res.status(200).json({ message: "Help request submitted successfully!" });
  } catch (err) {
    console.error("Help form error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
});

module.exports = helpRouter;
