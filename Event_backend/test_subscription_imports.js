// Test script to verify subscription-related imports
console.log('🔍 Testing subscription imports...\n');

try {
    console.log('1. Testing Razorpay import...');
    import('razorpay').then(() => {
        console.log('   ✅ Razorpay imported successfully\n');
    }).catch(err => {
        console.error('   ❌ Razorpay import failed:', err.message);
    });

    console.log('2. Testing RazorpayService import...');
    import('./Services/RazorpayService.js').then(() => {
        console.log('   ✅ RazorpayService imported successfully\n');
    }).catch(err => {
        console.error('   ❌ RazorpayService import failed:', err.message);
    });

    console.log('3. Testing SubscriptionController import...');
    import('./Controllers/SubscriptionController.js').then(() => {
        console.log('   ✅ SubscriptionController imported successfully\n');
    }).catch(err => {
        console.error('   ❌ SubscriptionController import failed:', err.message);
    });

    console.log('4. Testing subscriptionMiddleware import...');
    import('./Utils/subscriptionMiddleware.js').then(() => {
        console.log('   ✅ subscriptionMiddleware imported successfully\n');
    }).catch(err => {
        console.error('   ❌ subscriptionMiddleware import failed:', err.message);
    });

    console.log('5. Testing SubscriptionRouter import...');
    import('./Router/SubscriptionRoute.js').then(() => {
        console.log('   ✅ SubscriptionRouter imported successfully\n');
        console.log('🎉 All subscription imports successful!');
    }).catch(err => {
        console.error('   ❌ SubscriptionRouter import failed:', err.message);
    });

} catch (error) {
    console.error('❌ Test failed:', error.message);
}