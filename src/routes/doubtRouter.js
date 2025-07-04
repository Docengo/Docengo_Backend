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



// Get all doubts for admin
doubtRouter.get('/allDoubts', userAuth, isAdmin, async (req, res) => {
  try {
    const doubts = await Doubt.find().populate('userId', 'fullName emailId');
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