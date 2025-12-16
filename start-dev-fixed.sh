#!/bin/bash

# Enhanced Development Server Startup Script
# This script ensures HMR works reliably by clearing caches and killing existing processes

echo "🔧 Starting Ross AI Legal Platform Development Server..."

# Kill any existing node/vite processes on ports 3000-3001
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "node.*3000" 2>/dev/null || true

# Clear various caches
echo "🗑️  Clearing caches..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Clear npm cache
npm cache clean --force 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

# Ensure proper file permissions
echo "🔒 Setting file permissions..."
chmod -R 755 src/ 2>/dev/null || true
chmod -R 755 public/ 2>/dev/null || true

# Set NODE_ENV
export NODE_ENV=development
export VITE_DEV_MODE=true

echo "🚀 Starting development server with HMR..."
echo "📱 Server will be available at: http://127.0.0.1:3000"
echo "🔥 HMR will run on port: 3001"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the development server with optimized settings
npm run dev -- --host 127.0.0.1 --port 3000 --force