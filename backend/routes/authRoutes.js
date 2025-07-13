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

      // ✅ Simplified and robust cookie configuration
      const getCookieOptions = () => {
        const isProduction = process.env.NODE_ENV === "production";
        
        const options = {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: "/",
        };

        // ✅ Simplified domain handling for production
        if (isProduction) {
          try {
            const url = new URL(frontendUrl);
            const hostname = url.hostname;
            
            // For onrender.com subdomains
            if (hostname.includes('onrender.com')) {
              // Don't set domain for onrender.com - let browser handle it
              console.log("🌐 OnRender.com detected - not setting domain for cookie");
            }
            // For vercel.app subdomains  
            else if (hostname.includes('vercel.app')) {
              // Don't set domain for vercel.app - let browser handle it
              console.log("🌐 Vercel.app detected - not setting domain for cookie");
            }
            // For custom domains
            else if (!hostname.includes('localhost')) {
              options.domain = hostname;
              console.log("🌐 Custom domain detected:", hostname);
            }
          } catch (error) {
            console.warn("⚠️ Could not parse frontend URL for cookie domain:", error);
          }

          // Allow explicit override
          if (process.env.COOKIE_DOMAIN) {
            options.domain = process.env.COOKIE_DOMAIN;
            console.log("🌐 Using explicit cookie domain:", process.env.COOKIE_DOMAIN);
          }
        }

        return options;
      };

      // Set the token cookie with proper options
      const cookieOptions = getCookieOptions();
      res.cookie("token", token, cookieOptions);

      console.log("🍪 Cookie set with options:", cookieOptions);

      // ✅ Set multiple cookie variations for better compatibility
      if (process.env.NODE_ENV === "production") {
        // Set without domain for better cross-subdomain compatibility
        res.cookie("token_alt", token, {
          ...cookieOptions,
          domain: undefined,
        });
        
        // Set with SameSite=None for cross-site requests
        res.cookie("token_cross", token, {
          ...cookieOptions,
          domain: undefined,
          sameSite: "none",
        });
      }

      // For debugging - set a non-httpOnly cookie in development
      if (process.env.NODE_ENV !== "production") {
        res.cookie("token_debug", token, {
          ...cookieOptions,
          httpOnly: false,
        });
      }

      // ✅ Redirect to frontend with token in URL as fallback
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
    // ✅ Check multiple cookie variations and token sources
    let token = req.cookies.token || 
                req.cookies.token_alt || 
                req.cookies.token_cross ||
                req.cookies.token_debug ||
                req.headers.authorization?.replace('Bearer ', '') || 
                req.query.token;

    console.log("🔍 Token sources checked:");
    console.log("  - req.cookies.token:", req.cookies.token ? "FOUND" : "NOT FOUND");
    console.log("  - req.cookies.token_alt:", req.cookies.token_alt ? "FOUND" : "NOT FOUND");
    console.log("  - req.cookies.token_cross:", req.cookies.token_cross ? "FOUND" : "NOT FOUND");
    console.log("  - req.cookies.token_debug:", req.cookies.token_debug ? "FOUND" : "NOT FOUND");
    console.log("  - req.headers.authorization:", req.headers.authorization ? "FOUND" : "NOT FOUND");
    console.log("  - req.query.token:", req.query.token ? "FOUND" : "NOT FOUND");

    if (!token) {
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

    // ✅ Clear all token cookie variations
    res.clearCookie("token", cookieOptions);
    res.clearCookie("token_alt", cookieOptions);
    res.clearCookie("token_cross", cookieOptions);
    
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

// ✅ Test endpoint to simulate OAuth callback and set cookies
router.get("/test-callback", (req, res) => {
  try {
    console.log("🧪 Test callback endpoint called");
    
    // Create a test token
    const testToken = jwt.sign(
      {
        userId: "test-user-id",
        username: "testuser",
        email: "test@example.com",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    
    // Set cookies with the same logic as the real callback
    const isProduction = process.env.NODE_ENV === "production";
    
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hour for test
      path: "/",
    };

    // Set multiple cookie variations
    res.cookie("token", testToken, cookieOptions);
    res.cookie("token_alt", testToken, { ...cookieOptions, domain: undefined });
    res.cookie("token_cross", testToken, { ...cookieOptions, domain: undefined, sameSite: "none" });
    
    if (process.env.NODE_ENV !== "production") {
      res.cookie("token_debug", testToken, { ...cookieOptions, httpOnly: false });
    }

    console.log("🍪 Test cookies set with options:", cookieOptions);
    
    // Redirect to frontend with token in URL
    const redirectUrl = new URL("/dashboard", frontendUrl);
    redirectUrl.searchParams.set('token', testToken);
    
    console.log("🔗 Redirecting to test URL:", redirectUrl.toString());
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("❌ Error in test callback:", error);
    res.status(500).json({
      message: "Test callback failed",
      error: error.message,
      success: false,
    });
  }
});

module.exports = router;