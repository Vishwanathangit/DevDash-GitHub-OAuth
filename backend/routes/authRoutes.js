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
      console.log("🔐 GitHub callback received for user:", req.user?.username);
      
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

      // ✅ Enhanced cookie configuration for production
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/", // Explicit path
      };

      // Handle domain configuration for production
      if (process.env.NODE_ENV === "production") {
        if (process.env.COOKIE_DOMAIN) {
          cookieOptions.domain = process.env.COOKIE_DOMAIN;
          console.log("🍪 Using explicit cookie domain:", process.env.COOKIE_DOMAIN);
        } else {
          // Auto-detect domain from frontend URL
          try {
            const url = new URL(frontendUrl);
            if (url.hostname !== "localhost") {
              // For onrender.com domains, we need to handle subdomains properly
              if (url.hostname.includes('onrender.com')) {
                // Extract the subdomain part for onrender.com
                const subdomain = url.hostname.split('.')[0];
                cookieOptions.domain = `.onrender.com`;
                console.log("🍪 Using onrender.com cookie domain:", cookieOptions.domain);
              } else {
                cookieOptions.domain = url.hostname;
                console.log("🍪 Using auto-detected cookie domain:", cookieOptions.domain);
              }
            }
          } catch (error) {
            console.warn("Could not parse frontend URL for cookie domain:", error);
          }
        }
      }

      console.log("🍪 Setting cookie with options:", cookieOptions);
      console.log("🔗 Frontend URL:", frontendUrl);
      console.log("🎯 Redirecting to:", `${frontendUrl}${redirectTo}`);

      // Set the token cookie
      res.cookie("token", token, cookieOptions);

      console.log("✅ Token cookie set successfully");
      console.log("🔗 Redirecting to:", `${frontendUrl}${redirectTo}`);

      // ✅ Redirect without exposing token/user in URL
      res.redirect(`${frontendUrl}${redirectTo}`);
    } catch (error) {
      console.error("❌ Error in GitHub callback:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
);

// Authenticated profile route
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    console.log("👤 Profile request from user:", req.user.username);

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
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
      success: false,
    });
  }
});

// Logout route (clears cookie with matching options)
router.post("/logout", (req, res) => {
  try {
    console.log("🚪 Logging out user...");

    // ✅ Clear cookie with EXACT same options as when it was set
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/", // Must match the path used when setting the cookie
    };

    // Handle domain configuration for production
    if (process.env.NODE_ENV === "production") {
      if (process.env.COOKIE_DOMAIN) {
        cookieOptions.domain = process.env.COOKIE_DOMAIN;
      } else {
        // Auto-detect domain from frontend URL
        try {
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
          const url = new URL(frontendUrl);
          if (url.hostname !== "localhost") {
            // For onrender.com domains, we need to handle subdomains properly
            if (url.hostname.includes('onrender.com')) {
              cookieOptions.domain = `.onrender.com`;
            } else {
              cookieOptions.domain = url.hostname;
            }
          }
        } catch (error) {
          console.warn("Could not parse frontend URL for cookie domain:", error);
        }
      }
    }

    res.clearCookie("token", cookieOptions);

    console.log("✅ Token cookie cleared successfully");
    console.log("🍪 Clear cookie options:", cookieOptions);

    res.json({
      message: "Logout successful",
      success: true,
    });
  } catch (error) {
    console.error("❌ Error during logout:", error);
    res.status(500).json({
      message: "Error during logout",
      error: error.message,
      success: false,
    });
  }
});

// GitHub login check (optional)
router.get("/login", (req, res) => {
  if (req.user) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/dashboard`);
  }
  res.json({ message: "Please authenticate via GitHub", success: false });
});

// Health check route for debugging
router.get("/health", (req, res) => {
  res.json({
    message: "Auth service is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    success: true,
  });
});

// Debug route to check cookie presence (remove in production)
router.get("/debug/cookies", (req, res) => {
  res.json({
    cookies: req.cookies,
    headers: req.headers,
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    cookieDomain: process.env.COOKIE_DOMAIN,
    success: true,
  });
});

// Debug route to test cookie setting
router.get("/debug/set-cookie", (req, res) => {
  const testToken = "test-token-" + Date.now();
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 60 * 1000, // 1 minute
    path: "/",
  };

  // Handle domain configuration for production
  if (process.env.NODE_ENV === "production") {
    if (process.env.COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    } else {
      try {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const url = new URL(frontendUrl);
        if (url.hostname !== "localhost") {
          if (url.hostname.includes('onrender.com')) {
            cookieOptions.domain = `.onrender.com`;
          } else {
            cookieOptions.domain = url.hostname;
          }
        }
      } catch (error) {
        console.warn("Could not parse frontend URL for cookie domain:", error);
      }
    }
  }

  res.cookie("test-token", testToken, cookieOptions);
  
  res.json({
    message: "Test cookie set",
    cookieOptions,
    testToken,
    success: true,
  });
});

module.exports = router;
