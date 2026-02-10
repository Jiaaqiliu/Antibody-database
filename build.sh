#!/bin/bash
set -e

echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

echo "Installing Node.js dependencies and building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Copying static files to backend..."
rm -rf backend/static
cp -r frontend/dist backend/static

echo "Build complete!"
