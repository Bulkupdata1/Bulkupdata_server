const jwt = require("jsonwebtoken");

module.exports = function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "1h" }
  );
};