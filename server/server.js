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
app.use(express.static(path.join(__dirname, "../public")));

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

app.get("/table", async (req, res) => {
  try {
    const dataController = require("./controllers/dataController");
    const incidents = await dataController.getIncidents();
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    res.render("table", {
      title: "Data Table",
      active: "table",
      incidents: incidents.slice((page - 1) * limit, page * limit),
      currentPage: page,
      totalPages: Math.ceil(incidents.length / limit),
      totalRecords: incidents.length,
      limit,
    });
  } catch (error) {
    res.render("error", {
      title: "Error",
      error,
    });
  }
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
