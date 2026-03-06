import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiAlertCircle, FiCalendar, FiCreditCard } from "react-icons/fi";
import subscriptionService from "../services/subscriptionService";
import SubscriptionPayment from "./SubscriptionPayment";

const SubscriptionStatus = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await subscriptionService.getSubscriptionStatus();
      setSubscription(response);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const hasActiveSubscription = subscription?.hasSubscription && subscription?.subscription?.is_active;
  const daysRemaining = subscription?.subscription?.days_remaining || 0;
  const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border-l-4"
        style={{
          borderLeftColor: hasActiveSubscription
            ? isExpiringSoon
              ? "#f9a826"
              : "#10b981"
            : "#ef4444",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {hasActiveSubscription ? (
                <FiCheck className="text-green-600 text-xl" />
              ) : (
                <FiAlertCircle className="text-red-600 text-xl" />
              )}
              <h3 className="text-lg font-semibold text-gray-800">
                Subscription Status
              </h3>
            </div>

            {hasActiveSubscription ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isExpiringSoon
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    Active
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <FiCalendar className="text-gray-400" />
                  <span className="text-sm">
                    Valid until:{" "}
                    {new Date(subscription.subscription.end_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>

                {isExpiringSoon && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Your subscription expires in {daysRemaining} days. Renew
                      now to continue accepting bookings.
                    </p>
                  </div>
                )}

                <div className="text-sm text-gray-500 mt-2">
                  {daysRemaining} days remaining
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-600">
                  You don't have an active subscription. Subscribe now to start
                  accepting bookings.
                </p>
                <button
                  onClick={() => setShowPayment(true)}
                  className="flex items-center gap-2 bg-[#f9a826] hover:bg-[#f7b733] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FiCreditCard />
                  Subscribe Now - ₹1/year (Testing)
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showPayment && (
        <SubscriptionPayment
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            fetchSubscriptionStatus();
          }}
        />
      )}
    </>
  );
};

export default SubscriptionStatus;