// ============================================================================
// SubscriptionService.js - Subscription Management Helper Functions
// Purpose: Centralized service for subscription-related operations
// Date: May 26, 2026
// Status: FEATURE FLAGS CONTROLLED - Functions exist but are conditional
// ============================================================================

import db from '../Config/DatabaseCon.js';

class SubscriptionService {
  // ===== SUBSCRIPTION RETRIEVAL =====

  /**
   * Get current active subscription for a vendor
   * @param {number} vendor_id - Vendor ID
   * @returns {Promise<Array>} Array with subscription record or empty
   */
  static async getActiveSubscription(vendor_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT *,
          CASE
            WHEN plan_type = 'free' THEN LEAST(COALESCE(end_date, DATE_ADD(start_date, INTERVAL 90 DAY)), DATE_ADD(start_date, INTERVAL 90 DAY))
            ELSE end_date
          END AS effective_end_date
        FROM vendor_subscriptions
        WHERE vendor_id = ?
          AND status = 'active'
          AND (
            (plan_type = 'free' AND LEAST(COALESCE(end_date, DATE_ADD(start_date, INTERVAL 90 DAY)), DATE_ADD(start_date, INTERVAL 90 DAY)) > NOW())
            OR (plan_type = 'premium' AND end_date > NOW())
          )
        ORDER BY effective_end_date DESC LIMIT 1
      `;

      db.query(query, [vendor_id], (err, results) => {
        if (err) {
          console.error('Error fetching active subscription:', err);
          reject(err);
        } else {
          resolve(results || []);
        }
      });
    });
  }

  static getEffectiveEndDate(subscription) {
    if (!subscription) return null;
    if (subscription.effective_end_date) return subscription.effective_end_date;
    if (subscription.plan_type === 'free' && subscription.start_date) {
      const startDate = new Date(subscription.start_date);
      const cappedEndDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      const storedEndDate = subscription.end_date ? new Date(subscription.end_date) : null;

      if (storedEndDate && !Number.isNaN(storedEndDate.getTime()) && storedEndDate < cappedEndDate) {
        return storedEndDate;
      }

      return cappedEndDate;
    }
    return subscription.end_date || null;
  }

  static getTrialTotalDays(subscription) {
    if (!subscription?.start_date) return 90;

    const startDate = new Date(subscription.start_date);
    const endDate = new Date(this.getEffectiveEndDate(subscription));

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return 90;
    }

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    return Math.max(1, totalDays);
  }

  static buildSubscriptionAnalytics(subscription, planType, daysRemaining, now = new Date()) {
    const startDate = subscription?.start_date ? new Date(subscription.start_date) : null;
    const endDate = subscription ? new Date(this.getEffectiveEndDate(subscription)) : null;
    const isValidRange = startDate
      && endDate
      && !Number.isNaN(startDate.getTime())
      && !Number.isNaN(endDate.getTime());
    const totalDays = planType === 'premium'
      ? (isValidRange ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))) : 365)
      : this.getTrialTotalDays(subscription);
    const elapsedMs = isValidRange ? now - startDate : 0;
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const daysUsed = Math.min(totalDays, Math.max(0, elapsedDays));
    const progressPercentage = Math.min(100, Math.max(0, Math.round((daysUsed / totalDays) * 100)));

    return {
      total_days: totalDays,
      days_used: daysUsed,
      days_remaining: Math.min(totalDays, Math.max(0, daysRemaining)),
      // Progress reflects time elapsed for both plans so the bar fills as the
      // subscription period is consumed (was hardcoded to 100 for premium).
      progress_percentage: progressPercentage,
      calculated_at: now.toISOString()
    };
  }

  static async getLatestSubscription(vendor_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM vendor_subscriptions
        WHERE vendor_id = ?
        ORDER BY end_date DESC, created_at DESC LIMIT 1
      `;

      db.query(query, [vendor_id], (err, results) => {
        if (err) {
          console.error('Error fetching latest subscription:', err);
          reject(err);
        } else {
          resolve(results || []);
        }
      });
    });
  }

  /**
   * Get subscription plan type for a vendor
   * @param {number} vendor_id - Vendor ID
   * @returns {Promise<string>} 'free', 'premium', or 'expired'
   */
  static async getPlanType(vendor_id) {
    try {
      const subscription = await this.getActiveSubscription(vendor_id);

      if (!subscription || subscription.length === 0) {
        return 'expired';
      }

      return subscription[0].plan_type || 'free';
    } catch (error) {
      console.error('Error getting plan type:', error);
      return 'expired';
    }
  }

  /**
   * Check if vendor has premium subscription
   * @param {number} vendor_id - Vendor ID
   * @returns {Promise<boolean>} true if premium, false otherwise
   */
  static async isPremium(vendor_id) {
    try {
      const planType = await this.getPlanType(vendor_id);
      return planType === 'premium';
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false; // Safe default
    }
  }

  /**
   * Check if vendor is in free trial
   * @param {number} vendor_id - Vendor ID
   * @returns {Promise<boolean>} true if in trial, false otherwise
   */
  static async isInFreeTrial(vendor_id) {
    try {
      const subscription = await this.getActiveSubscription(vendor_id);

      if (!subscription || subscription.length === 0) {
        return false;
      }

      return subscription[0].is_trial === 1 || subscription[0].is_trial === true;
    } catch (error) {
      console.error('Error checking trial status:', error);
      return false;
    }
  }

  /**
   * Get days remaining in current subscription/trial
   * @param {number} vendor_id - Vendor ID
   * @returns {Promise<number>} Days remaining (0 if expired)
   */
  static async getDaysRemaining(vendor_id) {
    try {
      const subscription = await this.getActiveSubscription(vendor_id);

      if (!subscription || subscription.length === 0) {
        return 0;
      }

      const endDate = new Date(this.getEffectiveEndDate(subscription[0]));
      const now = new Date();
      const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

      return Math.max(0, daysRemaining);
    } catch (error) {
      console.error('Error calculating days remaining:', error);
      return 0;
    }
  }

  /**
   * Get formatted subscription status message
   * @param {number} vendor_id - Vendor ID
   * @returns {Promise<Object>} Status object with plan, days, and message
   */
  static async getSubscriptionStatus(vendor_id) {
    try {
      const activeSubscription = await this.getActiveSubscription(vendor_id);
      const latestSubscription = activeSubscription.length > 0
        ? activeSubscription
        : await this.getLatestSubscription(vendor_id);

      const subscription = latestSubscription[0] || null;
      const planType = activeSubscription.length > 0
        ? (subscription.plan_type || 'free')
        : 'expired';
      const daysRemaining = activeSubscription.length > 0
        ? await this.getDaysRemaining(vendor_id)
        : 0;
      const isInTrial = activeSubscription.length > 0
        ? (subscription.is_trial === 1 || subscription.is_trial === true)
        : false;

      const startDate = subscription?.start_date || null;
      const endDate = this.getEffectiveEndDate(subscription);
      const analytics = this.buildSubscriptionAnalytics(subscription, planType, daysRemaining);

      let message = '';
      let status = 'unknown';

      if (planType === 'premium') {
        message = 'Premium plan active - Full access unlocked!';
        status = 'premium_active';
      } else if (planType === 'free') {
        if (daysRemaining > 0) {
          message = `Free trial active: ${daysRemaining} days remaining. Upgrade to unlock full booking details and actions.`;
          status = 'trial_active';
        } else {
          message = 'Free trial expired - Please upgrade to continue';
          status = 'trial_expired';
        }
      } else if (planType === 'expired') {
        // Distinguish a lapsed paid plan from a lapsed free trial so the UI
        // shows the right message (the latest record holds the prior plan_type).
        if (subscription?.plan_type === 'premium') {
          message = 'Premium subscription expired - Please renew to continue';
          status = 'premium_expired';
        } else {
          message = 'Free trial expired - Please upgrade to continue';
          status = 'trial_expired';
        }
      } else {
        message = 'Subscription status unknown';
        status = 'unknown';
      }

      return {
        plan_type: planType,
        days_remaining: daysRemaining,
        trial_total_days: analytics.total_days,
        trial_days_used: analytics.days_used,
        trial_progress_percentage: analytics.progress_percentage,
        is_trial: isInTrial,
        start_date: startDate,
        end_date: endDate,
        calculated_at: analytics.calculated_at,
        message: message,
        status: status
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        plan_type: 'free',
        days_remaining: 0,
        is_trial: false,
        start_date: null,
        end_date: null,
        message: 'Error fetching subscription status',
        status: 'error'
      };
    }
  }

  // ===== SUBSCRIPTION CREATION =====

  /**
   * Create free trial subscription for new vendor
   * @param {number} vendor_id - Vendor ID
   * @returns {Promise<boolean>} true if successful, false otherwise
   */
  static async createFreeTrial(vendor_id) {
    return new Promise((resolve) => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

      const query = `
        INSERT INTO vendor_subscriptions (
          vendor_id, start_date, end_date, billing_cycle, status,
          plan_type, is_trial, amount_paid
        ) VALUES (?, ?, ?, 'one_time', 'active', 'free', true, 0)
      `;

      db.query(
        query,
        [vendor_id, startDate, endDate],
        (err, result) => {
          if (err) {
            console.error('Error creating free trial:', err);
            resolve(false);
          } else {
            const updateProfileQuery = `
              UPDATE vendor_profiles
              SET current_subscription_status = 'free',
                  free_trial_end_date = ?
              WHERE vendor_id = ?
            `;

            db.query(updateProfileQuery, [endDate, vendor_id], (profileErr) => {
              if (profileErr) {
                console.error('Error updating vendor trial status:', profileErr);
              }
              console.log('Free trial created for vendor:', vendor_id);
              resolve(true);
            });
          }
        }
      );
    });
  }

  /**
   * Create premium subscription after payment
   * @param {Object} subscriptionData - {vendor_id, razorpay_order_id, razorpay_payment_id, amount_paid}
   * @returns {Promise<boolean>} true if successful, false otherwise
   */
  static async createPremiumSubscription(subscriptionData) {
    return new Promise((resolve) => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days

      const query = `
        INSERT INTO vendor_subscriptions (
          vendor_id, start_date, end_date, billing_cycle, status,
          plan_type, is_trial, razorpay_order_id, razorpay_payment_id, amount_paid
        ) VALUES (?, ?, ?, 'annual', 'active', 'premium', false, ?, ?, ?)
      `;

      db.query(
        query,
        [
          subscriptionData.vendor_id,
          startDate,
          endDate,
          subscriptionData.razorpay_order_id,
          subscriptionData.razorpay_payment_id,
          subscriptionData.amount_paid
        ],
        (err, result) => {
          if (err) {
            console.error('Error creating premium subscription:', err);
            resolve(false);
          } else {
            console.log('Premium subscription created for vendor:', subscriptionData.vendor_id);
            resolve(true);
          }
        }
      );
    });
  }

  // ===== SUBSCRIPTION VALIDATION =====

  /**
   * Check if vendor can see booking details (premium only)
   * @param {number} vendor_id - Vendor ID
   * @returns {Promise<boolean>} true if can see, false otherwise
   */
  static async canSeeBookingDetails(vendor_id) {
    const isPremium = await this.isPremium(vendor_id);
    return isPremium;
  }

  /**
   * Check if vendor can see user profiles (premium only)
   * @param {number} vendor_id - Vendor ID
   * @returns {Promise<boolean>} true if can see, false otherwise
   */
  static async canSeeUserProfiles(vendor_id) {
    const isPremium = await this.isPremium(vendor_id);
    return isPremium;
  }

  /**
   * Check if vendor is allowed to accept new bookings
   * @param {number} vendor_id - Vendor ID
   * @returns {Promise<boolean>} true if allowed, false if trial expired
   */
  static async canAcceptBookings(vendor_id) {
    try {
      const subscription = await this.getActiveSubscription(vendor_id);

      if (!subscription || subscription.length === 0) {
        return false; // No active subscription = can't accept
      }

      return subscription[0].plan_type === 'premium'
        && subscription[0].status === 'active'
        && new Date(this.getEffectiveEndDate(subscription[0])) > new Date();
    } catch (error) {
      console.error('Error checking booking acceptance:', error);
      return false;
    }
  }

  // ===== SUBSCRIPTION DATA FILTERING =====

  /**
   * Filter booking data based on subscription plan
   * @param {Object} booking - Booking object
   * @param {string} planType - 'free' or 'premium'
   * @returns {Object} Filtered booking object
   */
  static filterBookingData(booking, planType) {
    if (planType === 'premium') {
      // Premium users see all data
      return booking;
    }

    if (planType === 'free') {
      // Free users see limited data
      return {
        booking_id: booking.booking_id,
        booking_uuid: booking.booking_uuid,
        created_at: booking.created_at,
        event_date: booking.event_date,
        event_time: booking.event_time,
        status: booking.status,
        admin_approval: booking.admin_approval,
        package_id: booking.package_id,
        package_name: booking.package_name || `Package #${booking.package_id}`,
        shift_name: booking.shift_name,
        details_hidden: true,
        access_notice: 'Upgrade to Premium to view customer details, address, amount, and requirements.',
        // Hidden fields
        first_name: 'Hidden',
        last_name: '',
        user_name: 'Hidden - Upgrade to Premium',
        email: 'Hidden - Upgrade to Premium',
        user_email: 'Hidden - Upgrade to Premium',
        phone: 'Hidden - Upgrade to Premium',
        user_phone: 'Hidden - Upgrade to Premium',
        event_address: 'Hidden - Upgrade to Premium',
        booking_address: 'Hidden - Upgrade to Premium',
        special_requirement: 'Hidden - Upgrade to Premium',
        special_requirements: 'Hidden - Upgrade to Premium',
        amount: 'Hidden - Upgrade to Premium'
      };
    }

    return booking; // Default: show all
  }

  /**
   * Filter notification content based on subscription plan
   * @param {Object} notification - Notification object
   * @param {string} planType - 'free' or 'premium'
   * @returns {Object} Filtered notification object
   */
  static filterNotificationContent(notification, planType) {
    if (planType === 'premium') {
      // Premium users see full notification
      return notification;
    }

    if (planType === 'free' && notification.type === 'booking_request') {
      // Free users see limited notification
      return {
        ...notification,
        title: 'New Booking Request',
        message: 'A user has requested your services. Upgrade to Premium to see details.',
        details_hidden: true
      };
    }

    return notification; // Default: show as is
  }

  // ===== HELPER UTILITIES =====

  /**
   * Get expiry warning message based on days remaining
   * @param {number} daysRemaining - Days until expiry
   * @returns {string} Warning message
   */
  static getExpiryWarning(daysRemaining) {
    if (daysRemaining <= 0) {
      return 'Subscription expired';
    }
    if (daysRemaining <= 1) {
      return 'Subscription expires today!';
    }
    if (daysRemaining <= 7) {
      return `Only ${daysRemaining} days remaining`;
    }
    if (daysRemaining <= 30) {
      return `${daysRemaining} days remaining`;
    }
    return `${Math.floor(daysRemaining / 30)} months remaining`;
  }

  /**
   * Mark subscription as expired (called by CRON job)
   * @param {number} vendor_id - Vendor ID
   * @returns {Promise<boolean>} true if successful, false otherwise
   */
  static async expireSubscription(vendor_id) {
    return new Promise((resolve) => {
      const query = `
        UPDATE vendor_subscriptions
        SET status = 'expired'
        WHERE vendor_id = ? AND status = 'active' AND end_date <= NOW()
      `;

      db.query(query, [vendor_id], (err, result) => {
        if (err) {
          console.error('Error expiring subscription:', err);
          resolve(false);
        } else {
          console.log('Subscription expired for vendor:', vendor_id);
          resolve(true);
        }
      });
    });
  }
}

export default SubscriptionService;
