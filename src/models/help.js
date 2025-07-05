// models/helpModel.js
const mongoose = require("mongoose");

const helpSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  city: { type: String },
  topic: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

const help = mongoose.model("help", helpSchema);
module.exports = help;
