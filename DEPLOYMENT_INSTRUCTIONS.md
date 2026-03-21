# Production Deployment - Environment Variables Fix

## Quick Summary
Fixed production issue where environment variables weren't loading properly due to:
1. Multiple files calling `dotenv.config()` without correct path
2. Cloudinary configuration not being validated

## What Was Changed
- Updated `Event_backend/Server.js` to explicitly load `.env` from the correct directory
- Removed duplicate `dotenv.config()` calls from:
  - `Event_backend/Services/emailService.js`
  - `Event_backend/Services/RazorpayService.js`
  - `Event_backend/Services/sendgridService.js`
  - `Event_backend/Config/DatabaseCon.js`
- Added Cloudinary configuration validation in `Event_backend/Utils/Upload.js`
- Added environment variable validation on startup
- Created test script to verify environment loading

## Deploy to Production

### Option 1: Automated Deployment (Recommended)
```bash
ssh ubuntu@your-ec2-ip
cd /home/ubuntu/bookmyevent
chmod +x deploy-to-production.sh
./deploy-to-production.sh
```

### Option 2: Manual Deployment

### Option 2: Manual Deployment

#### Step 1: SSH to Server
```bash
ssh ubuntu@your-ec2-ip
cd /home/ubuntu/bookmyevent
```

#### Step 2: Pull Changes
```bash
git pull origin main
```

#### Step 3: Test Environment Loading
```bash
node Event_backend/test-env-loading.js
```
Should show: `✅ All critical environment variables are present!`

#### Step 4: Restart Backend
```bash
pm2 restart goeventify-backend
pm2 logs goeventify-backend --lines 30
```

### Expected Output
You should see ONLY ONE dotenv message (not 3-4):
```
[dotenv@17.2.3] injecting env (16) from Event_backend/.env
✅ Environment variables loaded successfully
✅ Server starting on port: 3232
✅ Cloudinary configured: dcbrlmzng
✅ Cloudinary configured successfully
```

### Step 5: Test Vendor Creation
Use your frontend to create a vendor profile. Should work without 500 errors.

## Troubleshooting

If still showing errors:
1. Check .env file exists: `ls -la Event_backend/.env`
2. Verify PM2 process name: `pm2 list`
3. Check full logs: `pm2 logs goeventify-backend --lines 100`

## Files Modified
- `Event_backend/Server.js` - Fixed dotenv path resolution and added validation
- `Event_backend/Utils/Upload.js` - Added Cloudinary configuration validation
- `Event_backend/Services/emailService.js` - Removed duplicate dotenv.config()
- `Event_backend/Services/RazorpayService.js` - Removed duplicate dotenv.config()
- `Event_backend/Services/sendgridService.js` - Removed duplicate dotenv.config()
- `Event_backend/Config/DatabaseCon.js` - Removed duplicate dotenv import
- `Event_backend/test-env-loading.js` - New test script (optional)
- `deploy-to-production.sh` - New automated deployment script
