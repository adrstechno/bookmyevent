# Quick Deploy Reference Card

## 🚨 The Issue
- Cloudinary uploads failing with "Must supply api_key"
- ES6 imports are hoisted, executing before dotenv.config()
- Environment variables not available when Upload.js loads

## ✅ The Fix
- Changed Server.js to use dynamic imports (`await import()`)
- Ensures dotenv.config() runs BEFORE any router/module is loaded
- Removed duplicate dotenv calls from 5 files

## 🚀 Deploy Now

```bash
# SSH to production server
ssh ubuntu@your-ec2-ip

# Navigate and pull
cd /home/ubuntu/bookmyevent
git pull origin main

# Restart
pm2 restart goeventify-backend

# Check logs
pm2 logs goeventify-backend --lines 20
```

## ✅ Success Indicators

Look for these in the logs:
```
[dotenv@17.2.3] injecting env (16) from Event_backend/.env
✅ Environment variables loaded successfully
✅ Server starting on port: 3232
✅ Cloudinary configured: dcbrlmzng
✅ Cloudinary configured in Upload.js
✅ Server is running on port 3232
```

## ❌ Failure Indicators

If you see these, something is wrong:
```
❌ Missing required environment variables
❌ Must supply api_key
[dotenv@17.2.3] injecting env (0)  ← Should only see (16) or higher
```

## 🧪 Test After Deploy

1. Go to your frontend
2. Create/edit vendor profile
3. Upload profile picture
4. Upload event images
5. Verify images appear correctly

## 📞 Quick Troubleshooting

### Problem: Still seeing "injecting env (0)"
**Solution:** Check if you pulled the latest code
```bash
git log --oneline -5
git status
```

### Problem: "Must supply api_key"
**Solution:** Verify .env file
```bash
cat Event_backend/.env | grep Cloudnary
```
Should show:
- Cloudnary_CLOUD_NAME=dcbrlmzng
- Cloudnary_API_KEY=414672122595666
- Cloudnary_API_SECRET=kEVF5XDSMf1DJAwxtYYgQSwKUr4

### Problem: Server won't start
**Solution:** Check for syntax errors
```bash
node Event_backend/test-env-loading.js
```

## 📋 Files Changed (for reference)
- Server.js - Changed to dynamic imports (await import())
- Upload.js - Simplified configuration with better logging
- emailService.js - Removed dotenv
- RazorpayService.js - Removed dotenv
- sendgridService.js - Removed dotenv
- DatabaseCon.js - Removed dotenv

## 🎯 Expected Timeline
- Pull code: 10 seconds
- PM2 restart: 5 seconds
- Total downtime: ~15 seconds

## 📊 Monitoring Commands

```bash
# Real-time logs
pm2 logs goeventify-backend

# Server status
pm2 status

# Restart if needed
pm2 restart goeventify-backend

# Full restart (if issues persist)
pm2 stop goeventify-backend
pm2 start Event_backend/Server.js --name goeventify-backend
pm2 save
```
