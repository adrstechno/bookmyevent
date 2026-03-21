import Razorpay from 'razorpay';
import crypto from 'crypto';

// Note: dotenv is configured in Server.js before this module is loaded

class RazorpayService {
    constructor() {
        // Check if Razorpay credentials are configured
        const hasCredentials = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
        
        if (!hasCredentials) {
            console.warn('⚠️  Razorpay credentials not configured. Subscription features will be disabled.');
            console.warn('   Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
            this.razorpay = null;
            this.isConfigured = false;
        } else {
            this.razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });
            this.isConfigured = true;
            // console.log('✅ Razorpay configured successfully');
        }
        
        // Subscription plan details
        // 🧪 TESTING MODE: ₹1 for demo/testing (change back to 99900 for production)
        this.SUBSCRIPTION_PLAN = {
            amount: 100, // ₹1 in paise (1 * 100) - FOR TESTING ONLY
            // amount: 99900, // ₹999 in paise (999 * 100) - USE THIS FOR PRODUCTION
            currency: 'INR',
            period: 'yearly',
            interval: 1,
            name: 'GoEventify Vendor Annual Subscription',
            description: 'Annual subscription for vendor access to GoEventify platform'
        };
    }

    // Create a subscription order
    async createSubscriptionOrder(vendorData) {
        if (!this.isConfigured) {
            return {
                success: false,
                error: 'Razorpay is not configured. Please contact administrator.'
            };
        }
        
        try {
            const { vendor_id, business_name, email } = vendorData;

            // Create order for subscription payment
            const order = await this.razorpay.orders.create({
                amount: this.SUBSCRIPTION_PLAN.amount,
                currency: this.SUBSCRIPTION_PLAN.currency,
                receipt: `sub_${vendor_id}_${Date.now()}`,
                notes: {
                    vendor_id: vendor_id,
                    business_name: business_name,
                    email: email,
                    subscription_type: 'annual',
                    plan_name: this.SUBSCRIPTION_PLAN.name
                }
            });

            return {
                success: true,
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key_id: process.env.RAZORPAY_KEY_ID
            };

        } catch (error) {
            console.error('Error creating subscription order:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Verify payment signature
    verifyPaymentSignature(paymentData) {
        if (!this.isConfigured) {
            console.error('Razorpay not configured');
            return false;
        }
        
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

            const sign = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSign = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(sign.toString())
                .digest("hex");

            return expectedSign === razorpay_signature;

        } catch (error) {
            console.error('Error verifying payment signature:', error);
            return false;
        }
    }

    // Fetch payment details
    async getPaymentDetails(payment_id) {
        if (!this.isConfigured) {
            return {
                success: false,
                error: 'Razorpay is not configured'
            };
        }
        
        try {
            const payment = await this.razorpay.payments.fetch(payment_id);
            return {
                success: true,
                payment: payment
            };
        } catch (error) {
            console.error('Error fetching payment details:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Fetch order details
    async getOrderDetails(order_id) {
        if (!this.isConfigured) {
            return {
                success: false,
                error: 'Razorpay is not configured'
            };
        }
        
        try {
            const order = await this.razorpay.orders.fetch(order_id);
            return {
                success: true,
                order: order
            };
        } catch (error) {
            console.error('Error fetching order details:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create refund (if needed)
    async createRefund(payment_id, amount = null) {
        if (!this.isConfigured) {
            return {
                success: false,
                error: 'Razorpay is not configured'
            };
        }
        
        try {
            const refundData = { payment_id };
            if (amount) {
                refundData.amount = amount;
            }

            const refund = await this.razorpay.payments.refund(payment_id, refundData);
            return {
                success: true,
                refund: refund
            };
        } catch (error) {
            console.error('Error creating refund:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Calculate subscription end date (1 year from start)
    calculateSubscriptionEndDate(startDate = new Date()) {
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        return endDate;
    }

    // Check if subscription is active
    isSubscriptionActive(endDate) {
        const now = new Date();
        const end = new Date(endDate);
        return now < end;
    }

    // Get days remaining in subscription
    getDaysRemaining(endDate) {
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }
}

export default new RazorpayService();