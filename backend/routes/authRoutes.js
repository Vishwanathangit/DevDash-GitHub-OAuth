const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();


router.get("/github", (req, res, next) => {

  
  const redirectTo = req.query.redirectTo || "/dashboard";
  passport.authenticate("github", {
    scope: ["user:email", "repo"],
    state: encodeURIComponent(redirectTo),
  })(req, res, next);
});


router.get(
  "/github/callback",
  (req, res, next) => {

    next();
  },
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/api/auth/login",
  }),
  (req, res) => {
    try {
     
      
      if (!req.user) {
        console.error("No user object in callback");
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

      
      const getCookieOptions = () => {
        const isProduction = process.env.NODE_ENV === "production";
        
        const options = {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, 
          path: "/",
        };

   
        if (isProduction) {
          try {
            const url = new URL(frontendUrl);
            const hostname = url.hostname;
        
            if (hostname.includes('onrender.com')) {
           
            }
          
            else if (hostname.includes('vercel.app')) {
             
            }
        
            else if (!hostname.includes('localhost')) {
              options.domain = hostname;
             
            }
          } catch (error) {
            console.warn("Could not parse frontend URL for cookie domain:", error);
          }

       
          if (process.env.COOKIE_DOMAIN) {
            options.domain = process.env.COOKIE_DOMAIN;
            
          }
        }

        return options;
      };

    
      const cookieOptions = getCookieOptions();
      res.cookie("token", token, cookieOptions);


      if (process.env.NODE_ENV === "production") {
    
        res.cookie("token_alt", token, {
          ...cookieOptions,
          domain: undefined,
        });
        
        res.cookie("token_cross", token, {
          ...cookieOptions,
          domain: undefined,
          sameSite: "none",
        });
      }


      if (process.env.NODE_ENV !== "production") {
        res.cookie("token_debug", token, {
          ...cookieOptions,
          httpOnly: false,
        });
      }


      const redirectUrl = new URL(redirectTo, frontendUrl);
      redirectUrl.searchParams.set('token', token);
      

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error("Error in GitHub callback:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
);


router.get("/profile", async (req, res) => {
  try {
 
    let token = req.cookies.token || 
                req.cookies.token_alt || 
                req.cookies.token_cross ||
                req.cookies.token_debug ||
                req.headers.authorization?.replace('Bearer ', '') || 
                req.query.token;



    if (!token) {
      console.log(" No token found in any source");
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
    console.error("Error fetching profile:", error);
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
      success: false,
    });
  }
});


router.post("/logout", (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

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

      if (process.env.COOKIE_DOMAIN) {
        cookieOptions.domain = process.env.COOKIE_DOMAIN;
      }
    }

    res.clearCookie("token", cookieOptions);
    res.clearCookie("token_alt", cookieOptions);
    res.clearCookie("token_cross", cookieOptions);
    
    
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
    console.error("Error during logout:", error);
    res.status(500).json({
      message: "Error during logout",
      error: error.message,
      success: false,
    });
  }
});


router.get("/health", (req, res) => {
  res.json({
    message: "Auth service is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    success: true,
  });
});


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


router.get("/debug/set-cookie", (req, res) => {
  const testToken = "test-token-" + Date.now();
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 1000, // 1 minute
    path: "/",
  };


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

router.get("/test-oauth", (req, res) => {

  
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


router.get("/test-callback", (req, res) => {
  try {
   
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
    
 
    const isProduction = process.env.NODE_ENV === "production";
    
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 60 * 60 * 1000, 
      path: "/",
    };

    res.cookie("token", testToken, cookieOptions);
    res.cookie("token_alt", testToken, { ...cookieOptions, domain: undefined });
    res.cookie("token_cross", testToken, { ...cookieOptions, domain: undefined, sameSite: "none" });
    
    if (process.env.NODE_ENV !== "production") {
      res.cookie("token_debug", testToken, { ...cookieOptions, httpOnly: false });
    }

    
    
    const redirectUrl = new URL("/dashboard", frontendUrl);
    redirectUrl.searchParams.set('token', testToken);
    
 
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Error in test callback:", error);
    res.status(500).json({
      message: "Test callback failed",
      error: error.message,
      success: false,
    });
  }
});

module.exports = router;