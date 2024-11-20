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

// Explicitly set MIME types
app.use("/", (req, res, next) => {
  const ext = path.extname(req.url).toLowerCase();
  switch (ext) {
    case ".js":
      res.type("application/javascript");
      break;
    case ".css":
      res.type("text/css");
      break;
    case ".json":
      res.type("application/json");
      break;
    case ".png":
      res.type("image/png");
      break;
    case ".jpg":
      res.type("image/jpeg");
      break;
    case ".wav":
      res.type("audio/wav");
      break;
    case ".woff":
      res.type("application/font-woff");
      break;
    case ".woff2":
      res.type("application/font-woff2");
      break;
    case ".ttf":
      res.type("application/font-ttf");
      break;
    case ".eot":
      res.type("application/vnd.ms-fontobject");
      break;
    case ".otf":
      res.type("application/font-otf");
      break;
    case ".svg":
      res.type("image/svg+xml");
      break;
  }
  next();
});

// Serve static files with MIME types
app.use(
  express.static(path.join(__dirname, "../public"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
      // Add cache control headers
      res.setHeader("Cache-Control", "public, max-age=3600");
    },
  })
);

// Serve node_modules files
app.use(
  "/node_modules",
  express.static(path.join(__dirname, "../node_modules"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// Serve vendor files
app.use(
  "/vendor",
  express.static(path.join(__dirname, "../public/vendor"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// Handle HTML routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Mapbox token endpoint
app.get("/mapbox-token", (req, res) => {
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
  if (!mapboxToken) {
    console.error("Mapbox token not found in environment variables");
    return res.status(500).json({ error: "Mapbox token not configured" });
  }
  res.json({ token: mapboxToken });
});

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

// Handle 404s
app.use((req, res) => {
  console.log("404 for:", req.url);
  res.status(404).send("Not found");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).send("Server error");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Log environment check
  if (!process.env.MAPBOX_ACCESS_TOKEN) {
    console.warn("⚠️ MAPBOX_ACCESS_TOKEN not found in environment variables");
  } else {
    console.log("✅ MAPBOX_ACCESS_TOKEN configured");
  }
});
