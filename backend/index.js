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

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
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
});
