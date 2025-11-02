#!/bin/bash

# Finton Easy Installation Script
# This script ensures all dependencies are properly installed and native modules are compiled for Electron

set -e  # Exit on any error

echo "🐾 Finton Installation Script"
echo "=============================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Check for Python (needed for node-gyp)
if ! command -v python3 &> /dev/null; then
    echo "⚠️  Python 3 not found. Installing setuptools for build tools..."
    echo "   (You may need to install Python 3 manually if this fails)"
else
    echo "✓ Python 3 version: $(python3 --version)"
    # Install setuptools for node-gyp (needed for better-sqlite3)
    echo "📦 Installing Python setuptools for native module compilation..."
    python3 -m pip install --break-system-packages setuptools 2>/dev/null || echo "   (setuptools may already be installed)"
fi

echo ""
echo "📦 Installing npm dependencies..."
npm install

echo ""
echo "🔧 Building main and preload processes..."
npm run build:main
npm run build:preload

echo ""
echo "⚡ Rebuilding native modules for Electron..."
npx electron-rebuild

echo ""
echo "✅ Installation complete!"
echo ""
echo "🚀 To start the app, run:"
echo "   npm run dev"
echo ""
