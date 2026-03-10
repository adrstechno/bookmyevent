#!/bin/bash

echo "🚀 Deploying to Production (EC2)..."
echo ""

# Update .env with production settings
echo "📝 Updating environment variables..."
sed -i 's|FRONTEND_URL=http://localhost:5173|FRONTEND_URL=https://goeventify.com|g' .env
sed -i '/NODE_ENV/d' .env
echo "NODE_ENV=production" >> .env

echo "✅ Environment updated"
echo ""

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart goeventify

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check logs: pm2 logs goeventify --lines 50"
echo "2. Verify email URL is correct (should show https://goeventify.com)"
echo "3. Test registration to confirm emails work"
echo ""
