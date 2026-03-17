#!/bin/bash

# Backend-only health check script for GoEventify
# Run this to verify your backend deployment is working correctly

echo "🏥 GoEventify Backend Health Check"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Check system resources
echo -e "\n📊 System Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
echo "Memory Usage: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
echo "Disk Usage: $(df -h / | awk 'NR==2{printf "%s", $5}')"

# Check if PM2 is running
echo -e "\n🔄 PM2 Status:"
if command -v pm2 &> /dev/null; then
    pm2 status
    PM2_STATUS=$?
    print_status $PM2_STATUS "PM2 is installed and running"
else
    print_status 1 "PM2 is not installed"
fi

# Check if backend is running
echo -e "\n🖥️ Backend Service:"
if pm2 describe goeventify-backend &> /dev/null; then
    print_status 0 "Backend process is running"
    
    # Check if backend is responding
    if curl -f -s --max-time 5 http://localhost:3000 &> /dev/null; then
        print_status 0 "Backend is responding on port 3000"
        
        # Test API endpoint
        if curl -f -s --max-time 5 http://localhost:3000/User/health &> /dev/null; then
            print_status 0 "API health endpoint is working"
        else
            print_warning "API health endpoint not responding (this may be normal if not implemented)"
        fi
    else
        print_status 1 "Backend is not responding on port 3000"
    fi
else
    print_status 1 "Backend process is not running"
fi

# Check backend environment file
echo -e "\n⚙️ Backend Configuration:"
if [ -f "/home/ubuntu/bookmyevent/Event_backend/.env" ]; then
    print_status 0 "Backend environment file exists"
    
    # Check for required environment variables (without showing values)
    ENV_FILE="/home/ubuntu/bookmyevent/Event_backend/.env"
    
    if grep -q "^PORT=" "$ENV_FILE"; then
        print_status 0 "PORT environment variable is set"
    else
        print_warning "PORT environment variable not found"
    fi
    
    if grep -q "^DB_" "$ENV_FILE"; then
        print_status 0 "Database configuration found"
    else
        print_warning "Database configuration not found"
    fi
    
    if grep -q "^EMAIL_" "$ENV_FILE"; then
        print_status 0 "Email configuration found"
    else
        print_warning "Email configuration not found"
    fi
else
    print_status 1 "Backend environment file not found"
fi

# Check Node.js and npm versions
echo -e "\n📦 Runtime Environment:"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js is installed ($NODE_VERSION)"
else
    print_status 1 "Node.js is not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status 0 "NPM is installed ($NPM_VERSION)"
else
    print_status 1 "NPM is not installed"
fi

# Check backend dependencies
echo -e "\n📚 Backend Dependencies:"
if [ -f "/home/ubuntu/bookmyevent/Event_backend/package.json" ]; then
    print_status 0 "Backend package.json exists"
    
    if [ -d "/home/ubuntu/bookmyevent/Event_backend/node_modules" ]; then
        print_status 0 "Backend node_modules directory exists"
    else
        print_status 1 "Backend node_modules directory not found"
    fi
else
    print_status 1 "Backend package.json not found"
fi

# Check recent logs for errors
echo -e "\n📋 Recent Logs:"
if [ -f "/home/ubuntu/bookmyevent/logs/err.log" ]; then
    ERROR_COUNT=$(tail -100 /home/ubuntu/bookmyevent/logs/err.log 2>/dev/null | wc -l)
    if [ $ERROR_COUNT -eq 0 ]; then
        print_status 0 "No recent errors in application logs"
    else
        print_warning "$ERROR_COUNT lines in error log (last 100 lines)"
        echo "Recent errors:"
        tail -5 /home/ubuntu/bookmyevent/logs/err.log 2>/dev/null | sed 's/^/  /'
    fi
else
    print_warning "Error log file not found"
fi

# Check disk space
echo -e "\n💾 Storage Status:"
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    print_status 0 "Disk usage is healthy ($DISK_USAGE%)"
elif [ $DISK_USAGE -lt 90 ]; then
    print_warning "Disk usage is high ($DISK_USAGE%)"
else
    print_status 1 "Disk usage is critical ($DISK_USAGE%)"
fi

# Check network connectivity
echo -e "\n🌍 Network Connectivity:"
if curl -f -s --max-time 5 http://google.com &> /dev/null; then
    print_status 0 "Internet connectivity is working"
else
    print_status 1 "Internet connectivity issues detected"
fi

# Check if port 3000 is accessible externally (if security group allows)
echo -e "\n🔌 External Access:"
PUBLIC_IP=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
if [ ! -z "$PUBLIC_IP" ]; then
    echo "Public IP: $PUBLIC_IP"
    if curl -f -s --max-time 5 "http://$PUBLIC_IP:3000" &> /dev/null; then
        print_status 0 "Backend is accessible externally on port 3000"
    else
        print_warning "Backend not accessible externally (check security group settings)"
    fi
else
    print_warning "Could not determine public IP"
fi

# Final summary
echo -e "\n📋 Backend Health Check Summary:"
echo "=================================="
echo "Timestamp: $(date)"
echo "Server: $(hostname)"
echo "Uptime: $(uptime -p)"

# PM2 process summary
if command -v pm2 &> /dev/null; then
    echo -e "\n🔄 PM2 Process Summary:"
    pm2 jlist | jq -r '.[] | select(.name=="goeventify-backend") | "Status: \(.pm2_env.status), CPU: \(.monit.cpu)%, Memory: \(.monit.memory/1024/1024 | floor)MB, Uptime: \(.pm2_env.pm_uptime | strftime("%Y-%m-%d %H:%M:%S"))"' 2>/dev/null || echo "PM2 process info not available"
fi

echo -e "\n✅ Backend health check completed!"
echo -e "\n💡 Quick Commands:"
echo "   pm2 logs goeventify-backend  # View backend logs"
echo "   pm2 restart goeventify-backend  # Restart backend"
echo "   pm2 monit  # Real-time monitoring"