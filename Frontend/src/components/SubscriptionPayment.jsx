import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiX, FiCreditCard, FiShield, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";
import subscriptionService from "../services/subscriptionService";

const SubscriptionPayment = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const SUBSCRIPTION_DETAILS = {
    // 🧪 TESTING MODE: ₹1 for demo/testing (change back to 999 for production)
    amount: 1, // FOR TESTING ONLY
    // amount: 999, // USE THIS FOR PRODUCTION
    currency: "INR",
    period: "Annual",
    features: [
      "Accept unlimited bookings",
      "Manage your calendar and shifts",
      "Receive instant notifications",
      "Access to vendor dashboard",
      "Customer reviews and ratings",
      "24/7 customer support",
    ],
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
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiX className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pricing Card */}
          <div className="bg-gradient-to-br from-[#f9a826]/10 to-[#f9a826]/5 border-2 border-[#f9a826] rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-[#284b63]">
                ₹{SUBSCRIPTION_DETAILS.amount}
              </div>
              <div className="text-gray-600 mt-2">per year</div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
              <FiClock className="text-[#f9a826]" />
              <span>Valid for 365 days</span>
            </div>
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

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#f9a826] hover:bg-[#f7b733] text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <FiCreditCard className="text-xl" />
                Pay ₹{SUBSCRIPTION_DETAILS.amount} & Activate
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