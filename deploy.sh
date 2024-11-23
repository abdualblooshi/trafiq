#!/bin/bash

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
mkdir -p public/css \
         public/js \
         public/vendor \
         data \
         views/partials \
         server/controllers \
         server/routes

# Run setup script to copy vendor files
echo "🔧 Setting up vendor files..."
pnpm run setup

# Initialize Tailwind if config doesn't exist
if [ ! -f tailwind.config.js ]; then
    echo "Initializing Tailwind CSS..."
    cat > tailwind.config.js << EOL
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",    // Update to include EJS files
    "./public/**/*.{html,js}",
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL
fi

# Ensure source CSS directory exists
mkdir -p src/css

# Create or update input.css
echo "Creating input.css..."
cat > src/css/input.css << EOL
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base styles */
:root {
  --sidebar-width: 16rem;
  --story-opacity: 0.3;
  --base-font-size: 16px;
  --text-color: #e5e7eb;
  --background-color: #111827;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background: black;
  font-size: var(--base-font-size);
  color: var(--text-color);
  background-color: var(--background-color);
}

.high-contrast {
  --text-color: #ffffff;
  --background-color: #000000;
}

/* Add transition for smooth font size changes */
body,
button,
input,
select,
textarea {
  transition: font-size 0.3s ease;
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  overflow-y: auto;
  z-index: 20;
  position: fixed;
  left: 0;
  top: 0;
  background: rgb(17, 24, 39);
}

/* Map container */
#map {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: calc(100% - var(--sidebar-width));
  z-index: 1;
}

/* Story container */
#story-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  pointer-events: none;
}

.story-sections {
  position: relative;
  margin-left: var(--sidebar-width);
  width: calc(100% - var(--sidebar-width));
}

.story-step {
  min-height: 100vh;
  padding: 2rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  opacity: var(--story-opacity);
  transition: all 0.5s ease;
}

.story-step.is-active {
  opacity: 1;
}

.story-step-content {
  background: rgba(17, 24, 39, 0.95);
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 100%;
  pointer-events: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Dropdown styles */
.dropdown-content {
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}

.dropdown-content.show {
  max-height: 200px;
}

/* Button styles */
.dropdown button {
  width: 100%;
  text-align: left;
  transition: background-color 0.3s ease;
}

.dropdown button:hover {
  background-color: rgba(75, 85, 99, 0.7);
}

/* Icon animation */
.fas.fa-chevron-down {
  transition: transform 0.3s ease;
}

.show .fas.fa-chevron-down {
  transform: rotate(180deg);
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 30;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.modal.show {
  display: flex;
  opacity: 1;
}

.modal-content {
  background: rgb(31, 41, 55);
  padding: 2rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-20px);
  transition: transform 0.3s ease-in-out;
}

.modal.show .modal-content {
  transform: translateY(0);
}

/* Settings styles */
.setting-group {
  margin-bottom: 1rem;
}

/* Range input styles */
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #4b5563;
  outline: none;
  margin: 1rem 0;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

/* Mapbox popup styles */
.mapboxgl-popup-content {
  background-color: rgba(17, 24, 39, 0.95);
  color: white;
  border-radius: 4px;
  padding: 1rem;
}

.popup-content {
  padding: 10px;
  max-width: 200px;
}

.popup-content h3 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: bold;
}

.popup-content p {
  margin: 2px 0;
  font-size: 12px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .story-step-content {
    max-width: calc(100% - 4rem);
  }
}

/* Mobile sidebar adjustments */
@media (max-width: 1023px) {
  .sidebar {
    width: 280px; /* Slightly wider on mobile */
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }
}

/* Transition styles */
.sidebar,
#main-content {
  will-change: transform;
}

#sidebar-backdrop {
  transition: opacity 0.3s ease-in-out;
}

/* Fix for safari mobile bottom bar */
@supports (-webkit-touch-callout: none) {
  .sidebar {
    height: -webkit-fill-available;
  }
}

/* Ensure content doesn't shift on mobile */
body {
  overflow-x: hidden;
}
EOL

# Build CSS
echo "🎨 Building CSS..."
echo "Current directory: $(pwd)"
echo "Running Tailwind build..."
pnpm run build:css

# Create .env if it doesn't exist
echo "⚙️ Setting up environment variables..."
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
PORT=3000
NODE_ENV=production
MAPBOX_ACCESS_TOKEN=${MAPBOX_ACCESS_TOKEN}
EOL
fi

# Verify file structure and key files
echo "🔍 Verifying file structure..."
declare -a required_dirs=(
    "public/css"
    "public/js"
    "public/vendor"
    "data"
    "views"
    "views/partials"
    "server/controllers"
    "server/routes"
)

declare -a required_files=(
    "views/layout.ejs"
    "views/partials/header.ejs"
    "views/partials/footer.ejs"
    "views/partials/sidebar.ejs"
    "server/server.js"
    "server/controllers/dataController.js"
)

# Check directories
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists"
    else
        echo "⚠️ Creating missing directory: $dir"
        mkdir -p "$dir"
    fi
done

# Check files
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "⚠️ Warning: $file is missing"
    fi
done

# Check if styles.css exists after build
if [ -f "public/css/styles.css" ]; then
    echo "✅ styles.css exists"
else
    echo "❌ styles.css is missing - rebuilding..."
    pnpm run build:css
fi

# Verify EJS templates
echo "🔍 Verifying EJS templates..."
if [ ! -f "views/layout.ejs" ]; then
    echo "⚠️ Warning: layout.ejs template is missing"
fi

# Add node_modules to .gitignore if not already present
if [ ! -f .gitignore ]; then
    echo "node_modules/" > .gitignore
    echo ".env" >> .gitignore
    echo "*.log" >> .gitignore
    echo "dist/" >> .gitignore
fi

# Final deployment steps
echo "✨ Deployment setup complete!"
echo "🔍 Final checks..."
echo "- Public directory structure:"
ls -R public/

# Optimize for production if needed
if [ "$NODE_ENV" = "production" ]; then
    echo "🔧 Running production optimizations..."
    # Add any production-specific optimizations here
fi

echo "✅ Deployment process completed successfully!"
