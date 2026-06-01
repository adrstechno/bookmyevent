// ============================================================================
// SubscriptionGuard.jsx - Locks vendor pages when free/premium plan is expired
// Purpose: Wrap vendor business pages (bookings, shifts, etc.). If the vendor's
//          plan_type is 'expired', show an "upgrade to continue" notice instead
//          of the page. Free-active and premium-active vendors pass through.
// ============================================================================

import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { LockKeyhole, CreditCard } from "lucide-react";
import subscriptionService from "../../services/subscriptionService";
import UpgradeModal from "./UpgradeModal";

const SubscriptionGuard = ({ children }) => {
  const navigate = useNavigate();
  const [planType, setPlanType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchStatus = async () => {
      try {
        const response = await subscriptionService.getEnhancedSubscriptionStatus();
        if (active && response?.success && response.subscription) {
          setPlanType(response.subscription.plan_type || null);
        }
      } catch (error) {
        console.error("SubscriptionGuard: failed to fetch status", error);
        // Fail open so a transient API error doesn't lock out a paying vendor.
        if (active) setPlanType(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchStatus();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c6e71] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Only an expired plan blocks the page. Free-active and premium-active pass.
  if (planType === "expired") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <LockKeyhole className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscribe to upgrade your account</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Your subscription has expired. Upgrade to Premium to unlock bookings,
            shifts, packages, and the rest of your vendor tools.
          </p>

          <button
            onClick={() => setUpgradeOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#284b63] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#203c4f]"
          >
            <CreditCard className="h-4 w-4" />
            Upgrade to Premium - ₹499/year
          </button>

          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
      </div>
    );
  }

  // Support both wrapper-with-children and nested-route (<Outlet/>) usage.
  return children ? children : <Outlet />;
};

export default SubscriptionGuard;
