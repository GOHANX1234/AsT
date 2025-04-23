#!/bin/bash

# This script is used to prepare the build for deployment on Render

# First, run the standard build command
echo "Running standard build..."
npm run build

# Create the necessary directory structure
echo "Creating proper directory structure for deployment..."

# Ensure we have a public directory
mkdir -p dist/public

# Copy assets if they exist
if [ -d "dist/assets" ]; then
  echo "Copying assets to public folder..."
  mkdir -p dist/public/assets
  cp -R dist/assets/* dist/public/assets/
fi

# Copy index.html to public folder
if [ -f "dist/index.html" ]; then
  echo "Copying index.html to public folder..."
  cp dist/index.html dist/public/
fi

echo "Deployment preparation complete!"