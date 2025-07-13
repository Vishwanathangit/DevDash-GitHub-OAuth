const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  try {
    // ✅ Read token from secure cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Access token required",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Invalid token - user not found",
        success: false,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};

module.exports = { authenticateToken };
