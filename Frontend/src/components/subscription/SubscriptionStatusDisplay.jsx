import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { VITE_API_BASE_URL } from '../../utils/api';

const SubscriptionStatusDisplay = ({ onUpgradeClick }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`${VITE_API_BASE_URL}/subscription/enhanced-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.subscription) {
        setSubscription(response.data.subscription);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError('Unable to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const getPlanCardClass = () => {
    if (subscription.plan_type === 'premium') {
      return 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500';
    }
    if (subscription.days_remaining <= 0) {
      return 'bg-gradient-to-br from-red-500 via-red-600 to-orange-500';
    }
    return 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500';
  };

  const getStatusBadgeColor = () => {
    if (subscription.plan_type === 'premium') {
      return 'bg-purple-700';
    }
    if (subscription.days_remaining <= 0) {
      return 'bg-red-700';
    }
    if (subscription.days_remaining <= 7) {
      return 'bg-yellow-600';
    }
    return 'bg-blue-700';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (subscription.plan_type === 'premium') {
      return 100;
    }
    const percentage = (subscription.days_remaining / 90) * 100;
    return Math.min(percentage, 100);
  };

  const getDaysUsed = () => {
    if (!subscription.start_date || !subscription.end_date) return 0;
    const startDate = new Date(subscription.start_date);
    const endDate = new Date(subscription.end_date);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    return totalDays - subscription.days_remaining;
  };

  return (
    <div className={`rounded-3xl p-6 shadow-2xl text-white mb-6 overflow-hidden relative ${getPlanCardClass()}`}>
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-0">
          <div>
            <h2 className="text-3xl font-bold mb-1">
              {subscription.plan_type === 'premium' ? '💎 Premium Plan' : subscription.days_remaining <= 0 ? '⏰ Trial Expired' : '🎁 Free Trial'}
            </h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${getStatusBadgeColor()} text-white`}>
            {subscription.plan_type === 'premium' ? 'PREMIUM' : subscription.days_remaining <= 0 ? 'EXPIRED' : subscription.days_remaining <= 7 ? 'EXPIRING' : 'ACTIVE'}
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-sm opacity-90 font-medium mb-4">{subscription.message}</p>

        {/* Premium Active State */}
        {subscription.plan_type === 'premium' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white bg-opacity-15 rounded-lg p-4 backdrop-blur-sm">
              <span className="text-3xl">✓</span>
              <div>
                <p className="font-semibold text-lg">Full Access Unlocked</p>
                <p className="text-sm opacity-90">Renews on: {formatDate(subscription.end_date)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Free Trial Active State */}
        {subscription.plan_type === 'free' && subscription.days_remaining > 0 && (
          <div className="space-y-3">
            {/* Expiry Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white bg-opacity-15 rounded-lg p-2 backdrop-blur-sm">
                <p className="text-xs opacity-75 uppercase tracking-wide">Start Date</p>
                <p className="font-bold text-base">{formatDate(subscription.start_date)}</p>
              </div>
              <div className="bg-white bg-opacity-15 rounded-lg p-2 backdrop-blur-sm">
                <p className="text-xs opacity-75 uppercase tracking-wide">Expires</p>
                <p className="font-bold text-base">{formatDate(subscription.end_date)}</p>
              </div>
            </div>

            {/* Timeline Visualization */}
            <div className="bg-white bg-opacity-10 rounded-xl p-3 backdrop-blur-sm">
              {/* Timeline Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-bold">{formatDate(subscription.start_date)}</span>
                  <span className="font-bold">TODAY</span>
                  <span className="font-bold">{formatDate(subscription.end_date)}</span>
                </div>

                {/* Progress Bar Container */}
                <div className="relative h-2.5 bg-white bg-opacity-25 rounded-full overflow-hidden">
                  {/* Filled progress */}
                  <div
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>

                  {/* Today marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-yellow-300 rounded-full shadow-lg border-2 border-white"
                    style={{ left: `${getProgressPercentage()}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                  ></div>
                </div>
              </div>

              {/* Days Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="opacity-75 uppercase tracking-wide">Days Used</p>
                  <p className="font-bold text-sm">{getDaysUsed()} / 90</p>
                </div>
                <div className="text-right">
                  <p className="opacity-75 uppercase tracking-wide">Days Remaining</p>
                  <p className="font-bold text-sm text-yellow-300">{subscription.days_remaining} days</p>
                </div>
              </div>
            </div>

            {/* Warning Banner */}
            {subscription.days_remaining <= 7 && (
              <div className="bg-yellow-500 bg-opacity-30 border border-yellow-300 border-opacity-50 rounded-lg p-3 backdrop-blur-sm">
                <p className="font-bold text-xs">⚠️ Your free trial is expiring soon!</p>
                <p className="text-xs opacity-90 mt-0.5">Upgrade now to continue using all features.</p>
              </div>
            )}

            {/* Upgrade Button */}
            <button
              onClick={onUpgradeClick}
              className="w-full bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
            >
              Upgrade to Premium — ₹499/year
            </button>
          </div>
        )}

        {/* Trial Expired State */}
        {subscription.plan_type === 'free' && subscription.days_remaining === 0 && (
          <div className="space-y-3">
            <div className="bg-red-600 bg-opacity-40 border border-red-300 border-opacity-50 rounded-lg p-3 backdrop-blur-sm">
              <p className="font-bold text-sm">❌ Your free trial has expired</p>
              <p className="text-xs opacity-90 mt-1">Expired on: {formatDate(subscription.end_date)}</p>
              <p className="text-xs opacity-90 mt-1">Please upgrade to Premium to regain full access.</p>
            </div>

            <button
              onClick={onUpgradeClick}
              className="w-full bg-white text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
            >
              Upgrade Now — ₹499/year
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatusDisplay;
