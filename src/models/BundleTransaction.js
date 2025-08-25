const mongoose = require("mongoose");

const BundleTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming there's a User model
      required: true,
    },

    type: {
      type: String,
      enum: ["Data", "Airtime"],
      required: true,
    },

    network: {
      type: String,
      required: true,
    },

    operatorId: {
      type: Number,
      required: true,
    },

    customIdentifier: {
      type: String,
      required: true,
    },

    recipientEmail: {
      type: String,
      required: true,
    },

    recipientPhone: {
      type: String, // Changed from PhoneSchema
      required: true,
    },

    senderPhone: {
      type: String, // Changed from PhoneSchema
      required: true,
    },

    useLocalAmount: {
      type: Boolean,
      default: true,
    },

    buyData: {
      type: Boolean,
      required: true,
    },

    // Fields for Data bundles
    amount: Number,
    bundle: mongoose.Schema.Types.Mixed,
    budDataAmount: String,
    budPrice: Number,
    description: String,
    planAmount: Number,
    planType: String,
    retailDataAmount: String,
    retailPrice: Number,

    // Fields for Airtime
    fixedPrice: Number,
    price: Number,

    id: {
      type: String, // The unique ID (like uuid)
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BundleTransaction", BundleTransactionSchema);