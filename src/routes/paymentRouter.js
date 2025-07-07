const express = require("express");
const Payment = require("../models/payment.js");
const { userAuth } = require("../middlewares/auth.js");

const paymentRouter = express.Router();

// Submit a new payment
paymentRouter.post("/submit", userAuth, async (req, res) => {
  try {
    let { name, transactionId, note } = req.body;

    // Trim and validate inputs
    name = name?.trim();
    transactionId = transactionId?.trim();
    note = note?.trim();

    if (!name || !transactionId) {
      return res.status(400).json({ error: "Name and Transaction ID are required." });
    }

    // Check for duplicate transaction
    const existing = await Payment.findOne({ transactionId });
    if (existing) {
      return res.status(409).json({ error: "Transaction ID already exists." });
    }

    const payment = new Payment({
      userId: req.user._id,
      name,
      transactionId,
      note,
    });

    await payment.save();

    return res.status(201).json({
      message: "Payment submitted successfully. It will be verified within 24 hours.",
      data: payment, // Optional: return saved payment info
    });
  } catch (error) {
    console.error("Payment submission error:", error.message);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
});

module.exports = paymentRouter;
