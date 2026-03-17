# 🚀 Automated AWS EC2 Deployment Setup

This repository includes everything you need to set up automated deployment to AWS EC2 using GitHub Actions.

## 📁 Deployment Files Overview

```
├── .github/workflows/deploy.yml     # GitHub Actions workflow
├── deploy-setup.sh                  # EC2 initial setup script
├── ecosystem.config.js              # PM2 configuration
├── nginx-config.conf               # Nginx configuration template
├── scripts/
│   ├── deploy.sh                   # Main deployment script
│   └── health-check.sh             # Health monitoring script
├── deployment-guide.md             # Detailed setup guide
└── DEPLOYMENT_README.md            # This file
```

## 🚀 Quick Start

### 1. **Prepare Your EC2 Instance**

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Download and run setup script
wget https://raw.githubusercontent.com/yourusername/bookmyevent/main/deploy-setup.sh
chmod +x deploy-setup.sh
./deploy-setup.sh
```

### 2. **Clone Your Repository**

```bash
cd /home/ubuntu
git clone https://github.com/yourusername/bookmyevent.git bookmyevent
cd bookmyevent
```

### 3. **Configure Environment Variables**

```bash
# Backend environment
cp Event_backend/.env.example Event_backend/.env
nano Event_backend/.env

# Frontend environment  
cp Frontend/.env.example Frontend/.env
nano Frontend/.env
```

### 4. **Set Up GitHub Secrets**

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `EC2_HOST`: Your EC2 public IP or domain
- `EC2_USERNAME`: `ubuntu`
- `EC2_SSH_KEY`: Your private key content

### 5. **Configure Nginx**

```bash
# Copy Nginx configuration
sudo cp nginx-config.conf /etc/nginx/sites-available/goeventify

# Update domain name in the config
sudo nano /etc/nginx/sites-available/goeventify

# Enable the site
sudo ln -s /etc/nginx/sites-available/goeventify /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 6. **Initial Deployment**

```bash
# Install dependencies and build
cd Event_backend && npm install --production
cd ../Frontend && npm install && npm run build

# Start with PM2
cd /home/ubuntu/bookmyevent
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 7. **Test Automated Deployment**

```bash
# Make a test change and push
echo "// Deployment test" >> Event_backend/Server.js
git add .
git commit -m "Test automated deployment"
git push origin main
```

## 🔧 Configuration Details

### **GitHub Actions Workflow**
- Triggers on push to `main`/`master` branch
- Builds frontend and installs dependencies
- Deploys via SSH to EC2
- Runs health checks after deployment

### **PM2 Configuration**
- Process name: `goeventify-backend`
- Auto-restart on crashes
- Memory limit: 1GB
- Production environment variables

### **Nginx Configuration**
- Serves React frontend from `/dist`
- Proxies API requests to backend on port 3000
- Includes security headers and gzip compression
- Ready for SSL certificate integration

## 📊 Monitoring & Maintenance

### **Health Check**
```bash
# Run comprehensive health check
./scripts/health-check.sh
```

### **PM2 Commands**
```bash
pm2 status                    # Check process status
pm2 logs goeventify-backend   # View logs
pm2 restart goeventify-backend # Restart application
pm2 monit                     # Real-time monitoring
```

### **Nginx Commands**
```bash
sudo systemctl status nginx   # Check Nginx status
sudo nginx -t                 # Test configuration
sudo systemctl reload nginx   # Reload configuration
```

### **Log Files**
- Application logs: `/home/ubuntu/bookmyevent/logs/`
- Nginx logs: `/var/log/nginx/`
- Deployment logs: `/home/ubuntu/bookmyevent/logs/deploy.log`

## 🔒 SSL Certificate Setup

### **Install Certbot**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### **Get Certificate**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### **Auto-renewal**
```bash
# Test renewal
sudo certbot renew --dry-run

# Set up auto-renewal (already configured by certbot)
sudo systemctl status certbot.timer
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Deployment fails with SSH errors**
   - Check EC2 security group allows SSH (port 22)
   - Verify SSH key format in GitHub secrets
   - Ensure EC2 instance is running

2. **PM2 process won't start**
   ```bash
   cd /home/ubuntu/bookmyevent/Event_backend
   node Server.js  # Check for errors directly
   ```

3. **Nginx 502 Bad Gateway**
   ```bash
   pm2 status  # Check if backend is running
   sudo nginx -t  # Check Nginx configuration
   ```

4. **Frontend not loading**
   ```bash
   ls -la /home/ubuntu/bookmyevent/Frontend/dist/
   # Ensure build files exist
   ```

### **Emergency Recovery**
```bash
# Rollback to previous version
cd /home/ubuntu/bookmyevent
git log --oneline -5  # See recent commits
git reset --hard <previous-commit-hash>
./scripts/deploy.sh
```

## 📈 Performance Optimization

### **Enable Gzip Compression**
Already included in Nginx configuration

### **PM2 Cluster Mode**
```javascript
// In ecosystem.config.js
instances: 'max',  // Use all CPU cores
exec_mode: 'cluster'
```

### **Database Connection Pooling**
Ensure your database connections use pooling for better performance

## 🔄 Deployment Flow

1. **Developer pushes code** → GitHub repository
2. **GitHub Actions triggers** → Runs tests and builds
3. **SSH connection established** → To EC2 instance
4. **Code deployment** → Pull latest changes
5. **Dependencies installation** → Backend and frontend
6. **Frontend build** → Production optimized
7. **PM2 restart** → Zero-downtime deployment
8. **Health check** → Verify deployment success
9. **Nginx reload** → Serve new content

## 📞 Support

If you encounter issues:

1. Check the deployment logs: `tail -f /home/ubuntu/bookmyevent/logs/deploy.log`
2. Run health check: `./scripts/health-check.sh`
3. Check GitHub Actions logs in your repository
4. Verify all environment variables are set correctly

## 🎯 Production Checklist

- [ ] EC2 instance configured and secured
- [ ] GitHub secrets properly set
- [ ] Environment variables configured
- [ ] Nginx configuration updated with your domain
- [ ] SSL certificate installed
- [ ] PM2 processes running
- [ ] Automated deployment tested
- [ ] Health monitoring set up
- [ ] Backup strategy implemented
- [ ] Log rotation configured

Your automated deployment system is now ready! 🎉