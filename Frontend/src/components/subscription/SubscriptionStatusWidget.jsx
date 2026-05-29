import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import subscriptionService from "../../services/subscriptionService";

const formatDate = (dateStr) => {
  if (!dateStr) return "Not available";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const addDays = (dateStr, days) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + days);
  return date;
};

const getFreeTrialEndDate = (subscription) => {
  if (subscription?.plan_type !== "free") {
    return subscription?.end_date || null;
  }
  return subscription.end_date || addDays(subscription.start_date, 90) || null;
};

const getTotalDays = (subscription) => {
  if (Number.isFinite(Number(subscription?.trial_total_days))) {
    return Math.max(1, Number(subscription.trial_total_days));
  }

  if (subscription?.start_date && subscription?.end_date) {
    const startDate = new Date(subscription.start_date);
    const endDate = new Date(subscription.end_date);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
      return Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    }
  }

  return 90;
};

const getDaysRemaining = (subscription) => {
  if (Number.isFinite(Number(subscription?.days_remaining))) {
    return Math.max(0, Number(subscription.days_remaining));
  }

  if (subscription?.plan_type !== "free") {
    return 0;
  }

  const endDate = getFreeTrialEndDate(subscription);
  if (!endDate) return 0;

  const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  return Math.min(getTotalDays(subscription), Math.max(0, diff));
};

const getDaysUsed = (subscription) => {
  if (Number.isFinite(Number(subscription?.trial_days_used))) {
    return Math.min(getTotalDays(subscription), Math.max(0, Number(subscription.trial_days_used)));
  }

  const totalDays = getTotalDays(subscription);
  return Math.min(totalDays, Math.max(0, totalDays - getDaysRemaining(subscription)));
};

const formatUpdatedAt = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const SubscriptionStatusWidget = ({ onUpgradeClick, onStatusChange }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await subscriptionService.getEnhancedSubscriptionStatus();

        if (response.success && response.subscription) {
          setSubscription(response.subscription);
          setLastUpdatedAt(new Date(response.subscription.calculated_at || Date.now()));
          onStatusChange?.(response.subscription);
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        onStatusChange?.(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
    const refreshId = window.setInterval(fetchSubscriptionStatus, 60 * 1000);

    return () => window.clearInterval(refreshId);
  }, [onStatusChange]);

  const viewState = useMemo(() => {
    const planType = subscription?.plan_type;
    const daysRemaining = getDaysRemaining(subscription);

    if (planType === "premium") {
      return {
        tone: "emerald",
        icon: ShieldCheck,
        title: "Premium active",
        label: "Full access",
        message: "Dashboard, booking details, and booking actions are unlocked.",
        action: "Manage subscription",
        locked: false,
      };
    }

    if (daysRemaining <= 0 || planType === "expired") {
      return {
        tone: "red",
        icon: LockKeyhole,
        title: "Trial expired",
        label: "Access locked",
        message: "Purchase Premium to restore dashboard access and start accepting bookings.",
        action: "Upgrade to Premium",
        locked: true,
      };
    }

    return {
      tone: "amber",
      icon: Clock3,
        title: "Free trial active",
        label: `${daysRemaining} days left`,
        message: "Your dashboard is available. Booking details and booking actions require Premium.",
        action: "Upgrade to Premium",
        locked: true,
    };
  }, [subscription]);

  if (loading) {
    return (
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="h-16 animate-pulse rounded bg-gray-100" />
          <div className="h-16 animate-pulse rounded bg-gray-100" />
          <div className="h-16 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const StatusIcon = viewState.icon;
  const isPremium = subscription.plan_type === "premium";
  const totalDays = getTotalDays(subscription);
  const daysUsed = isPremium ? null : getDaysUsed(subscription);
  const progress = isPremium
    ? 100
    : Math.min(100, Math.max(0, Number(subscription.trial_progress_percentage ?? (daysUsed / totalDays) * 100)));
  const displayEndDate = isPremium ? subscription.end_date : getFreeTrialEndDate(subscription);
  const updatedLabel = formatUpdatedAt(lastUpdatedAt);
  const toneClasses = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <section className="mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg border p-2 ${toneClasses[viewState.tone]}`}>
            <StatusIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">{viewState.title}</h2>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[viewState.tone]}`}>
                {viewState.label}
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-600">{subscription.message || viewState.message}</p>
            {updatedLabel && (
              <p className="mt-1 text-xs text-gray-400">Updated {updatedLabel}. Refreshes every minute.</p>
            )}
          </div>
        </div>

        {!isPremium && (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#284b63] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#203c4f]"
          >
            <CreditCard className="h-4 w-4" />
            {viewState.action}
          </button>
        )}
      </div>

      <div className="grid gap-0 md:grid-cols-3">
        <div className="border-b border-gray-100 p-5 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <CalendarDays className="h-4 w-4" />
            Started
          </div>
          <p className="mt-2 text-base font-semibold text-gray-900">{formatDate(subscription.start_date)}</p>
        </div>

        <div className="border-b border-gray-100 p-5 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            {isPremium ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {isPremium ? "Premium valid until" : "Trial ends"}
          </div>
          <p className="mt-2 text-base font-semibold text-gray-900">{formatDate(displayEndDate)}</p>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between text-sm font-medium text-gray-500">
            <span>{isPremium ? "Access" : "Trial progress"}</span>
            <span className="font-semibold text-gray-900">{isPremium ? "Unlocked" : `${daysUsed}/${totalDays} days`}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-gray-100">
            <div
              className={`h-2 rounded-full ${isPremium ? "bg-emerald-500" : viewState.tone === "red" ? "bg-red-500" : "bg-amber-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionStatusWidget;
