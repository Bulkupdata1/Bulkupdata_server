const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL Index for automatic expiration
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", OtpSchema);