// models/Recharge.js
const mongoose = require("mongoose");

const rechargeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      //required: true,
    },
    network: { type: String },
    amount: { type: Number, required: true },
    batchId: { type: String },
    customIdentifier: { type: String },
    transactionId: { type: String }, // alias for "id" field
    operatorId: { type: Number },
    operatorNickname: { type: String },
    planType: { type: String },
    recipientEmail: { type: String },
    recipientPhone: {
      countryCode: { type: String },
      number: { type: String },
    },
    retailDataAmount: { type: String }, // e.g. "1GB"
    retailPrice: { type: Number },
    senderPhone: {
      countryCode: { type: String },
      number: { type: String },
    },
    status: { type: String, default: "pending" },
    type: { type: String }, // e.g. "Data"
    useLocalAmount: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recharge", rechargeSchema);
