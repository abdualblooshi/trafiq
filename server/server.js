// server/server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Layout setup
app.use(expressLayouts);
app.set("layout", "layout");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(
  express.static(path.join(__dirname, "../public"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// API Routes
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
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
  if (!mapboxToken) {
    return res.status(400).json({ error: "Mapbox token not configured" });
  }
  res.json({ token: mapboxToken });
});

// Page Routes
app.get("/", async (req, res) => {
  try {
    const dataController = require("./controllers/dataController");
    const incidents = await dataController.getIncidents();
    res.render("index", {
      title: "Home",
      active: "home",
      incidents,
    });
  } catch (error) {
    res.render("error", {
      title: "Error",
      error,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).render("error", {
    title: "Error",
    error: err,
  });
});

// 404 handler
app.use((req, res) => {
  console.log("404 Not Found:", req.url);
  res.status(404).render("error", {
    title: "Not Found",
    error: { message: `Page not found: ${req.url}` },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  if (!process.env.MAPBOX_ACCESS_TOKEN) {
    console.warn(
      "⚠️  WARNING: MAPBOX_ACCESS_TOKEN not found in environment variables"
    );
  }
});
