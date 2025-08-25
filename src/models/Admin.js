// models/Admin.js
const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // You might add roles here if different levels of admin are needed
    // role: {
    //   type: String,
    //   enum: ['superadmin', 'editor', 'viewer'],
    //   default: 'viewer'
    // }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);