const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// GitHub OAuth login start
router.get("/github", (req, res, next) => {
  const redirectTo = req.query.redirectTo || "/dashboard";
  passport.authenticate("github", {
    scope: ["user:email", "repo"],
    state: encodeURIComponent(redirectTo),
  })(req, res, next);
});

// GitHub OAuth callback
router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/api/auth/login",
  }),
  (req, res) => {
    try {
    const token = jwt.sign(
      {
        userId: req.user._id,
        username: req.user.username,
        email: req.user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectTo = decodeURIComponent(req.query.state || "/dashboard");

    // ✅ Set token as secure HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // false for development HTTP
        sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax", // Lax for development
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Redirect without exposing token/user in URL
    res.redirect(`${frontendUrl}${redirectTo}`);
    } catch (error) {
      console.error("Error in GitHub callback:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
);

// Authenticated profile route
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    res.json({
      message: "User profile fetched successfully",
      user: {
        id: req.user._id,
        username: req.user.username,
        displayName: req.user.displayName,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl,
      },
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
      success: false,
    });
  }
});

// Logout route (clears cookie)
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
  });
  res.json({
    message: "Logout successful",
    success: true,
  });
});

// GitHub login check (optional)
router.get("/login", (req, res) => {
  if (req.user) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/dashboard`);
  }
  res.json({ message: "Please authenticate via GitHub", success: false });
});

module.exports = router;
