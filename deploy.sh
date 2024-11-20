#!/bin/bash

echo "This Script was created by Abdulrahman Alblooshi! enjoy 😎"

echo "🚀 Starting deployment process..."

# Install pnpm if not installed
echo "📦 Checking pnpm installation..."
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📚 Installing dependencies..."
pnpm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p public/css public/js public/vendor data

# Run setup script to copy vendor files
echo "🔧 Setting up vendor files..."
pnpm run setup

# Build CSS
echo "🎨 Building CSS..."
pnpm run build:css

# Create .env if it doesn't exist
echo "⚙️ Setting up environment variables..."
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "PORT=3000" >> .env
    echo "MAPBOX_ACCESS_TOKEN=${MAPBOX_ACCESS_TOKEN}" >> .env
    # Add other environment variables as needed
fi

# Verify file structure and permissions
echo "🔍 Verifying file structure..."
echo "Checking critical files and directories..."
for dir in "public/css" "public/js" "public/vendor" "data"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists"
    else
        echo "❌ $dir is missing"
        mkdir -p "$dir"
    fi
done

# Check if styles.css exists
if [ -f "public/css/styles.css" ]; then
    echo "✅ styles.css exists"
else
    echo "⚠️ styles.css missing, rebuilding..."
    pnpm run build:css
fi

# Update server.js to handle mapbox-token endpoint
echo "🗺️ Setting up Mapbox token endpoint..."
cat > server/mapbox-config.js << EOL
module.exports = {
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN || 'your-default-token'
};
EOL

# Update server.js to include Mapbox token endpoint
echo "📝 Updating server configuration..."
cat > server/server.js << EOL
const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const { MAPBOX_ACCESS_TOKEN } = require('./mapbox-config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files with proper MIME types
app.use(express.static('public', {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Mapbox token endpoint
app.get("/mapbox-token", (req, res) => {
    res.json({ token: MAPBOX_ACCESS_TOKEN });
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

app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
EOL

# Final verification
echo "✨ Deployment setup complete!"
echo "🔍 Final checks..."
echo "- Public directory structure:"
ls -R public/

# Start the server
echo "🚀 Starting server..."
pnpm start