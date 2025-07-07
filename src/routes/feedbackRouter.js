const express = require("express");
const feedbackRouter = express.Router();
const Feedback = require("../models/feedback");
const { userAuth } = require("../middlewares/auth.js");
const { isAdmin } = require("../middlewares/isAdmin.js");


// POST - Submit feedback
feedbackRouter.post("/submit", async (req, res) => {
  try {
    const { name, message, rating } = req.body;

    if (!name || !message || !rating) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const feedback = new Feedback({ name, message, rating });
    await feedback.save();

    res.status(201).json({ message: "Feedback submitted successfully." });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// GET: Admin fetches all feedback entries
feedbackRouter.get("/allFeedbacks", userAuth, isAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch feedbacks" });
  }
});


module.exports = feedbackRouter;
