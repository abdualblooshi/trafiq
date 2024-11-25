#!/bin/bash

echo "🚀 Starting pre-deployment setup..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p public/css public/js data

# Initialize Tailwind if config doesn't exist
if [ ! -f tailwind.config.js ]; then
    echo "Initializing Tailwind CSS..."
    tailwindcss init
fi

# Build CSS
echo "🎨 Building CSS..."
echo "Current directory: $(pwd)"
echo "Running Tailwind build..."
tailwindcss -i ./src/css/input.css -o ./public/css/styles.css

# Verify file structure and permissions
echo "🔍 Verifying file structure..."
for dir in "public/css" "public/js" "data"; do
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

echo "✨ Pre-deployment setup complete!"