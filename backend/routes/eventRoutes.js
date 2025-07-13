const express = require("express");
const router = express.Router();
const {
  fetchsavedEventController,
  saveEventController,
} = require("../controllers/eventController");
const { authenticateToken } = require("../middleware/auth");

router.get("/", authenticateToken, fetchsavedEventController);
router.post("/", authenticateToken, saveEventController);

module.exports = router;
