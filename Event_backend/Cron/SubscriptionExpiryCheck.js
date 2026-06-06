// ============================================================================
// SubscriptionExpiryCheck.js - CRON Job for Subscription Management
// Purpose: Check for expiring subscriptions and send reminder emails
// Date: May 26, 2026
// Schedule: Daily at 00:00 UTC (or as configured)
// Feature: always enabled
// ============================================================================

import db from '../Config/DatabaseCon.js';
import EmailService from '../Services/emailService.js';
import SubscriptionService from '../Services/SubscriptionService.js';

class SubscriptionExpiryCheck {
  /**
   * Check for subscriptions expiring in 7 days and send reminders
   * Run this daily via CRON job
   */
  static async checkAndNotifyExpiringSubscriptions() {
    const FEATURE_ENABLED = true;

    console.log('🔍 Starting subscription expiry check at', new Date().toISOString());

    try {
      // Find subscriptions expiring in exactly 7 days (within 24 hour window)
      const query = `
        SELECT
          vs.*,
          vp.vendor_id,
          vp.business_name,
          u.email,
          u.first_name,
          u.last_name
        FROM vendor_subscriptions vs
        JOIN vendor_profiles vp ON vs.vendor_id = vp.vendor_id
        JOIN users u ON vp.user_id = u.user_id OR vp.user_id = u.uuid
        WHERE
          vs.status = 'active'
          AND vs.end_date > NOW()
          AND DATE(vs.end_date) = DATE(NOW() + INTERVAL 7 DAY)
          AND (vs.expiry_reminder_sent IS NULL OR vs.expiry_reminder_sent = FALSE)
        ORDER BY vs.end_date ASC
      `;

      const expiringSubscriptions = await new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
          if (err) {
            console.error('❌ Error querying expiring subscriptions:', err);
            reject(err);
          } else {
            resolve(results || []);
          }
        });
      });

      console.log(`📧 Found ${expiringSubscriptions.length} subscriptions expiring in 7 days`);

      let successCount = 0;
      let errorCount = 0;

      // Send reminder emails
      for (const subscription of expiringSubscriptions) {
        try {
          const daysRemaining = 7;
          const renewalDate = new Date(subscription.end_date).toLocaleDateString();

          // Send email
          if (subscription.email) {
            await EmailService.sendSubscriptionExpiryReminderEmail({
              vendorEmail: subscription.email,
              vendorName: `${subscription.first_name} ${subscription.last_name}`,
              businessName: subscription.business_name,
              daysRemaining: daysRemaining,
              renewalDate: renewalDate,
              planType: subscription.plan_type,
              upgradeUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/upgrade-subscription`
            });

            console.log(`✅ Email sent to ${subscription.email} for subscription ending on ${renewalDate}`);
            successCount++;
          }

          // Mark reminder as sent
          const updateQuery = `
            UPDATE vendor_subscriptions
            SET expiry_reminder_sent = TRUE, expiry_reminder_sent_at = NOW()
            WHERE subscription_id = ?
          `;

          await new Promise((resolve, reject) => {
            db.query(updateQuery, [subscription.subscription_id], (err) => {
              if (err) {
                console.error('Error marking reminder as sent:', err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
        } catch (emailError) {
          console.error('❌ Error sending reminder for subscription:', subscription.subscription_id, emailError);
          errorCount++;
        }
      }

      console.log(`✅ Expiry check completed: ${successCount} emails sent, ${errorCount} errors`);

      return {
        success: true,
        message: 'Subscription expiry check completed',
        processed: expiringSubscriptions.length,
        sent: successCount,
        errors: errorCount
      };
    } catch (error) {
      console.error('❌ Fatal error in subscription expiry check:', error);
      return {
        success: false,
        message: 'Subscription expiry check failed',
        error: error.message
      };
    }
  }

  /**
   * Mark subscriptions as expired if end_date has passed
   * Run this daily via CRON job
   */
  static async expireSubscriptions() {
    console.log('🔍 Starting subscription expiration check at', new Date().toISOString());

    try {
      // Find subscriptions that have expired
      const query = `
        SELECT
          vs.*,
          vp.vendor_id,
          u.email,
          u.first_name,
          u.last_name
        FROM vendor_subscriptions vs
        JOIN vendor_profiles vp ON vs.vendor_id = vp.vendor_id
        JOIN users u ON vp.user_id = u.user_id OR vp.user_id = u.uuid
        WHERE
          vs.status = 'active'
          AND vs.end_date <= NOW()
      `;

      const expiredSubscriptions = await new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
          if (err) {
            console.error('❌ Error querying expired subscriptions:', err);
            reject(err);
          } else {
            resolve(results || []);
          }
        });
      });

      console.log(`⏰ Found ${expiredSubscriptions.length} expired subscriptions`);

      let processedCount = 0;
      let errorCount = 0;

      // Process expired subscriptions
      for (const subscription of expiredSubscriptions) {
        try {
          // Update subscription status
          const updateQuery = `
            UPDATE vendor_subscriptions
            SET status = 'expired'
            WHERE subscription_id = ?
          `;

          await new Promise((resolve, reject) => {
            db.query(updateQuery, [subscription.subscription_id], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          // Update vendor profile
          const profileUpdateQuery = `
            UPDATE vendor_profiles
            SET current_subscription_status = 'expired'
            WHERE vendor_id = ?
          `;

          await new Promise((resolve, reject) => {
            db.query(profileUpdateQuery, [subscription.vendor_id], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          // Send expiry notification email
          try {
            await EmailService.sendSubscriptionExpiredEmail({
              vendorEmail: subscription.email,
              vendorName: `${subscription.first_name} ${subscription.last_name}`,
              planType: subscription.plan_type,
              upgradeUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/upgrade-subscription`
            });
          } catch (emailError) {
            console.error('Error sending expiry notification:', emailError);
          }

          console.log(`✅ Subscription expired for vendor ${subscription.vendor_id}`);
          processedCount++;
        } catch (error) {
          console.error('❌ Error processing expired subscription:', subscription.subscription_id, error);
          errorCount++;
        }
      }

      console.log(`✅ Expiration check completed: ${processedCount} subscriptions expired, ${errorCount} errors`);

      return {
        success: true,
        message: 'Subscription expiration completed',
        processed: processedCount,
        errors: errorCount
      };
    } catch (error) {
      console.error('❌ Fatal error in subscription expiration check:', error);
      return {
        success: false,
        message: 'Subscription expiration failed',
        error: error.message
      };
    }
  }

  /**
   * Run both checks (recommended to run daily)
   */
  static async runAllChecks() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   Running Subscription Maintenance Checks                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
      const expiryResult = await this.checkAndNotifyExpiringSubscriptions();
      console.log('Expiry check result:', expiryResult);

      console.log('\n---\n');

      const expiredResult = await this.expireSubscriptions();
      console.log('Expiration check result:', expiredResult);

      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║   Subscription Maintenance Checks Completed                ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');

      return {
        success: true,
        expiryCheck: expiryResult,
        expirationCheck: expiredResult
      };
    } catch (error) {
      console.error('❌ Fatal error in subscription checks:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default SubscriptionExpiryCheck;

// ============================================================================
// USAGE: Add to your CRON job scheduling system
// ============================================================================
//
// Option 1: Using node-cron package
//
//   import cron from 'node-cron';
//   import SubscriptionExpiryCheck from './Cron/SubscriptionExpiryCheck.js';
//
//   // Run daily at 00:00 UTC
//   cron.schedule('0 0 * * *', async () => {
//     await SubscriptionExpiryCheck.runAllChecks();
//   });
//
// Option 2: Using system crontab
//
//   0 0 * * * cd /path/to/project && node -e "import SubscriptionExpiryCheck from './Event_backend/Cron/SubscriptionExpiryCheck.js'; SubscriptionExpiryCheck.runAllChecks();"
//
// Option 3: Using pm2 cron module
//
//   pm2 install pm2-cron
//   pm2 cron "0 0 * * *" "npm run cron:subscription-check"
//
// ============================================================================
