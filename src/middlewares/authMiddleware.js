const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_jwt_secret",
    (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user; // user.id and user.email are available now
      next();
    }
  );
}

module.exports = authenticateToken;
