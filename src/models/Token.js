// models/Token.js
const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  accessToken: {
    type: String,
    required: true,
  },
  expiresIn: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
