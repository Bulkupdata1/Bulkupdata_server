const express = require("express");
const router = express.Router();
const { sendOtpEmail, sendFeedbackEmail } = require("../utils/emailService"); // Import the email service utility

const User = require("../models/User");
const Otp = require("../models/Otp");

const generateOtp = require("../utils/generateOtp");
const generateToken = require("../utils/generateToken");
const authenticateToken = require("../middlewares/authMiddleware");
const BundleTransaction = require("../models/BundleTransaction");
const Feedback = require("../models/Feedback");

// REGISTER


router.post("/submit-a-feedback", async (req, res) => {
  try {
    const { name, email, suggestion } = req.body;

    if (!name || !email || !suggestion) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 1️⃣ Save feedback in DB
    const newFeedback = new Feedback({ name, email, suggestion });
    await newFeedback.save();

    // 2️⃣ Send feedback email to support
    // 3️⃣ Send confirmation email back to user
    await sendFeedbackEmail({ name, email, suggestion });

    return res.status(201).json({
      success: true,
      message: "Thanks for your suggestion! We've logged it and will respond soon.",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});
// GET ALL FEEDBACKS
router.get("/get-all/all-users-feedbacks", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ message: "Server error." });
  }
});
router.post("/register", async (req, res) => {
  const { name, email } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    await User.create({ name, email });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Call the email service to send the OTP
    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      console.warn(`Failed to send OTP email to ${email}.`);
      // You might choose to return an error to the client here, or just log it
      // return res.status(500).json({ message: "Failed to send OTP email." });
    }

    res.json({ message: "User registered. OTP sent." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// RESEND OTP
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Call the email service to send the OTP
    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      console.warn(`Failed to resend OTP email to ${email}.`);
    }

    res.json({ message: "OTP resent." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  console.log("✅ Received OTP verification request");
  console.log("📨 Request body:", { email, otp });

  try {
    const record = await Otp.findOne({ email, otp });
    console.log("🔍 OTP record found:", record);

    if (!record) {
      console.log("❌ No OTP record matches the provided email and OTP");
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > record.expiresAt) {
      console.log("⏰ OTP expired at:", record.expiresAt);
      return res.status(400).json({ message: "OTP expired" });
    }

    const user = await User.findOne({ email });
    console.log("👤 User found:", user);

    if (!user) {
      console.log("❌ No user found for the email");
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateToken(user);
    console.log("🔐 Access token generated:", token);

    await Otp.deleteOne({ email }); // Delete OTP after successful verification
    console.log("🧹 OTP record deleted for:", email);

    res.json({
      message: "OTP verified",
      token,
      userId: user._id, // ✅ include userId
    });
  } catch (err) {
    console.log("💥 Server error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LOGIN (send OTP)
router.post("/login", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Call the email service to send the OTP
    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      console.warn(`Failed to send OTP email to ${email}.`);
    }

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const transactionData = {
      ...req.body,
      userId,
    };

    const transaction = await BundleTransaction.create(transactionData);

    res.status(201).json({
      message: "Bundle transaction created successfully",
      transaction,
    });
  } catch (err) {
    console.error("❌ Error creating bundle transaction:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
