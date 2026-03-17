# 🚀 AWS EC2 Automated Deployment Guide

This guide will help you set up automated deployment for your GoEventify application on AWS EC2 using GitHub Actions.

## 📋 Prerequisites

- AWS EC2 instance running Ubuntu 20.04 or later
- GitHub repository for your project
- Domain name (optional but recommended)

## 🔧 Step 1: EC2 Setup

### 1.1 Connect to your EC2 instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 1.2 Run the setup script
```bash
# Make the script executable
chmod +x deploy-setup.sh

# Run the setup script
./deploy-setup.sh
```

### 1.3 Manual setup (if script fails)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Create project directory
sudo mkdir -p /home/ubuntu/bookmyevent
sudo chown ubuntu:ubuntu /home/ubuntu/bookmyevent
```

## 🔑 Step 2: GitHub Secrets Setup

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

```
EC2_HOST = your-ec2-public-ip-or-domain
EC2_USERNAME = ubuntu
EC2_SSH_KEY = your-private-key-content
```

### 2.1 Getting your SSH private key
```bash
# On your local machine, copy the private key content
cat ~/.ssh/your-ec2-key.pem
```
Copy the entire content (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

## 🌐 Step 3: Nginx Configuration

### 3.1 Create Nginx configuration
```bash
sudo nano /etc/nginx/sites-available/goeventify
```

Copy the content from `nginx-config.conf` file and update:
- Replace `your-domain.com` with your actual domain
- Update paths if different

### 3.2 Enable the site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/goeventify /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 Step 4: SSL Certificate (Optional but Recommended)

### 4.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 4.2 Get SSL certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 📁 Step 5: Initial Deployment

### 5.1 Clone your repository
```bash
cd /home/ubuntu
git clone https://github.com/yourusername/bookmyevent.git
cd bookmyevent
```

### 5.2 Set up environment variables
```bash
# Backend environment
cd Event_backend
cp .env.example .env
nano .env  # Add your production environment variables

# Frontend environment
cd ../Frontend
cp .env.example .env
nano .env  # Add your production environment variables
```

### 5.3 Install dependencies and build
```bash
# Backend
cd Event_backend
npm install --production

# Frontend
cd ../Frontend
npm install
npm run build
```

### 5.4 Start with PM2
```bash
cd /home/ubuntu/bookmyevent
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🔄 Step 6: Test Automated Deployment

### 6.1 Make a test change
```bash
# On your local machine
echo "console.log('Deployment test');" >> Event_backend/Server.js
git add .
git commit -m "Test automated deployment"
git push origin main
```

### 6.2 Monitor deployment
- Go to your GitHub repository → Actions tab
- Watch the deployment process
- Check your EC2 instance logs: `pm2 logs`

## 📊 Step 7: Monitoring and Maintenance

### 7.1 PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart application
pm2 restart goeventify-backend

# Monitor in real-time
pm2 monit
```

### 7.2 Nginx Commands
```bash
# Check status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### 7.3 System Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

## 🔧 Troubleshooting

### Common Issues:

1. **Deployment fails with permission errors**
   ```bash
   sudo chown -R ubuntu:ubuntu /home/ubuntu/bookmyevent
   ```

2. **PM2 process not starting**
   ```bash
   cd /home/ubuntu/bookmyevent/Event_backend
   node Server.js  # Check for errors
   ```

3. **Nginx 502 Bad Gateway**
   ```bash
   # Check if backend is running
   pm2 status
   
   # Check Nginx configuration
   sudo nginx -t
   ```

4. **GitHub Actions SSH connection fails**
   - Verify EC2 security group allows SSH (port 22)
   - Check SSH key format in GitHub secrets
   - Ensure EC2 instance is running

## 🎯 Production Checklist

- [ ] EC2 instance configured and running
- [ ] GitHub secrets added
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Environment variables set
- [ ] PM2 process running
- [ ] Automated deployment tested
- [ ] Monitoring set up
- [ ] Backup strategy in place

## 🚀 Deployment Flow

1. **Developer pushes code** → GitHub repository
2. **GitHub Actions triggers** → Runs deployment workflow
3. **Code is pulled** → On EC2 instance
4. **Dependencies installed** → Backend and frontend
5. **Frontend built** → Production build created
6. **PM2 restarts** → Backend application
7. **Nginx reloaded** → Serves new frontend
8. **Deployment complete** → Application updated

Your automated deployment is now ready! Every push to the main branch will automatically deploy to your EC2 instance. 🎉