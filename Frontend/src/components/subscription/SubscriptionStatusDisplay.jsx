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

      // Try enhanced status endpoint first
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
      <div className="bg-white rounded-lg p-6 shadow-md animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const getPlanBadgeColor = () => {
    if (subscription.plan_type === 'premium') {
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    }
    return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
  };

  const getProgressPercentage = () => {
    if (subscription.plan_type === 'premium') {
      return 100;
    }
    return (subscription.days_remaining / 90) * 100;
  };

  return (
    <div className={`rounded-lg p-6 shadow-lg text-white mb-6 ${getPlanBadgeColor()}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            {subscription.plan_type === 'premium' ? '💎 Premium Plan' : '🎁 Free Trial'}
          </h2>
          <p className="text-sm opacity-90">{subscription.message}</p>
        </div>
        <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
          {subscription.status}
        </span>
      </div>

      {subscription.plan_type === 'free' && subscription.days_remaining > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{subscription.days_remaining} days remaining</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      )}

      {subscription.plan_type === 'free' && subscription.days_remaining <= 7 && subscription.days_remaining > 0 && (
        <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-4 text-sm">
          ⚠️ Your free trial is expiring soon! Upgrade now to continue using all features.
        </div>
      )}

      {subscription.plan_type === 'free' && subscription.days_remaining === 0 && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4 text-sm">
          ❌ Your free trial has expired. Please upgrade to continue.
        </div>
      )}

      {subscription.plan_type === 'free' && (
        <button
          onClick={onUpgradeClick}
          className="w-full bg-white text-blue-600 font-bold py-2 px-4 rounded hover:bg-gray-100 transition"
        >
          Upgrade to Premium - ₹499/year
        </button>
      )}

      {subscription.plan_type === 'premium' && (
        <div className="text-sm opacity-90">
          ✓ Enjoy full access to all features with your premium subscription
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatusDisplay;
