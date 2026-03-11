import cron from 'node-cron';
import SubscriptionNotificationService from '../Services/SubscriptionNotificationService.js';

class SubscriptionCronJobs {
    static init() {
        // console.log('🕐 Initializing subscription cron jobs...');

        // Run every day at 9:00 AM to check for expiring subscriptions
        cron.schedule('0 9 * * *', async () => {
            // console.log('⏰ Running daily subscription expiry check...');
            try {
                const result = await SubscriptionNotificationService.checkExpiringSubscriptions();
                // console.log('✅ Expiry check completed:', result);
            } catch (error) {
                console.error('❌ Error in expiry check cron:', error);
            }
        });

        // Run every day at 10:00 AM to check for expired subscriptions
        cron.schedule('0 10 * * *', async () => {
            // console.log('⏰ Running daily expired subscription check...');
            try {
                const result = await SubscriptionNotificationService.checkExpiredSubscriptions();
                // console.log('✅ Expired check completed:', result);
            } catch (error) {
                console.error('❌ Error in expired check cron:', error);
            }
        });

        // Optional: Run every hour to check for immediate expiries
        cron.schedule('0 * * * *', async () => {
            // console.log('⏰ Running hourly subscription status check...');
            try {
                const stats = await SubscriptionNotificationService.getSubscriptionStats();
                // console.log('📊 Subscription stats:', stats);
            } catch (error) {
                console.error('❌ Error in stats check cron:', error);
            }
        });

        // console.log('✅ Subscription cron jobs initialized successfully');
        // console.log('   - Daily expiry check: 9:00 AM');
        // console.log('   - Daily expired check: 10:00 AM');
        // console.log('   - Hourly stats check: Every hour');
    }

    // Manual trigger for testing
    static async runExpiryCheckNow() {
        // console.log('🔄 Manually triggering expiry check...');
        return await SubscriptionNotificationService.checkExpiringSubscriptions();
    }

    static async runExpiredCheckNow() {
        // console.log('🔄 Manually triggering expired check...');
        return await SubscriptionNotificationService.checkExpiredSubscriptions();
    }
}

export default SubscriptionCronJobs;
