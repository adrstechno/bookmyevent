import db from '../Config/DatabaseCon.js';
import RazorpayService from '../Services/RazorpayService.js';

// Middleware to check if vendor has an active premium subscription
export const checkVendorSubscription = async (req, res, next) => {
    try {
        const user_id = req.user?.uuid || req.user?.user_id;
        const user_type = req.user?.user_type;

        // Only check for vendors
        if (user_type !== 'vendor') {
            return next();
        }

        // Get vendor_id
        // Note: vendor_profiles.user_id can be either users.user_id (int) or users.uuid (string)
        const vendorQuery = `
            SELECT vendor_id FROM vendor_profiles vp
            JOIN users u ON (vp.user_id = u.user_id OR vp.user_id = u.uuid)
            WHERE u.uuid = ?
        `;

        const vendorResult = await new Promise((resolve, reject) => {
            db.query(vendorQuery, [user_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!vendorResult || vendorResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found'
            });
        }

        const vendor_id = vendorResult[0].vendor_id;

        // Check if vendor has active premium access
        const subscriptionQuery = `
            SELECT * FROM vendor_subscriptions
            WHERE vendor_id = ? AND status = 'active' AND end_date > NOW() AND plan_type = 'premium'
            ORDER BY end_date DESC LIMIT 1
        `;

        const subscriptionResult = await new Promise((resolve, reject) => {
            db.query(subscriptionQuery, [vendor_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // Allow access only for active premium subscriptions.
        if (subscriptionResult && subscriptionResult.length > 0) {
            const subscription = subscriptionResult[0];
            const daysRemaining = RazorpayService.getDaysRemaining(subscription.end_date);

            // Add subscription info to request
            req.subscription = {
                ...subscription,
                days_remaining: daysRemaining
            };

            // Warn if subscription is expiring soon (less than 30 days)
            if (daysRemaining <= 30 && daysRemaining > 0) {
                req.subscriptionWarning = `Your subscription expires in ${daysRemaining} days`;
            }

            return next();
        }

        // Check if vendor has or had a trial/subscription but no active premium access.
        const expiredSubscriptionQuery = `
            SELECT * FROM vendor_subscriptions
            WHERE vendor_id = ? AND status = 'active' AND end_date <= NOW()
            ORDER BY end_date DESC LIMIT 1
        `;

        const expiredResult = await new Promise((resolve, reject) => {
            db.query(expiredSubscriptionQuery, [vendor_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (expiredResult && expiredResult.length > 0) {
            // Account restricted - subscription/trial expired
            return res.status(403).json({
                success: false,
                message: 'Premium subscription required. Please upgrade to continue.',
                accountRestricted: true,
                restrictionReason: 'premium_required'
            });
        }

        // No subscription ever created - new vendor (shouldn't happen if auto-create is enabled)
        return res.status(403).json({
            success: false,
            message: 'Premium subscription required. Please upgrade to continue.',
            requiresSubscription: true
        });

    } catch (error) {
        console.error('Subscription middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify subscription',
            error: error.message
        });
    }
};

// Middleware to check if vendor can accept bookings
export const checkBookingEligibility = async (req, res, next) => {
    try {
        const { vendor_id } = req.body || req.params;

        if (!vendor_id) {
            return next();
        }

        // Only premium vendors can receive new bookings.
        const subscriptionQuery = `
            SELECT * FROM vendor_subscriptions 
            WHERE vendor_id = ? AND status = 'active' AND end_date > NOW() AND plan_type = 'premium'
            ORDER BY end_date DESC LIMIT 1
        `;

        const subscriptionResult = await new Promise((resolve, reject) => {
            db.query(subscriptionQuery, [vendor_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!subscriptionResult || subscriptionResult.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'This vendor is not currently accepting bookings. Premium subscription required.',
                vendorSubscriptionRequired: true
            });
        }

        next();

    } catch (error) {
        console.error('Booking eligibility check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify vendor eligibility',
            error: error.message
        });
    }
};
