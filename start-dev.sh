#!/bin/bash

# Ross AI Legal Platform - Development Server
# Fixed HMR Configuration

echo "🚀 Ross AI Legal Platform - Starting Development Server"
echo "======================================================"

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Clear caches for fresh start
echo "🗑️  Clearing development caches..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# Set environment
export NODE_ENV=development

# Start with simplified settings
echo "🔥 Starting with HMR on 127.0.0.1:3000"
echo "📱 Open http://127.0.0.1:3000 in your browser"
echo ""

npm run dev