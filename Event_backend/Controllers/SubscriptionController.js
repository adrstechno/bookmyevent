import RazorpayService from '../Services/RazorpayService.js';
import db from '../Config/DatabaseCon.js';
import EmailService from '../Services/emailService.js';

class SubscriptionController {
    // Create subscription order for vendor
    static async createSubscriptionOrder(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;
            
            console.log('🔍 Create subscription order - User info:', {
                user_id,
                full_user: req.user
            });
            
            if (!user_id) {
                console.log('❌ No user_id found in request');
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
                WHERE u.uuid = ?
            `;

            console.log('🔍 Querying vendor with UUID:', user_id);

            const vendorResult = await new Promise((resolve, reject) => {
                db.query(vendorQuery, [user_id], (err, results) => {
                    if (err) {
                        console.error('❌ Database error:', err);
                        reject(err);
                    } else {
                        console.log('✅ Query results:', results);
                        resolve(results);
                    }
                });
            });

            if (!vendorResult || vendorResult.length === 0) {
                console.log('❌ No vendor profile found for user:', user_id);
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
            console.log('✅ Found vendor:', vendor);

            // Check if vendor already has an active subscription
            const subscriptionQuery = `
                SELECT * FROM vendor_subscriptions 
                WHERE vendor_id = ? AND status = 'active' AND end_date > NOW()
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
                    message: 'You already have an active subscription',
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
            
            console.log('🔍 Verify payment - User info:', {
                user_id,
                body: req.body
            });
            
            if (!user_id) {
                console.log('❌ No user_id found');
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

            console.log('🔍 Payment verification data:', {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature: razorpay_signature ? 'present' : 'missing',
                vendor_id
            });

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                console.log('❌ Missing payment data');
                return res.status(400).json({
                    success: false,
                    message: 'Missing payment verification data'
                });
            }

            // Verify payment signature
            console.log('🔍 Verifying payment signature...');
            const isValid = RazorpayService.verifyPaymentSignature({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });

            console.log('✅ Signature verification result:', isValid);

            if (!isValid) {
                console.log('❌ Invalid payment signature');
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment signature. Please contact support with payment ID: ' + razorpay_payment_id
                });
            }

            // Get payment details from Razorpay
            console.log('🔍 Fetching payment details from Razorpay...');
            const paymentDetails = await RazorpayService.getPaymentDetails(razorpay_payment_id);

            if (!paymentDetails.success) {
                console.log('❌ Failed to fetch payment details:', paymentDetails.error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch payment details'
                });
            }

            const payment = paymentDetails.payment;
            console.log('✅ Payment details:', {
                id: payment.id,
                amount: payment.amount,
                status: payment.status
            });

            // Calculate subscription dates
            const startDate = new Date();
            const endDate = RazorpayService.calculateSubscriptionEndDate(startDate);

            console.log('🔍 Inserting subscription record...');
            
            // Insert subscription record
            const insertQuery = `
                INSERT INTO vendor_subscriptions (
                    vendor_id, start_date, end_date, billing_cycle, status,
                    razorpay_order_id, razorpay_payment_id, amount_paid
                ) VALUES (?, ?, ?, 'annual', 'active', ?, ?, ?)
            `;

            await new Promise((resolve, reject) => {
                db.query(insertQuery, [
                    vendor_id,
                    startDate,
                    endDate,
                    razorpay_order_id,
                    razorpay_payment_id,
                    payment.amount / 100 // Convert paise to rupees
                ], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            // Get vendor details for email
            const vendorQuery = `
                SELECT vp.business_name, u.email, u.first_name, u.last_name
                FROM vendor_profiles vp
                JOIN users u ON vp.user_id = u.user_id
                WHERE vp.vendor_id = ?
            `;

            const vendorResult = await new Promise((resolve, reject) => {
                db.query(vendorQuery, [vendor_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (vendorResult && vendorResult.length > 0) {
                const vendor = vendorResult[0];
                
                // Send subscription confirmation email
                try {
                    await EmailService.sendSubscriptionConfirmationEmail({
                        vendorEmail: vendor.email,
                        vendorName: `${vendor.first_name} ${vendor.last_name}`,
                        businessName: vendor.business_name,
                        amount: payment.amount / 100,
                        startDate: startDate,
                        endDate: endDate,
                        paymentId: razorpay_payment_id
                    });
                } catch (emailError) {
                    console.error('Failed to send subscription confirmation email:', emailError);
                }
            }

            res.status(200).json({
                success: true,
                message: 'Subscription activated successfully',
                data: {
                    start_date: startDate,
                    end_date: endDate,
                    status: 'active',
                    payment_id: razorpay_payment_id
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

            // Get subscription details
            const subscriptionQuery = `
                SELECT * FROM vendor_subscriptions 
                WHERE vendor_id = ? 
                ORDER BY created_at DESC LIMIT 1
            `;

            const subscriptionResult = await new Promise((resolve, reject) => {
                db.query(subscriptionQuery, [vendor_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (!subscriptionResult || subscriptionResult.length === 0) {
                return res.status(200).json({
                    success: true,
                    hasSubscription: false,
                    message: 'No subscription found'
                });
            }

            const subscription = subscriptionResult[0];
            const isActive = RazorpayService.isSubscriptionActive(subscription.end_date);
            const daysRemaining = RazorpayService.getDaysRemaining(subscription.end_date);

            res.status(200).json({
                success: true,
                hasSubscription: true,
                subscription: {
                    ...subscription,
                    is_active: isActive,
                    days_remaining: daysRemaining
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
}

export default SubscriptionController;