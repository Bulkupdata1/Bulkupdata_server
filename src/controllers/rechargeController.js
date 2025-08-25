// controllers/rechargeController.js
const Recharge = require("../models/Recharge");

const handleRecharge = async (req, res) => {
  try {
    const { token, userId, rechargeData } = req.body;

    if (!token) {
      // just execute, no saving
      return res.status(200).json({ message: "Recharge executed (no token)" });
    }

    // token exists → save to DB
    const newRecharge = new Recharge({
      userId,
      ...rechargeData, // spreads all the fields (amount, batchId, etc.)
      transactionId: rechargeData.id, // rename "id" to transactionId
    });

    await newRecharge.save();

    res.status(201).json({
      message: "Recharge stored successfully",
      recharge: newRecharge,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing recharge" });
  }
};
