import db from '../Config/DatabaseCon.js';
import EmailService from './emailService.js';
import RazorpayService from './RazorpayService.js';

class SubscriptionNotificationService {
    // Check for subscriptions expiring in 7 days and send notifications
    static async checkExpiringSubscriptions() {
        try {
            // console.log('🔍 Checking for expiring subscriptions...');

            // Get subscriptions expiring in exactly 7 days
            const query = `
                SELECT 
                    vs.subscription_id,
                    vs.vendor_id,
                    vs.start_date,
                    vs.end_date,
                    vs.amount_paid,
                    vp.business_name,
                    u.email,
                    u.first_name,
                    u.last_name,
                    DATEDIFF(vs.end_date, NOW()) as days_remaining
                FROM vendor_subscriptions vs
                JOIN vendor_profiles vp ON vs.vendor_id = vp.vendor_id
                JOIN users u ON vp.user_id = u.user_id
                WHERE vs.status = 'active'
                AND DATEDIFF(vs.end_date, NOW()) = 7
            `;

            const expiringSubscriptions = await new Promise((resolve, reject) => {
                db.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // console.log(`📊 Found ${expiringSubscriptions.length} subscriptions expiring in 7 days`);

            // Send notification for each expiring subscription
            for (const subscription of expiringSubscriptions) {
                try {
                    await this.sendExpiryNotification(subscription);
                    // console.log(`✅ Notification sent to ${subscription.email}`);
                } catch (error) {
                    console.error(`❌ Failed to send notification to ${subscription.email}:`, error.message);
                }
            }

            return {
                success: true,
                count: expiringSubscriptions.length,
                message: `Processed ${expiringSubscriptions.length} expiring subscriptions`
            };

        } catch (error) {
            console.error('Error checking expiring subscriptions:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Send expiry notification email
    static async sendExpiryNotification(subscription) {
        const {
            vendor_id,
            business_name,
            email,
            first_name,
            last_name,
            end_date,
            days_remaining
        } = subscription;

        await EmailService.sendSubscriptionExpiryReminder({
            vendorEmail: email,
            vendorName: `${first_name} ${last_name}`,
            businessName: business_name,
            expiryDate: end_date,
            daysRemaining: days_remaining
        });

        // Log notification in database (optional)
        await this.logNotification(vendor_id, 'expiry_reminder', email);
    }

    // Check for subscriptions expiring today
    static async checkExpiredSubscriptions() {
        try {
            // console.log('🔍 Checking for expired subscriptions...');

            const query = `
                SELECT 
                    vs.subscription_id,
                    vs.vendor_id,
                    vs.end_date,
                    vp.business_name,
                    u.email,
                    u.first_name,
                    u.last_name
                FROM vendor_subscriptions vs
                JOIN vendor_profiles vp ON vs.vendor_id = vp.vendor_id
                JOIN users u ON vp.user_id = u.user_id
                WHERE vs.status = 'active'
                AND DATE(vs.end_date) = CURDATE()
            `;

            const expiredSubscriptions = await new Promise((resolve, reject) => {
                db.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // console.log(`📊 Found ${expiredSubscriptions.length} subscriptions expired today`);

            // Update status to expired and send notification
            for (const subscription of expiredSubscriptions) {
                try {
                    // Update subscription status
                    await this.updateSubscriptionStatus(subscription.subscription_id, 'expired');
                    
                    // Send expiry notification
                    await EmailService.sendSubscriptionExpiredNotification({
                        vendorEmail: subscription.email,
                        vendorName: `${subscription.first_name} ${subscription.last_name}`,
                        businessName: subscription.business_name,
                        expiryDate: subscription.end_date
                    });

                    // console.log(`✅ Expired notification sent to ${subscription.email}`);
                } catch (error) {
                    console.error(`❌ Failed to process expired subscription for ${subscription.email}:`, error.message);
                }
            }

            return {
                success: true,
                count: expiredSubscriptions.length,
                message: `Processed ${expiredSubscriptions.length} expired subscriptions`
            };

        } catch (error) {
            console.error('Error checking expired subscriptions:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update subscription status
    static async updateSubscriptionStatus(subscriptionId, status) {
        const query = `
            UPDATE vendor_subscriptions 
            SET status = ? 
            WHERE subscription_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(query, [status, subscriptionId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    // Log notification (optional - for tracking)
    static async logNotification(vendorId, notificationType, email) {
        const query = `
            INSERT INTO notification_logs (vendor_id, notification_type, recipient_email, sent_at)
            VALUES (?, ?, ?, NOW())
        `;

        return new Promise((resolve, reject) => {
            db.query(query, [vendorId, notificationType, email], (err, result) => {
                if (err) {
                    // If table doesn't exist, just log to console
                    // console.log('Notification log:', { vendorId, notificationType, email });
                    resolve();
                } else {
                    resolve(result);
                }
            });
        });
    }

    // Get subscription statistics
    static async getSubscriptionStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_subscriptions,
                    SUM(CASE WHEN status = 'active' AND end_date > NOW() THEN 1 ELSE 0 END) as active_subscriptions,
                    SUM(CASE WHEN status = 'active' AND DATEDIFF(end_date, NOW()) <= 7 AND DATEDIFF(end_date, NOW()) > 0 THEN 1 ELSE 0 END) as expiring_soon,
                    SUM(CASE WHEN status = 'expired' OR end_date <= NOW() THEN 1 ELSE 0 END) as expired_subscriptions,
                    SUM(amount_paid) as total_revenue
                FROM vendor_subscriptions
            `;

            const stats = await new Promise((resolve, reject) => {
                db.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });

            return {
                success: true,
                stats
            };

        } catch (error) {
            console.error('Error getting subscription stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Manual trigger for testing
    static async sendTestExpiryNotification(vendorId) {
        try {
            const query = `
                SELECT 
                    vs.subscription_id,
                    vs.vendor_id,
                    vs.end_date,
                    vp.business_name,
                    u.email,
                    u.first_name,
                    u.last_name,
                    DATEDIFF(vs.end_date, NOW()) as days_remaining
                FROM vendor_subscriptions vs
                JOIN vendor_profiles vp ON vs.vendor_id = vp.vendor_id
                JOIN users u ON vp.user_id = u.user_id
                WHERE vs.vendor_id = ?
                AND vs.status = 'active'
                LIMIT 1
            `;

            const subscription = await new Promise((resolve, reject) => {
                db.query(query, [vendorId], (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });

            if (!subscription) {
                throw new Error('No active subscription found for this vendor');
            }

            await this.sendExpiryNotification(subscription);

            return {
                success: true,
                message: 'Test notification sent successfully'
            };

        } catch (error) {
            console.error('Error sending test notification:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default SubscriptionNotificationService;
