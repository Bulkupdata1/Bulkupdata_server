const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    suggestion: { type: String, required: true },
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model("Feedback", feedbackSchema);