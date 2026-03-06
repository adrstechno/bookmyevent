#!/bin/bash

echo "🚀 Setting up Razorpay Subscription System..."
echo ""

# Install dependencies
echo "📦 Installing Razorpay SDK..."
npm install razorpay

echo ""
echo "✅ Dependencies installed!"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "📝 .env file found"
    echo ""
    echo "⚠️  Please add your Razorpay credentials to .env:"
    echo "   RAZORPAY_KEY_ID=your_key_id"
    echo "   RAZORPAY_KEY_SECRET=your_key_secret"
    echo "   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret"
else
    echo "❌ .env file not found!"
    echo "   Please create .env file with Razorpay credentials"
fi

echo ""
echo "📊 Next steps:"
echo "   1. Add Razorpay credentials to .env"
echo "   2. Run database migration: mysql -u user -p database < update_subscription_schema.sql"
echo "   3. Restart the server: npm start"
echo "   4. Test subscription flow in frontend"
echo ""
echo "✨ Setup complete! Check SUBSCRIPTION_IMPLEMENTATION.md for detailed guide."