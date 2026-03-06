import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Test script to generate a test token for the vendor
const testVendorAuth = () => {
    console.log('🧪 Testing Subscription Authentication\n');

    // Vendor UUID from debug script
    const vendorUUID = '7c128f9c-bc39-4c34-9b8b-7e5bcd63c37d';
    const vendorEmail = 'annpurnasha474@gmail.com';

    console.log('Vendor Info:');
    console.log('- UUID:', vendorUUID);
    console.log('- Email:', vendorEmail);
    console.log('- Vendor ID: 330001\n');

    // Generate test token
    const token = jwt.sign(
        { userId: vendorUUID },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    console.log('✅ Generated Test Token:\n');
    console.log(token);
    console.log('\n📋 To test manually:');
    console.log('1. Copy the token above');
    console.log('2. Open browser DevTools > Application > Local Storage');
    console.log('3. Set key "token" with the value above');
    console.log('4. Refresh the page');
    console.log('5. Try the subscription payment\n');

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified successfully:');
        console.log('- User ID:', decoded.userId);
        console.log('- Expires:', new Date(decoded.exp * 1000).toLocaleString());
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
    }
};

testVendorAuth();
