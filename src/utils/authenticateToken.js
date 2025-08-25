// middleware/auth.js
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_jwt_secret",
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }
      req.user = user; // attach decoded user info to request
      next();
    }
  );
}

module.exports = authenticateToken;
