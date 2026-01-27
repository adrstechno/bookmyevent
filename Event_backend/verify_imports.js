// Script to verify all imports are working correctly
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verifying imports...');

try {
    // Test critical imports
    console.log('✅ Testing EmailService import...');
    const EmailService = await import('./Services/emailService.js');
    console.log('✅ EmailService imported successfully');

    console.log('✅ Testing NotificationService import...');
    const NotificationService = await import('./Services/NotificationService.js');
    console.log('✅ NotificationService imported successfully');

    console.log('✅ Testing BookingController import...');
    const BookingController = await import('./Controllers/BookingController.js');
    console.log('✅ BookingController imported successfully');

    console.log('✅ Testing UserController import...');
    const UserController = await import('./Controllers/UserController.js');
    console.log('✅ UserController imported successfully');

    console.log('🎉 All critical imports verified successfully!');

} catch (error) {
    console.error('❌ Import verification failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}