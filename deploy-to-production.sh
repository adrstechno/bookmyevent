#!/bin/bash

# Production Deployment Script for GoEventify Backend
# This script should be run on the AWS EC2 server

set -e  # Exit on any error

echo "🚀 Starting GoEventify Backend Deployment"
echo "=========================================="

# Navigate to project directory
cd /home/ubuntu/bookmyevent

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin main

# Check if .env file exists
if [ ! -f "Event_backend/.env" ]; then
    echo "❌ ERROR: Event_backend/.env file not found!"
    echo "Please create the .env file with all required variables."
    exit 1
fi

# Test environment variable loading
echo ""
echo "🧪 Testing environment variable loading..."
node Event_backend/test-env-loading.js

if [ $? -ne 0 ]; then
    echo "❌ Environment variable test failed!"
    echo "Please check your .env file."
    exit 1
fi

# Install/update dependencies
echo ""
echo "📦 Installing dependencies..."
cd Event_backend
npm install --production
cd ..

# Restart PM2 process
echo ""
echo "🔄 Restarting PM2 process..."
pm2 restart goeventify-backend

# Wait a moment for the server to start
sleep 3

# Check PM2 status
echo ""
echo "📊 PM2 Status:"
pm2 list

# Show recent logs
echo ""
echo "📋 Recent logs:"
pm2 logs goeventify-backend --lines 20 --nostream

echo ""
echo "✅ Deployment complete!"
echo ""
echo "To monitor logs in real-time, run:"
echo "  pm2 logs goeventify-backend"
echo ""
echo "To check server status:"
echo "  pm2 status"
echo ""
