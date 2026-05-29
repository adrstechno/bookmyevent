import RazorpayService from '../Services/RazorpayService.js';
import SubscriptionService from '../Services/SubscriptionService.js';
import db from '../Config/DatabaseCon.js';
import EmailService from '../Services/emailService.js';

const query = (sql, params = [], connection = db) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results);
        });
    });
};

const getConnection = () => {
    return new Promise((resolve, reject) => {
        db.getConnection((err, connection) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(connection);
        });
    });
};

const beginTransaction = (connection) => {
    return new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

const commit = (connection) => {
    return new Promise((resolve, reject) => {
        connection.commit((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

const rollback = (connection) => {
    return new Promise((resolve) => {
        connection.rollback(() => resolve());
    });
};

class SubscriptionController {
    static async activatePremiumSubscription({ vendor_id, razorpay_order_id, razorpay_payment_id, amount_paid }) {
        const connection = await getConnection();

        try {
            await beginTransaction(connection);

            const existingPayment = await query(
                `SELECT *
                 FROM vendor_subscriptions
                 WHERE razorpay_payment_id = ?
                 LIMIT 1`,
                [razorpay_payment_id],
                connection
            );

            if (existingPayment.length > 0) {
                await commit(connection);
                return {
                    alreadyActive: true,
                    subscription: existingPayment[0]
                };
            }

            const existingPremium = await query(
                `SELECT *
                 FROM vendor_subscriptions
                 WHERE vendor_id = ?
                   AND status = 'active'
                   AND plan_type = 'premium'
                   AND end_date > NOW()
                 ORDER BY end_date DESC
                 LIMIT 1`,
                [vendor_id],
                connection
            );

            if (existingPremium.length > 0) {
                await commit(connection);
                return {
                    alreadyActive: true,
                    subscription: existingPremium[0]
                };
            }

            const startDate = new Date();
            const endDate = RazorpayService.calculateSubscriptionEndDate(startDate);

            await query(
                `UPDATE vendor_subscriptions
                 SET status = 'expired'
                 WHERE vendor_id = ?
                   AND plan_type = 'free'
                   AND status = 'active'`,
                [vendor_id],
                connection
            );

            const insertResult = await query(
                `INSERT INTO vendor_subscriptions (
                    vendor_id, start_date, end_date, billing_cycle, status,
                    plan_type, is_trial, razorpay_order_id, razorpay_payment_id, amount_paid
                ) VALUES (?, ?, ?, 'annual', 'active', 'premium', false, ?, ?, ?)`,
                [
                    vendor_id,
                    startDate,
                    endDate,
                    razorpay_order_id,
                    razorpay_payment_id,
                    amount_paid
                ],
                connection
            );

            await query(
                `UPDATE vendor_profiles
                 SET current_subscription_status = 'premium',
                     is_active = 1
                 WHERE vendor_id = ?`,
                [vendor_id],
                connection
            );

            await commit(connection);

            return {
                alreadyActive: false,
                subscription: {
                    subscription_id: insertResult.insertId,
                    vendor_id,
                    start_date: startDate,
                    end_date: endDate,
                    status: 'active',
                    plan_type: 'premium',
                    razorpay_order_id,
                    razorpay_payment_id,
                    amount_paid
                }
            };
        } catch (error) {
            await rollback(connection);
            if (error?.code === 'ER_DUP_ENTRY' && razorpay_payment_id) {
                const existingPayment = await query(
                    `SELECT *
                     FROM vendor_subscriptions
                     WHERE razorpay_payment_id = ?
                     LIMIT 1`,
                    [razorpay_payment_id]
                );

                if (existingPayment.length > 0) {
                    return {
                        alreadyActive: true,
                        subscription: existingPayment[0]
                    };
                }
            }
            throw error;
        } finally {
            connection.release();
        }
    }

    static async validatePaidSubscriptionOrder({ vendor_id, razorpay_order_id, payment }) {
        if (payment.order_id !== razorpay_order_id) {
            return {
                valid: false,
                status: 400,
                message: 'Payment order mismatch. Please contact support.'
            };
        }

        const orderDetails = await RazorpayService.getOrderDetails(razorpay_order_id);

        if (!orderDetails.success) {
            return {
                valid: false,
                status: 500,
                message: 'Failed to verify payment order'
            };
        }

        const order = orderDetails.order;
        const orderVendorId = String(order?.notes?.vendor_id || '');

        if (orderVendorId !== String(vendor_id)) {
            return {
                valid: false,
                status: 403,
                message: 'Payment order does not belong to this vendor.'
            };
        }

        if (order.amount !== RazorpayService.SUBSCRIPTION_PLAN.amount || payment.amount !== RazorpayService.SUBSCRIPTION_PLAN.amount) {
            return {
                valid: false,
                status: 400,
                message: 'Payment amount does not match the Premium plan price.'
            };
        }

        if (order.currency !== RazorpayService.SUBSCRIPTION_PLAN.currency || payment.currency !== RazorpayService.SUBSCRIPTION_PLAN.currency) {
            return {
                valid: false,
                status: 400,
                message: 'Payment currency does not match the Premium plan currency.'
            };
        }

        return { valid: true, order };
    }

    // Create subscription order for vendor
    static async createSubscriptionOrder(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;
            
            // console.log('🔍 Create subscription order - User info:', {
            //     user_id,
            //     full_user: req.user
            // });
            
            if (!user_id) {
                // console.log('❌ No user_id found in request');
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            // Get vendor details
            // Note: vendor_profiles.user_id can be either users.user_id (int) or users.uuid (string)
            const vendorQuery = `
                SELECT vp.vendor_id, vp.business_name, u.email, u.first_name, u.last_name
                FROM vendor_profiles vp
                JOIN users u ON (vp.user_id = u.user_id OR vp.user_id = u.uuid)
                WHERE u.uuid = ? OR u.user_id = ? OR vp.user_id = ?
            `;

            // console.log('🔍 Querying vendor with UUID:', user_id);

            const vendorResult = await new Promise((resolve, reject) => {
                db.query(vendorQuery, [user_id, user_id, user_id], (err, results) => {
                    if (err) {
                        console.error('❌ Database error:', err);
                        reject(err);
                    } else {
                        // console.log('✅ Query results:', results);
                        resolve(results);
                    }
                });
            });

            if (!vendorResult || vendorResult.length === 0) {
                // console.log('❌ No vendor profile found for user:', user_id);
                return res.status(404).json({
                    success: false,
                    message: 'Vendor profile not found. Please complete your vendor profile first.',
                    debug: {
                        user_id,
                        query_executed: true
                    }
                });
            }

            const vendor = vendorResult[0];
            // console.log('✅ Found vendor:', vendor);

            // Free trial vendors are allowed to upgrade. Only block active premium.
            const subscriptionQuery = `
                SELECT * FROM vendor_subscriptions 
                WHERE vendor_id = ? AND status = 'active' AND end_date > NOW() AND plan_type = 'premium'
                ORDER BY end_date DESC LIMIT 1
            `;

            const existingSubscription = await new Promise((resolve, reject) => {
                db.query(subscriptionQuery, [vendor.vendor_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (existingSubscription && existingSubscription.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'You already have an active premium subscription',
                    subscription: existingSubscription[0]
                });
            }

            // Create Razorpay order
            const orderResult = await RazorpayService.createSubscriptionOrder({
                vendor_id: vendor.vendor_id,
                business_name: vendor.business_name,
                email: vendor.email
            });

            if (!orderResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create payment order',
                    error: orderResult.error
                });
            }

            res.status(200).json({
                success: true,
                message: 'Subscription order created successfully',
                data: {
                    order_id: orderResult.order_id,
                    amount: orderResult.amount,
                    currency: orderResult.currency,
                    key_id: orderResult.key_id,
                    vendor_id: vendor.vendor_id,
                    business_name: vendor.business_name
                }
            });

        } catch (error) {
            console.error('Create subscription order error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create subscription order',
                error: error.message
            });
        }
    }

    // Verify payment and activate subscription
    static async verifyAndActivateSubscription(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;
            
            // console.log('🔍 Verify payment - User info:', {
            //     user_id,
            //     body: req.body
            // });
            
            if (!user_id) {
                // console.log('❌ No user_id found');
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                vendor_id
            } = req.body;

            // console.log('🔍 Payment verification data:', {
            //     razorpay_order_id,
            //     razorpay_payment_id,
            //     razorpay_signature: razorpay_signature ? 'present' : 'missing',
            //     vendor_id
            // });

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !vendor_id) {
                // console.log('❌ Missing payment data');
                return res.status(400).json({
                    success: false,
                    message: 'Missing payment verification data'
                });
            }

            const vendorOwnershipQuery = `
                SELECT vp.vendor_id
                FROM vendor_profiles vp
                JOIN users u ON (vp.user_id = u.user_id OR vp.user_id = u.uuid)
                WHERE vp.vendor_id = ?
                  AND (u.uuid = ? OR u.user_id = ? OR vp.user_id = ?)
            `;

            const vendorOwnership = await new Promise((resolve, reject) => {
                db.query(vendorOwnershipQuery, [vendor_id, user_id, user_id, user_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (!vendorOwnership || vendorOwnership.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only activate a subscription for your own vendor profile'
                });
            }

            // Verify payment signature
            // console.log('🔍 Verifying payment signature...');
            const isValid = RazorpayService.verifyPaymentSignature({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });

            // console.log('✅ Signature verification result:', isValid);

            if (!isValid) {
                // console.log('❌ Invalid payment signature');
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment signature. Please contact support with payment ID: ' + razorpay_payment_id
                });
            }

            // Get payment details from Razorpay
            // console.log('🔍 Fetching payment details from Razorpay...');
            const paymentDetails = await RazorpayService.getPaymentDetails(razorpay_payment_id);

            if (!paymentDetails.success) {
                // console.log('❌ Failed to fetch payment details:', paymentDetails.error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch payment details'
                });
            }

            let payment = paymentDetails.payment;
            const orderValidation = await SubscriptionController.validatePaidSubscriptionOrder({
                vendor_id,
                razorpay_order_id,
                payment
            });

            if (!orderValidation.valid) {
                return res.status(orderValidation.status).json({
                    success: false,
                    message: orderValidation.message
                });
            }

            if (payment.status === 'authorized') {
                const captureResult = await RazorpayService.capturePayment(
                    razorpay_payment_id,
                    RazorpayService.SUBSCRIPTION_PLAN.amount,
                    RazorpayService.SUBSCRIPTION_PLAN.currency
                );

                if (!captureResult.success) {
                    return res.status(402).json({
                        success: false,
                        message: 'Payment authorized but capture failed. Please contact support with payment ID: ' + razorpay_payment_id
                    });
                }

                payment = captureResult.payment;
            }

            if (payment.status !== 'captured') {
                return res.status(400).json({
                    success: false,
                    message: `Payment is not complete. Current status: ${payment.status}`
                });
            }
            // console.log('✅ Payment details:', {
            //     id: payment.id,
            //     amount: payment.amount,
            //     status: payment.status
            // });

            const activation = await SubscriptionController.activatePremiumSubscription({
                    vendor_id,
                    razorpay_order_id,
                    razorpay_payment_id,
                    amount_paid: payment.amount / 100
            });

            // Get vendor details for email
            const vendorQuery = `
                SELECT vp.business_name, u.email, u.first_name, u.last_name
                FROM vendor_profiles vp
                JOIN users u ON (vp.user_id = u.user_id OR vp.user_id = u.uuid)
                WHERE vp.vendor_id = ?
            `;

            const vendorResult = await new Promise((resolve, reject) => {
                db.query(vendorQuery, [vendor_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (!activation.alreadyActive && vendorResult && vendorResult.length > 0) {
                const vendor = vendorResult[0];
                
                // Send subscription confirmation email
                try {
                    await EmailService.sendSubscriptionConfirmationEmail({
                        vendorEmail: vendor.email,
                        vendorName: `${vendor.first_name} ${vendor.last_name}`,
                        businessName: vendor.business_name,
                        amount: payment.amount / 100,
                        startDate: activation.subscription.start_date,
                        endDate: activation.subscription.end_date,
                        paymentId: razorpay_payment_id
                    });
                } catch (emailError) {
                    console.error('Failed to send subscription confirmation email:', emailError);
                }
            }

            res.status(200).json({
                success: true,
                message: activation.alreadyActive
                    ? 'Premium subscription is already active'
                    : 'Subscription activated successfully',
                data: {
                    start_date: activation.subscription.start_date,
                    end_date: activation.subscription.end_date,
                    status: 'active',
                    payment_id: razorpay_payment_id,
                    already_active: activation.alreadyActive
                }
            });

        } catch (error) {
            console.error('Verify and activate subscription error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to activate subscription',
                error: error.message
            });
        }
    }

    // Get vendor subscription status
    static async getSubscriptionStatus(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;
            
            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
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

            const subscription = await SubscriptionService.getSubscriptionStatus(vendor_id);

            if (!subscription || subscription.status === 'error') {
                return res.status(200).json({
                    success: true,
                    hasSubscription: false,
                    message: subscription?.message || 'No subscription found'
                });
            }

            res.status(200).json({
                success: true,
                hasSubscription: true,
                subscription: {
                    ...subscription,
                    is_active: subscription.plan_type !== 'expired' && subscription.days_remaining > 0
                }
            });

        } catch (error) {
            console.error('Get subscription status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get subscription status',
                error: error.message
            });
        }
    }

    // Get all subscriptions (Admin only)
    static async getAllSubscriptions(req, res) {
        try {
            const query = `
                SELECT vs.*, vp.business_name, u.email, u.first_name, u.last_name
                FROM vendor_subscriptions vs
                JOIN vendor_profiles vp ON vs.vendor_id = vp.vendor_id
                JOIN users u ON vp.user_id = u.user_id
                ORDER BY vs.created_at DESC
            `;

            const subscriptions = await new Promise((resolve, reject) => {
                db.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            res.status(200).json({
                success: true,
                count: subscriptions.length,
                subscriptions: subscriptions
            });

        } catch (error) {
            console.error('Get all subscriptions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get subscriptions',
                error: error.message
            });
        }
    }

    // ===== NEW: Get subscription status with feature flags (May 26, 2026) =====
    // Enhanced endpoint that includes subscription service details
    // Only visible if SUBSCRIPTION_STATUS_VISIBLE feature flag is enabled
    static async getEnhancedSubscriptionStatus(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            // Get vendor_id
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
            const FEATURE_ENABLED = process.env.SUBSCRIPTION_STATUS_VISIBLE === 'true';

            // Get subscription status using SubscriptionService
            const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(vendor_id);

            // If feature is disabled, hide some details
            if (!FEATURE_ENABLED) {
                return res.status(200).json({
                    success: true,
                    is_hidden: true, // Signal to frontend to hide subscription UI
                    message: 'Subscription features not available'
                });
            }

            res.status(200).json({
                success: true,
                is_hidden: false,
                subscription: subscriptionStatus
            });

        } catch (error) {
            console.error('Get enhanced subscription status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get subscription status',
                error: error.message
            });
        }
    }

    static async handleRazorpayWebhook(req, res) {
        try {
            const signature = req.headers['x-razorpay-signature'];
            const rawBody = Buffer.isBuffer(req.body)
                ? req.body
                : Buffer.from(JSON.stringify(req.body || {}));

            if (!RazorpayService.verifyWebhookSignature(rawBody, signature)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid webhook signature'
                });
            }

            const eventPayload = JSON.parse(rawBody.toString('utf8'));
            const eventName = eventPayload.event;

            if (!['payment.captured', 'order.paid'].includes(eventName)) {
                return res.status(200).json({
                    success: true,
                    ignored: true,
                    message: `Webhook event ignored: ${eventName}`
                });
            }

            const payment = eventPayload.payload?.payment?.entity;
            const orderFromPayload = eventPayload.payload?.order?.entity;
            const razorpay_order_id = payment?.order_id || orderFromPayload?.id;
            const razorpay_payment_id = payment?.id;

            if (!razorpay_order_id || !razorpay_payment_id) {
                return res.status(200).json({
                    success: true,
                    ignored: true,
                    message: 'Webhook did not include a payment/order pair'
                });
            }

            const paymentDetails = payment?.status === 'captured'
                ? { success: true, payment }
                : await RazorpayService.getPaymentDetails(razorpay_payment_id);

            if (!paymentDetails.success || paymentDetails.payment.status !== 'captured') {
                return res.status(200).json({
                    success: true,
                    ignored: true,
                    message: 'Payment is not captured yet'
                });
            }

            const orderDetails = orderFromPayload
                ? { success: true, order: orderFromPayload }
                : await RazorpayService.getOrderDetails(razorpay_order_id);

            if (!orderDetails.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch webhook order details'
                });
            }

            const vendor_id = orderDetails.order?.notes?.vendor_id;

            if (!vendor_id) {
                return res.status(200).json({
                    success: true,
                    ignored: true,
                    message: 'Webhook order has no vendor_id note'
                });
            }

            const orderValidation = await SubscriptionController.validatePaidSubscriptionOrder({
                vendor_id,
                razorpay_order_id,
                payment: paymentDetails.payment
            });

            if (!orderValidation.valid) {
                return res.status(orderValidation.status).json({
                    success: false,
                    message: orderValidation.message
                });
            }

            const activation = await SubscriptionController.activatePremiumSubscription({
                vendor_id,
                razorpay_order_id,
                razorpay_payment_id,
                amount_paid: paymentDetails.payment.amount / 100
            });

            return res.status(200).json({
                success: true,
                activated: !activation.alreadyActive,
                already_active: activation.alreadyActive
            });

        } catch (error) {
            console.error('Razorpay webhook error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process Razorpay webhook',
                error: error.message
            });
        }
    }
}

export default SubscriptionController;
