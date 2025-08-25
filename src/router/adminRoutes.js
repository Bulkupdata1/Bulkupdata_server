const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../utils/emailService"); // Import the email service utility

// Import Admin specific models from their respective files
const Admin = require("../models/Admin");
const AdminOtp = require("../models/AdminOtp");
const User = require("../models/User");

// --- Utility Functions ---

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (admin, isAdmin = false) => {
  const payload = {
    id: admin._id,
    email: admin.email,
    isAdmin: isAdmin,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || "your_admin_secret_key", {
    expiresIn: "1h",
  });
};

const authenticateAdminToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_admin_secret_key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
      }
      if (!user.isAdmin) {
        return res
          .status(403)
          .json({ message: "Access denied. Admin privileges required." });
      }
      req.user = user;
      next();
    }
  );
};

// --- Admin Routes ---

// CREATE ADMIN
// IMPORTANT: This route should be highly secured in a production environment.
// It's recommended to only allow super-admins to create new admins,
// or to use this route only for initial setup and then disable it.
router.post("/create-admin", async (req, res) => {
  const { name, email } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin with this email already exists." });
    }

    const newAdmin = await Admin.create({ name, email });
    res.status(201).json({
      message: "Admin account created successfully.",
      admin: newAdmin,
    });
  } catch (err) {
    console.error("Error creating admin:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ADMIN LOGIN (Send OTP)
router.post("/login", async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin not found with this email." });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    await AdminOtp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true } // Creates a new record if not found, otherwise updates
    );

    // Call the email service to send the OTP
    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      console.warn(`Failed to send OTP email to ${email}.`);
      // You might choose to return an error to the client here, or just log it
      // return res.status(500).json({ message: "Failed to send OTP email." });
    }

    res.json({ message: "OTP sent to your admin email." });
  } catch (err) {
    console.error("Error in admin login:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ADMIN RESEND OTP
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await AdminOtp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Call the email service to send the OTP
    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      console.warn(`Failed to resend OTP email to ${email}.`);
    }

    res.json({ message: "New OTP sent to your admin email." });
  } catch (err) {
    console.error("Error in admin resend OTP:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ADMIN VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await AdminOtp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP or email." });
    }

    if (new Date() > record.expiresAt) {
      await AdminOtp.deleteOne({ email }); // Delete expired OTP
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin user not found." });
    }

    const token = generateToken(admin, true);

    await AdminOtp.deleteOne({ email }); // Delete OTP after successful verification

    res.json({
      message: "Admin OTP verified successfully!",
      token,
      userId: admin._id,
      isAdmin: true,
      admin: admin?.name,
    });
  } catch (err) {
    console.error("Error in admin OTP verification:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Example of an admin-protected route
router.get("/dashboard-data", authenticateAdminToken, async (req, res) => {
  try {
    res.json({
      message: "Welcome to the Admin Dashboard!",
      adminId: req.user.id,
      adminEmail: req.user.email,
    });
  } catch (err) {
    console.error("Error fetching admin dashboard data:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/users-for-admin", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Server error. Could not fetch users." });
  }
});


module.exports = router;
