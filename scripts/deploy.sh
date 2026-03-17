#!/bin/bash

# Backend-only deployment script for GoEventify
# This script runs on the EC2 instance during backend deployment

set -e  # Exit on any error

echo "🚀 Starting backend deployment process..."

# Configuration
PROJECT_DIR="/home/ubuntu/bookmyevent"
BACKEND_DIR="$PROJECT_DIR/Event_backend"
LOG_DIR="$PROJECT_DIR/logs"

# Create logs directory if it doesn't exist
mkdir -p $LOG_DIR

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_DIR/deploy.log
}

log "📁 Navigating to project directory: $PROJECT_DIR"
cd $PROJECT_DIR

# Check if git repository exists
if [ ! -d ".git" ]; then
    log "❌ Git repository not found. Please clone the repository first."
    exit 1
fi

log "📥 Pulling latest backend changes from repository..."
git fetch origin
git reset --hard origin/main

log "🔧 Installing backend dependencies..."
cd $BACKEND_DIR
npm install --production --silent

log "🔄 Restarting backend service with PM2..."
cd $PROJECT_DIR

# Check if PM2 process exists
if pm2 describe goeventify-backend > /dev/null 2>&1; then
    log "♻️ Restarting existing PM2 process..."
    pm2 restart goeventify-backend
else
    log "🆕 Starting new PM2 process..."
    pm2 start ecosystem.config.js --env production
fi

log "💾 Saving PM2 configuration..."
pm2 save

# Wait for application to start
log "⏳ Waiting for application to start..."
sleep 5

log "🏥 Running backend health check..."
if curl -f -s --max-time 10 http://localhost:3000 > /dev/null; then
    log "✅ Backend is responding on port 3000"
else
    log "❌ Backend health check failed"
    pm2 logs goeventify-backend --lines 20
    exit 1
fi

log "🧹 Cleaning up..."
# Clean npm cache
cd $BACKEND_DIR
npm cache clean --force

log "📊 Checking application status..."
pm2 status

log "✅ Backend deployment completed successfully!"
log "🌍 Backend API is running at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"

# Optional: Send deployment notification
if [ ! -z "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚀 GoEventify Backend deployed successfully to production!"}' \
        $SLACK_WEBHOOK
fi

exit 0