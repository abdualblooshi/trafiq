// server/routes/api.js
const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

router.get("/incidents", dataController.getIncidents);
router.get("/statistics", dataController.getStatistics);

module.exports = router;
