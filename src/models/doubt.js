const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topic:{
    type: String,
    required:true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Doubt", doubtSchema);
