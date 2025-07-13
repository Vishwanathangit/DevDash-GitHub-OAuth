const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// GitHub OAuth login start
router.get("/github", (req, res, next) => {
  console.log("🚀 GitHub OAuth login initiated");
  console.log("📋 Request query:", req.query);
  console.log("🌐 Request headers:", req.headers);
  
  const redirectTo = req.query.redirectTo || "/dashboard";
  passport.authenticate("github", {
    scope: ["user:email", "repo"],
    state: encodeURIComponent(redirectTo),
  })(req, res, next);
});

// GitHub OAuth callback with multiple fallback options
router.get(
  "/github/callback",
  (req, res, next) => {
    console.log("🔄 GitHub callback received");
    console.log("📋 Callback query:", req.query);
    console.log("🌐 Callback headers:", req.headers);
    console.log("🍪 Callback cookies:", req.cookies);
    next();
  },
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/api/auth/login",
  }),
  (req, res) => {
    try {
      console.log("🔐 GitHub callback processing for user:", req.user?.username);
      console.log("👤 User object:", req.user);
      
      if (!req.user) {
        console.error("❌ No user object in callback");
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(`${frontendUrl}/login?error=no_user`);
      }
      
      const token = jwt.sign(
        {
          userId: req.user._id,
          username: req.user.username,
          email: req.user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      console.log("🔑 JWT token created:", token.substring(0, 20) + "...");

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const redirectTo = decodeURIComponent(req.query.state || "/dashboard");

      console.log("🎯 Frontend URL:", frontendUrl);
      console.log("🎯 Redirect to:", redirectTo);

      // ✅ Multiple cookie setting strategies
      const cookieStrategies = [
        // Strategy 1: No domain (works for same domain)
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        },
        // Strategy 2: With domain for onrender.com
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
          domain: ".onrender.com",
        },
        // Strategy 3: With explicit cookie domain
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
          domain: process.env.COOKIE_DOMAIN,
        }
      ];

      // Try multiple cookie strategies
      cookieStrategies.forEach((strategy, index) => {
        try {
          res.cookie(`token_${index}`, token, strategy);
          console.log(`🍪 Cookie strategy ${index} set:`, strategy);
        } catch (error) {
          console.error(`❌ Cookie strategy ${index} failed:`, error);
        }
      });

      // Also set a simple cookie without domain restrictions
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      console.log("✅ All token cookies set successfully");
      console.log("🔗 Redirecting to:", `${frontendUrl}${redirectTo}`);

      // ✅ Redirect with token in URL as fallback (temporary)
      const redirectUrl = `${frontendUrl}${redirectTo}?token=${encodeURIComponent(token)}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ Error in GitHub callback:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
);

// Authenticated profile route with multiple token sources
router.get("/profile", async (req, res) => {
  try {
    console.log("👤 Profile request received");
    console.log("🍪 Cookies:", req.cookies);
    console.log("🔍 Authorization header:", req.headers.authorization);

    let token = null;

    // Try multiple sources for the token
    if (req.cookies.token) {
      token = req.cookies.token;
      console.log("✅ Found token in cookies");
    } else if (req.cookies.token_0) {
      token = req.cookies.token_0;
      console.log("✅ Found token in token_0 cookie");
    } else if (req.cookies.token_1) {
      token = req.cookies.token_1;
      console.log("✅ Found token in token_1 cookie");
    } else if (req.cookies.token_2) {
      token = req.cookies.token_2;
      console.log("✅ Found token in token_2 cookie");
    } else if (req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
      console.log("✅ Found token in Authorization header");
    } else {
      console.log("❌ No token found in any source");
      return res.status(401).json({
        message: "Access token required",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await require("../models/User").findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Invalid token - user not found",
        success: false,
      });
    }

    console.log("✅ User authenticated:", user.username);

    res.json({
      message: "User profile fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
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

// Logout route (clears all possible cookies)
router.post("/logout", (req, res) => {
  try {
    console.log("🚪 Logging out user...");

    // Clear all possible token cookies
    const cookiesToClear = ["token", "token_0", "token_1", "token_2"];
    
    cookiesToClear.forEach(cookieName => {
      try {
        res.clearCookie(cookieName, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          path: "/",
        });
        
        // Also try with domain
        res.clearCookie(cookieName, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          path: "/",
          domain: ".onrender.com",
        });
        
        console.log(`✅ Cleared cookie: ${cookieName}`);
      } catch (error) {
        console.error(`❌ Failed to clear cookie ${cookieName}:`, error);
      }
    });

    console.log("✅ All token cookies cleared successfully");

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

// Debug route to check cookie presence
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

// Test endpoint to verify GitHub OAuth is working
router.get("/test-oauth", (req, res) => {
  console.log("🧪 Test OAuth endpoint called");
  console.log("📋 Environment variables:");
  console.log("  - NODE_ENV:", process.env.NODE_ENV);
  console.log("  - FRONTEND_URL:", process.env.FRONTEND_URL);
  console.log("  - COOKIE_DOMAIN:", process.env.COOKIE_DOMAIN);
  console.log("  - GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID ? "SET" : "NOT SET");
  console.log("  - GITHUB_CLIENT_SECRET:", process.env.GITHUB_CLIENT_SECRET ? "SET" : "NOT SET");
  console.log("  - GITHUB_CALLBACK_URL:", process.env.GITHUB_CALLBACK_URL);
  console.log("  - JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");
  
  res.json({
    message: "OAuth test endpoint",
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    cookieDomain: process.env.COOKIE_DOMAIN,
    githubClientId: process.env.GITHUB_CLIENT_ID ? "SET" : "NOT SET",
    githubCallbackUrl: process.env.GITHUB_CALLBACK_URL,
    jwtSecret: process.env.JWT_SECRET ? "SET" : "NOT SET",
    success: true,
  });
});

module.exports = router;
