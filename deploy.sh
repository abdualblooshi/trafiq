#!/bin/bash

echo "🚀 Starting deployment process..."

# Install pnpm if not installed
echo "📦 Checking pnpm installation..."
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Install Tailwind CSS globally
echo "🎨 Installing Tailwind CSS globally..."
npm install -g tailwindcss

# Install dependencies
echo "📚 Installing dependencies..."
pnpm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p public/css public/js public/vendor data

# Run setup script to copy vendor files
echo "🔧 Setting up vendor files..."
pnpm run setup

# Initialize Tailwind if config doesn't exist
if [ ! -f tailwind.config.js ]; then
    echo "Initializing Tailwind CSS..."
    tailwindcss init
fi

# Update Tailwind config
echo "Updating Tailwind config..."
cat > tailwind.config.js << EOL
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./src/**/*.{html,js}",
    "./views/**/*.{html,js}",
    "./index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL

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
}

/* Your custom styles here */
EOL

# Build CSS
echo "🎨 Building CSS..."
echo "Current directory: $(pwd)"
echo "Running Tailwind build..."
tailwindcss -i ./src/css/input.css -o ./public/css/styles.css

# Create .env if it doesn't exist
echo "⚙️ Setting up environment variables..."
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "PORT=3000" >> .env
    echo "MAPBOX_ACCESS_TOKEN=${MAPBOX_ACCESS_TOKEN}" >> .env
fi

# Verify file structure and permissions
echo "🔍 Verifying file structure..."
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
    tailwindcss -i ./src/css/input.css -o ./public/css/styles.css
fi

# Final verification
echo "✨ Deployment setup complete!"
echo "🔍 Final checks..."
echo "- Public directory structure:"
ls -R public/

# Start the server
echo "🚀 Starting server..."
pnpm start