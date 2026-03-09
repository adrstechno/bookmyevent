#!/bin/bash

echo "🔒 Setting up HTTPS for EC2 Backend"
echo "===================================="
echo ""

# This script sets up Nginx as a reverse proxy with Let's Encrypt SSL
# for your Node.js backend running on port 3232

echo "📋 Prerequisites:"
echo "1. You need a domain/subdomain pointing to your EC2 IP (13.233.131.46)"
echo "   Example: api.goeventify.com"
echo "2. Port 80 and 443 must be open in EC2 Security Group"
echo ""
read -p "Enter your API domain (e.g., api.goeventify.com): " API_DOMAIN
echo ""

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt update
sudo apt install -y nginx

# Install Certbot for Let's Encrypt
echo "📦 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create Nginx configuration
echo "⚙️ Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/goeventify-api > /dev/null <<EOF
server {
    listen 80;
    server_name $API_DOMAIN;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $API_DOMAIN;

    # SSL certificates (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/$API_DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$API_DOMAIN/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3232;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS headers (backup, your Express already handles this)
        add_header 'Access-Control-Allow-Origin' 'https://goeventify.com' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Increase timeouts for long-running requests
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
EOF

# Enable the site
echo "✅ Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/goeventify-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    sudo systemctl restart nginx
    echo "✅ Nginx restarted"
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

# Get SSL certificate
echo ""
echo "🔒 Getting SSL certificate from Let's Encrypt..."
echo "This will automatically configure SSL in Nginx"
sudo certbot --nginx -d $API_DOMAIN --non-interactive --agree-tos --email admin@goeventify.com

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificate installed successfully!"
    echo ""
    echo "🎉 Setup Complete!"
    echo "===================="
    echo ""
    echo "Your API is now available at: https://$API_DOMAIN"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update Frontend .env:"
    echo "   VITE_API_BASE_URL=https://$API_DOMAIN"
    echo ""
    echo "2. Update Backend CORS in Server.js to include:"
    echo "   https://$API_DOMAIN"
    echo ""
    echo "3. Test your API:"
    echo "   curl https://$API_DOMAIN"
    echo ""
    echo "4. SSL certificate will auto-renew via certbot"
    echo ""
else
    echo "❌ Failed to get SSL certificate"
    echo "Make sure:"
    echo "1. Domain $API_DOMAIN points to this server (13.233.131.46)"
    echo "2. Ports 80 and 443 are open in EC2 Security Group"
    exit 1
fi
