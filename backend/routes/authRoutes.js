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

// GitHub OAuth callback with robust cookie handling
router.get(
  "/github/callback",
  (req, res, next) => {
    console.log("🔄 GitHub callback received");
    console.log("📋 Callback query:", req.query);
    console.log("🌐 Callback headers:", req.headers);
    next();
  },
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/api/auth/login",
  }),
  (req, res) => {
    try {
      console.log("🔐 GitHub callback processing for user:", req.user?.username);
      
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

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const redirectTo = decodeURIComponent(req.query.state || "/dashboard");

      // Enhanced cookie configuration
      const getCookieOptions = () => {
        const options = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // lowercase
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        };

        // Handle domain configuration for production
        if (process.env.NODE_ENV === "production") {
          // Try to extract domain from frontend URL
          try {
            const url = new URL(frontendUrl);
            if (url.hostname !== "localhost") {
              // For Render.com deployments
              if (url.hostname.includes('onrender.com')) {
                options.domain = '.onrender.com';
              } 
              // For Vercel deployments
              else if (url.hostname.includes('vercel.app')) {
                options.domain = '.vercel.app';
              }
              // For custom domains
              else {
                options.domain = url.hostname;
              }
            }
          } catch (error) {
            console.warn("Could not parse frontend URL for cookie domain:", error);
          }

          // Allow explicit override
          if (process.env.COOKIE_DOMAIN) {
            options.domain = process.env.COOKIE_DOMAIN;
          }
        }

        return options;
      };

      // Set the token cookie with proper options
      const cookieOptions = getCookieOptions();
      res.cookie("token", token, cookieOptions);

      console.log("🍪 Cookie set with options:", cookieOptions);

      // For debugging - set a non-httpOnly cookie
      if (process.env.NODE_ENV !== "production") {
        res.cookie("token_debug", token, {
          ...cookieOptions,
          httpOnly: false,
        });
      }

      // Redirect to frontend with token in URL as fallback
      const redirectUrl = new URL(redirectTo, frontendUrl);
      redirectUrl.searchParams.set('token', token);
      
      console.log("🔗 Redirecting to:", redirectUrl.toString());
      res.redirect(redirectUrl.toString());
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
    let token = req.cookies.token || 
                req.headers.authorization?.replace('Bearer ', '') || 
                req.query.token;

    if (!token) {
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

// Logout route
router.post("/logout", (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

    // Try to clear cookie with domain if in production
    if (process.env.NODE_ENV === "production") {
      try {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const url = new URL(frontendUrl);
        if (!url.hostname.includes('localhost')) {
          cookieOptions.domain = url.hostname.includes('onrender.com') 
            ? '.onrender.com' 
            : url.hostname;
        }
      } catch (error) {
        console.warn("Could not parse frontend URL for cookie domain:", error);
      }

      // Allow explicit override
      if (process.env.COOKIE_DOMAIN) {
        cookieOptions.domain = process.env.COOKIE_DOMAIN;
      }
    }

    res.clearCookie("token", cookieOptions);
    
    // Also clear debug cookie if exists
    if (process.env.NODE_ENV !== "production") {
      res.clearCookie("token_debug", {
        ...cookieOptions,
        httpOnly: false,
      });
    }

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

// Health check route
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
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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