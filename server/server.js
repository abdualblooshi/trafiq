// server/server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.use(
  express.static("public", {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// Serve node_modules files
app.use(
  "/node_modules",
  express.static(path.join(__dirname, "../node_modules"))
);

// API endpoints
app.get("/api/incidents", async (req, res) => {
  try {
    const dataController = require("./controllers/dataController");
    const incidents = await dataController.getIncidents();
    res.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/mapbox-token", (req, res) => {
  res.json({ token: process.env.MAPBOX_ACCESS_TOKEN });
});

app.use("/vendor", express.static(path.join(__dirname, "../public/vendor")));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
