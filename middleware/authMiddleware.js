const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Authorization failed", error: err.message });
  }
};


// Role-based access control middleware
exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    // Make sure user is already set by protect middleware
    if (!req.user) {
      return res.status(401).json({ status: false, msg: "Not authorized" });
    }

    // Check if user's role matches any allowed role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: false, msg: "Access denied: insufficient role" });
    }

    // Proceed to next middleware or route handler
    next();
  };
};

