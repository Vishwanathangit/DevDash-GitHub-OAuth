const express = require("express");
const router = express.Router();
const { fetchdevtoController } = require("../controllers/devtoController");

router.get("/articles/:username", fetchdevtoController);

module.exports = router;
