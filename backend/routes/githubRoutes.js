const express = require("express");
const router = express.Router();
const { fetchgithubController } = require("../controllers/githubController");
const { authenticateToken } = require("../middleware/auth");

router.get("/repos", authenticateToken, fetchgithubController);

module.exports = router;
