require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const passport = require("./config/passport");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;


if (process.env.MONGODB_URI) {
  connectDB();
}

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000"
].filter(Boolean);


const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 

    try {
      const isAllowed = allowedOrigins.includes(origin);

      if (isAllowed) return callback(null, true);

      
      if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URL) {
        const frontendUrl = new URL(process.env.FRONTEND_URL);
        const originUrl = new URL(origin);

        if (
          originUrl.hostname === frontendUrl.hostname ||
          originUrl.hostname.endsWith(`.${frontendUrl.hostname}`)
        ) {
          return callback(null, true);
        }

  
        if (
          frontendUrl.hostname.includes("onrender.com") &&
          originUrl.hostname.includes("onrender.com")
        ) {
          return callback(null, true);
        }

        if (
          frontendUrl.hostname.includes("vercel.app") &&
          originUrl.hostname.includes("vercel.app")
        ) {
          return callback(null, true);
        }
      }
    } catch (err) {
      console.warn("CORS origin check failed:", err);
    }

    console.warn("CORS blocked origin:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
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
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Allowed frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});
