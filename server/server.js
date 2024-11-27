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

const axios = require("axios");

// Weather API endpoint
app.get("/api/weather", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=Dubai&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Weather forecast endpoint
app.get("/api/weather/forecast", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=Dubai&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", async (req, res) => {
  try {
    const dataController = require("./controllers/dataController");
    const incidents = await dataController.getIncidents();

    // Calculate some basic statistics for the dashboard
    const totalIncidents = incidents.length;
    const severeIncidents = incidents.filter(
      (i) => i.severity === "severe"
    ).length;
    const minorIncidents = incidents.filter(
      (i) => i.severity === "minor"
    ).length;
    const activeIncidents = incidents.filter(
      (i) => i.status === "active"
    ).length;

    res.render("index", {
      title: "Dashboard",
      active: "home",
      incidents,
      stats: {
        total: totalIncidents,
        severe: severeIncidents,
        minor: minorIncidents,
        active: activeIncidents,
      },
    });
  } catch (error) {
    res.render("error", {
      title: "Error",
      error,
    });
  }
});

// Page Routes
app.get("/story-map", async (req, res) => {
  try {
    const dataController = require("./controllers/dataController");
    const incidents = await dataController.getIncidents();
    res.render("story-map", {
      title: "Story Map",
      active: "story-map",
      incidents,
    });
  } catch (error) {
    res.render("error", {
      title: "Error",
      error,
    });
  }
});

app.get("/trends", async (req, res) => {
  populationData = {
    years: [
      "1975",
      "1980",
      "1985",
      "1993",
      "1995",
      "2000",
      "2005",
      "2006",
      "2007",
      "2008",
      "2009",
      "2010",
      "2011",
      "2012",
      "2013",
      "2014",
      "2015",
      "2016",
      "2017",
      "2018",
      "2019",
      "2020",
      "2021",
      "2022",
      "2023",
    ],
    males: [
      128821, 187714, 247179, 406128, 478209, 611799, 989305, 1073485, 1164576,
      1263130, 1369740, 1485046, 1515770, 1547135, 1579145, 1613175, 1703355,
      1888520, 2088870, 2233390, 2331800, 2362255, 2400100, 2438780, 2507200,
    ],
    females: [
      54366, 88587, 123609, 204798, 211211, 250588, 332148, 348327, 365216,
      382843, 401238, 420430, 487400, 558740, 634700, 714175, 743320, 810080,
      887585, 958885, 1024100, 1048945, 1078200, 1111120, 1147800,
    ],
    total: [
      183187, 276301, 370788, 610926, 689420, 862387, 1321453, 1421812, 1529792,
      1645973, 1770978, 1905476, 2003170, 2105875, 2213845, 2327350, 2446675,
      2698600, 2976455, 3192275, 3355900, 3411200, 3478300, 3549900, 3655000,
    ],
  };

  try {
    res.render("trends", {
      title: "Population & Traffic Trends",
      active: "trends",
      populationData: populationData,
    });
  } catch (error) {
    res.render("error", {
      title: "Error",
      active: "trends",
      error,
    });
  }
});

app.get("/data-table", async (req, res) => {
  try {
    const dataController = require("./controllers/dataController");
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const incidents = await dataController.getIncidents();
    const totalRecords = incidents.length;
    const totalPages = Math.ceil(totalRecords / limit);

    // Get paginated incidents
    const startIndex = (page - 1) * limit;
    const paginatedIncidents = incidents.slice(startIndex, startIndex + limit);

    res.render("data-table", {
      title: "Data Table",
      active: "data-table",
      incidents: paginatedIncidents,
      currentPage: page,
      totalPages,
      totalRecords,
      limit,
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
    active: "error",
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
