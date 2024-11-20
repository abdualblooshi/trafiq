// setup.js
const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");

async function setupVendorFolders() {
  try {
    // Create vendor directories
    const vendorPath = path.join(__dirname, "public", "vendor");
    const directories = [
      "mapbox-gl",
      "d3",
      "scrollama",
      "vega",
      "vega-lite",
      "vega-embed",
      "fontawesome/css",
      "fontawesome/webfonts",
    ];

    // Create directories
    for (const dir of directories) {
      await fs.mkdir(path.join(vendorPath, dir), { recursive: true });
      console.log(`Created directory: ${dir}`);
    }

    // Copy files from node_modules to vendor
    const copyCommands = [
      "cp node_modules/mapbox-gl/dist/mapbox-gl.js public/vendor/mapbox-gl/",
      "cp node_modules/mapbox-gl/dist/mapbox-gl.css public/vendor/mapbox-gl/",
      "cp node_modules/d3/dist/d3.min.js public/vendor/d3/",
      "cp node_modules/scrollama/build/scrollama.min.js public/vendor/scrollama/",
      "cp node_modules/vega/build/vega.min.js public/vendor/vega/",
      "cp node_modules/vega-lite/build/vega-lite.min.js public/vendor/vega-lite/",
      "cp node_modules/vega-embed/build/vega-embed.min.js public/vendor/vega-embed/",
      "cp -r node_modules/@fortawesome/fontawesome-free/css/* public/vendor/fontawesome/css/",
      "cp -r node_modules/@fortawesome/fontawesome-free/webfonts/* public/vendor/fontawesome/webfonts/",
    ];

    for (const command of copyCommands) {
      execSync(command);
      console.log(`Executed: ${command}`);
    }

    console.log("Vendor setup completed successfully!");
  } catch (error) {
    console.error("Error setting up vendor folders:", error);
    process.exit(1);
  }
}

setupVendorFolders();
