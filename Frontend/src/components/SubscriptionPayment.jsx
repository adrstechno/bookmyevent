import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiX, FiCreditCard, FiShield, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";
import subscriptionService from "../services/subscriptionService";

const SubscriptionPayment = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Enable test mode by clicking price 5 times
  const handlePriceClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 5) {
      setTestMode(true);
      toast.success("🧪 Test mode enabled - Payment bypass active!");
      setClickCount(0);
    } else if (newCount === 3) {
      toast.info(`Click ${5 - newCount} more times to enable test mode`);
    }
    
    // Reset counter after 2 seconds
    setTimeout(() => setClickCount(0), 2000);
  };

  // Enable test mode with special key combination (Ctrl + Shift + T)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        setTestMode(prev => !prev);
        toast.success(testMode ? "Test mode disabled" : "🧪 Test mode enabled - Payment bypass active");
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [testMode]);

  const SUBSCRIPTION_DETAILS = {
    originalAmount: 999,
    discountedAmount: 499,
    currency: "INR",
    period: "Annual",
    validCoupon: "welcome546goeventify",
    features: [
      "Accept unlimited bookings",
      "Manage your calendar and shifts",
      "Receive instant notifications",
      "Access to vendor dashboard",
      "Customer reviews and ratings",
      "24/7 customer support",
    ],
  };

  const finalAmount = couponApplied 
    ? SUBSCRIPTION_DETAILS.discountedAmount 
    : SUBSCRIPTION_DETAILS.originalAmount;

  const applyCoupon = () => {
    setCouponError("");
    
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (couponCode.trim().toLowerCase() === SUBSCRIPTION_DETAILS.validCoupon.toLowerCase()) {
      setCouponApplied(true);
      toast.success(`🎉 Coupon applied! You saved ₹${SUBSCRIPTION_DETAILS.originalAmount - SUBSCRIPTION_DETAILS.discountedAmount}`);
    } else {
      setCouponError("Invalid coupon code");
      toast.error("Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setCouponError("");
    toast.success("Coupon removed");
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      // TEST MODE BYPASS - Skip payment for testing
      if (testMode) {
        toast.success("🧪 Test Mode: Activating subscription...");
        
        try {
          // Call backend to activate test subscription
          const response = await subscriptionService.activateTestSubscription();
          
          if (response.success) {
            toast.success("🎉 Test subscription activated successfully!");
            if (onSuccess) onSuccess();
            if (onClose) onClose();
          } else {
            toast.error(response.message || "Failed to activate test subscription");
          }
        } catch (error) {
          console.error("Test activation error:", error);
          toast.error(error.response?.data?.message || "Failed to activate test subscription");
        }
        
        setLoading(false);
        return;
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      // Create order
      const orderResponse = await subscriptionService.createSubscriptionOrder();
      
      if (!orderResponse.success) {
        toast.error(orderResponse.message || "Failed to create order");
        return;
      }

      setOrderData(orderResponse.data);

      // Razorpay options
      const options = {
        key: orderResponse.data.key_id,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: "GoEventify",
        description: "Annual Vendor Subscription",
        order_id: orderResponse.data.order_id,
        handler: async function (response) {
          try {
            // console.log('💳 Payment successful, verifying...', {
            //   order_id: response.razorpay_order_id,
            //   payment_id: response.razorpay_payment_id,
            //   signature: response.razorpay_signature ? 'present' : 'missing'
            // });

            // Verify payment
            const verifyResponse = await subscriptionService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              vendor_id: orderResponse.data.vendor_id,
            });

            // console.log('✅ Verification response:', verifyResponse);

            if (verifyResponse.success) {
              toast.success("🎉 Subscription activated successfully!");
              if (onSuccess) onSuccess();
              if (onClose) onClose();
            } else {
              console.error('❌ Verification failed:', verifyResponse);
              toast.error(verifyResponse.message || "Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("❌ Payment verification error:", error);
            const errorMsg = error.response?.data?.message || error.message || "Failed to verify payment";
            toast.error(errorMsg);
          }
        },
        prefill: {
          name: orderResponse.data.business_name,
        },
        theme: {
          color: "#f9a826",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);

    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Failed to process payment");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#284b63] to-[#3c6e71] p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Vendor Subscription</h2>
              <p className="text-white/80">Activate your vendor account</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Hidden Test Mode Toggle - Click 3 times quickly */}
              <button
                onClick={() => {
                  setTestMode(prev => !prev);
                  toast.success(testMode ? "Test mode disabled" : "🧪 Test mode enabled - Payment bypass active");
                }}
                className="p-2 hover:bg-white/20 rounded-full transition-colors opacity-0 hover:opacity-100"
                title="Click to toggle test mode"
              >
                🧪
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="text-2xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pricing Card */}
          <div className="bg-gradient-to-br from-[#f9a826]/10 to-[#f9a826]/5 border-2 border-[#f9a826] rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              {couponApplied && (
                <div className="text-gray-500 line-through text-2xl mb-2">
                  ₹{SUBSCRIPTION_DETAILS.originalAmount}
                </div>
              )}
              <div 
                className="text-5xl font-bold text-[#284b63] cursor-pointer select-none"
                onClick={handlePriceClick}
                title="Click 5 times to enable test mode"
              >
                ₹{finalAmount}
              </div>
              <div className="text-gray-600 mt-2">per year</div>
              {couponApplied && (
                <div className="mt-3 inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                  🎉 You saved ₹{SUBSCRIPTION_DETAILS.originalAmount - SUBSCRIPTION_DETAILS.discountedAmount}!
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
              <FiClock className="text-[#f9a826]" />
              <span>Valid for 365 days</span>
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Have a coupon code?
            </label>
            {!couponApplied ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError("");
                  }}
                  placeholder="Enter coupon code"
                  className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9a826] ${
                    couponError ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={loading}
                />
                <button
                  onClick={applyCoupon}
                  disabled={loading || !couponCode.trim()}
                  className="px-6 py-3 bg-[#284b63] text-white font-semibold rounded-lg hover:bg-[#3c6e71] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border-2 border-green-500 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <FiCheck className="text-green-600 text-xl" />
                  <span className="font-semibold text-green-700">
                    {couponCode.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-red-600 hover:text-red-700 font-semibold text-sm"
                >
                  Remove
                </button>
              </div>
            )}
            {couponError && (
              <p className="text-red-500 text-sm mt-2">{couponError}</p>
            )}
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              What's Included:
            </h3>
            <div className="space-y-3">
              {SUBSCRIPTION_DETAILS.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <FiCheck className="text-green-600 text-sm" />
                    </div>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Badge */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <FiShield className="text-blue-600 text-2xl" />
              <div>
                <div className="font-semibold text-blue-900">Secure Payment</div>
                <div className="text-sm text-blue-700">
                  Powered by Razorpay - India's most trusted payment gateway
                </div>
              </div>
            </div>
          </div>

          {/* Test Mode Indicator */}
          {testMode && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🧪</div>
                <div>
                  <div className="font-semibold text-yellow-900">Test Mode Active</div>
                  <div className="text-sm text-yellow-700">
                    Payment will be bypassed for testing. Press Ctrl+Shift+T to disable.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              testMode 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                : 'bg-[#f9a826] hover:bg-[#f7b733] text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {testMode ? 'Simulating Payment...' : 'Processing...'}
              </>
            ) : (
              <>
                <FiCreditCard className="text-xl" />
                {testMode ? '🧪 Test Payment (Bypass)' : `Pay ₹${finalAmount} & Activate`}
              </>
            )}
          </button>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-4">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
            Subscription will be valid for 365 days from the date of payment.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionPayment;