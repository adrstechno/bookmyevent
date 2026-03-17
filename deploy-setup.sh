#!/bin/bash

# AWS EC2 Deployment Setup Script
# Run this script on your EC2 instance to set up automated deployment

echo "🚀 Setting up AWS EC2 for automated deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# Install Git (if not already installed)
sudo apt install git -y

# Create project directory
echo "📁 Creating project directory..."
sudo mkdir -p /home/ubuntu/bookmyevent
sudo chown ubuntu:ubuntu /home/ubuntu/bookmyevent

# Create logs directory
mkdir -p /home/ubuntu/bookmyevent/logs

echo "✅ Basic setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Clone your repository: git clone <your-repo-url> /home/ubuntu/bookmyevent"
echo "2. Set up environment variables in Event_backend/.env and Frontend/.env"
echo "3. Configure Nginx using the provided nginx-config.conf"
echo "4. Add GitHub secrets for automated deployment"
echo "5. Test the deployment process"
echo ""
echo "🔧 Useful commands:"
echo "   pm2 status          - Check PM2 processes"
echo "   sudo nginx -t       - Test Nginx configuration"
echo "   ./scripts/health-check.sh - Run health check"