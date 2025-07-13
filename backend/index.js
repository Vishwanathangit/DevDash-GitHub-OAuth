require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const passport = require("./config/passport");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT;

if (process.env.MONGODB_URI) {
  connectDB();
}

// ✅ Improved CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000"
    ].filter(Boolean); // Remove undefined values
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For production, also allow subdomains of the main domain
    if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URL) {
      try {
        const frontendUrl = new URL(process.env.FRONTEND_URL);
        const originUrl = new URL(origin);
        
        // Allow same domain and subdomains
        if (originUrl.hostname === frontendUrl.hostname || 
            originUrl.hostname.endsWith('.' + frontendUrl.hostname)) {
          return callback(null, true);
        }
      } catch (error) {
        console.warn("Error parsing URLs for CORS:", error);
      }
    }
    
    console.log("❌ CORS blocked origin:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

const authRoutes = require("./routes/authRoutes");
const githubRoutes = require("./routes/githubRoutes");
const eventRoutes = require("./routes/eventRoutes");
const devtoRoutes = require("./routes/devtoRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/devto", devtoRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "GitHub OAuth + Dev.to + Calendar Backend API",
    success: true,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
