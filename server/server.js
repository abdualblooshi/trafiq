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

// Static file serving with proper MIME types
app.use('/vendor', express.static(path.join(__dirname, '../public/vendor'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
    } else if (path.endsWith('.ttf')) {
      res.setHeader('Content-Type', 'font/ttf');
    }
  }
}));

// Serve other static files
app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Add verification endpoint
app.get('/verify-static', (req, res) => {
  const publicPath = path.join(__dirname, '../public');
  const vendorPath = path.join(publicPath, 'vendor');
  
  const files = {
    mapboxJs: fs.existsSync(path.join(vendorPath, 'mapbox-gl/mapbox-gl.js')),
    mapboxCss: fs.existsSync(path.join(vendorPath, 'mapbox-gl/mapbox-gl.css')),
    scrollamaJs: fs.existsSync(path.join(vendorPath, 'scrollama/scrollama.min.js')),
    fontAwesomeCss: fs.existsSync(path.join(vendorPath, 'fontawesome/css/all.min.css')),
    publicDir: fs.existsSync(publicPath),
    vendorDir: fs.existsSync(vendorPath)
  };
  
  res.json({
    message: 'Static file verification',
    files,
    publicPath,
    vendorPath
  });
});

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
  console.error('Server Error:', err);
  res.status(500).render('error', {
    title: 'Error',
    error: err
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.url);
  res.status(404).render('error', {
    title: 'Not Found',
    error: { message: `Page not found: ${req.url}` }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Verify vendor files on startup
  const vendorPath = path.join(__dirname, '../public/vendor');
  try {
    const files = await fs.promises.readdir(vendorPath);
    console.log('Available vendor files:', files);
  } catch (error) {
    console.error('Error reading vendor directory:', error);
  }
  
  if (!process.env.MAPBOX_ACCESS_TOKEN) {
    console.warn("⚠️  WARNING: MAPBOX_ACCESS_TOKEN not found in environment variables");
  }
});
