const express = require('express');
const doubtRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const {isAdmin} = require("../middlewares/isAdmin.js")
const Doubt = require('../models/doubt');



//Post Doubts
doubtRouter.post('/submit', userAuth, async (req, res) => {
  try {
    const { subject, topic, question } = req.body;
    const doubt = new Doubt({
      userId: req.user._id,
      subject,
      topic,
      question
    });
    await doubt.save();
    res.status(201).json({ message: 'Doubt submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit doubt' });
    console.log(err)
  }
});


//Get user's Doubts
doubtRouter.get('/myDoubts', userAuth, async (req, res) => {
  try {
    const doubts = await Doubt.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(doubts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching doubts' });
  }
});


// Delete own doubt (only if less than 1 hour old)
doubtRouter.delete('/delete/:id', userAuth, async (req, res) => {
  try {
    const doubt = await Doubt.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!doubt) return res.status(403).send("Unauthorized or doubt not found");

    const now = new Date();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    const timeSinceCreation = now - doubt.createdAt;

    if (timeSinceCreation > oneHour) {
      return res.status(403).send("❌ Doubt can only be deleted within 1 hour of creation");
    }

    await doubt.deleteOne(); // or await Doubt.findByIdAndDelete(doubt._id);
    res.json({ message: "✅ Doubt deleted successfully" });

  } catch (err) {
    console.error("Error deleting doubt:", err);
    res.status(500).send("Internal server error");
  }
});




// Get all unanswered doubts for admin
doubtRouter.get('/allDoubts', userAuth, isAdmin, async (req, res) => {
  try {
    const doubts = await Doubt.find({ answer: { $in: [null, ""] } }).populate('userId', 'fullName emailId');
    res.json(doubts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching all doubts' });
  }
});


//To post answers by admin
doubtRouter.patch('/answer/:id', userAuth, isAdmin, async (req, res) => {
  try {
    const doubtId = req.params.id;
    const { answer } = req.body;

    const doubt = await Doubt.findByIdAndUpdate(
      doubtId,
      { answer },
      { new: true }
    );

    res.json({ message: "Answer submitted", doubt });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit answer" });
  }
});




module.exports = doubtRouter;