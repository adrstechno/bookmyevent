import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { VITE_API_BASE_URL } from '../../utils/api';

const SubscriptionStatusCard = ({ onUpgradeClick }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animateProgress, setAnimateProgress] = useState(false);

  const FEATURE_ENABLED = import.meta.env.VITE_SUBSCRIPTION_UI_ENABLED === 'true';

  useEffect(() => {
    if (!FEATURE_ENABLED) {
      setLoading(false);
      return;
    }
    fetchSubscriptionStatus();
  }, [FEATURE_ENABLED]);

  useEffect(() => {
    if (subscription && !loading) {
      setAnimateProgress(true);
    }
  }, [subscription, loading]);

  const fetchSubscriptionStatus = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!FEATURE_ENABLED || loading || !subscription) {
    return null;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (subscription.plan_type === 'premium') return 100;
    return Math.min((subscription.days_remaining / 90) * 100, 100);
  };

  const getStatusColor = () => {
    if (subscription.days_remaining > 30) return 'from-blue-500 via-blue-600 to-cyan-500';
    if (subscription.days_remaining > 7) return 'from-amber-500 via-orange-600 to-red-500';
    return 'from-red-500 via-red-600 to-orange-600';
  };

  // Premium Plan View
  if (subscription.plan_type === 'premium') {
    return (
      <>
        <style>{`
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-slide-in { animation: slideInDown 0.6s ease-out; }
          .shimmer-effect::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shimmer 2s infinite;
          }
        `}</style>

        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-3xl p-8 shadow-2xl text-white mb-6 relative overflow-hidden animate-slide-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-3 rounded-full -ml-24 -mb-24 blur-3xl"></div>
          <div className="absolute inset-0 shimmer-effect pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl animate-bounce" style={{ animationDuration: '1.5s' }}>💎</span>
                <div>
                  <h2 className="text-4xl font-black">Premium Plan</h2>
                  <p className="text-purple-100 font-semibold">Full access unlocked!</p>
                </div>
              </div>
              <span className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold">✓ PREMIUM</span>
            </div>

            <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-15 transition-all duration-300">
              <p className="text-purple-100 text-xs uppercase tracking-widest font-bold mb-2">Renews on</p>
              <p className="text-3xl font-bold">{formatDate(subscription.end_date)}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Free Trial View
  if (subscription.plan_type === 'free' && subscription.days_remaining > 0) {
    const progressPercent = getProgressPercentage();
    const statusColor = getStatusColor();
    const isExpiringSoon = subscription.days_remaining <= 7;
    const daysUsed = 90 - subscription.days_remaining;

    return (
      <>
        <style>{`
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-slide-in { animation: slideInDown 0.6s ease-out; }
          .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
          .shimmer-effect::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shimmer 2s infinite;
          }
        `}</style>

        <div className={`bg-gradient-to-br ${statusColor} rounded-3xl p-8 shadow-2xl text-white mb-6 relative overflow-hidden animate-slide-in ${isExpiringSoon ? 'animate-pulse-glow' : ''}`}>
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-3 rounded-full -ml-24 -mb-24 blur-3xl"></div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 shimmer-effect pointer-events-none"></div>

          <div className="relative z-10">
            {/* Header with Status Badge */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-5xl animate-bounce" style={{ animationDuration: '2s' }}>🎁</div>
                <div>
                  <h2 className="text-4xl font-black">Free Trial</h2>
                  <p className="text-white text-opacity-90 font-semibold">90-day limited offer</p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap backdrop-blur-sm ${
                subscription.days_remaining <= 7
                  ? 'bg-red-500 bg-opacity-80 animate-pulse'
                  : 'bg-white bg-opacity-20'
              }`}>
                {subscription.days_remaining <= 7 ? '⚠️ EXPIRING' : '✓ ACTIVE'}
              </span>
            </div>

            {/* Main Info Section */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white bg-opacity-10 rounded-2xl p-5 backdrop-blur-sm hover:bg-opacity-15 transition-all duration-300">
                <p className="text-xs text-white text-opacity-75 uppercase tracking-widest font-bold mb-2">Start Date</p>
                <p className="text-3xl font-bold">{formatDate(subscription.start_date)}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl p-5 backdrop-blur-sm hover:bg-opacity-15 transition-all duration-300">
                <p className="text-xs text-white text-opacity-75 uppercase tracking-widest font-bold mb-2">Trial Period</p>
                <p className="text-3xl font-bold">90 Days</p>
              </div>
            </div>

            {/* Progress Bar Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-bold mb-4 text-white text-opacity-80 uppercase tracking-wider">
                <span>START</span>
                <span>TODAY</span>
                <span>END</span>
              </div>

              {/* Timeline Progress Bar with glow */}
              <div className="relative h-4 bg-white bg-opacity-20 rounded-full overflow-hidden backdrop-blur-sm border border-white border-opacity-20 shadow-inner">
                <div
                  className={`h-full bg-gradient-to-r from-white to-yellow-200 rounded-full transition-all duration-1000 ease-out ${animateProgress ? 'shadow-lg' : ''}`}
                  style={{ width: `${animateProgress ? progressPercent : 0}%` }}
                ></div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-7 bg-yellow-300 rounded-full shadow-xl border-2 border-white transition-all duration-1000"
                  style={{ left: `${animateProgress ? progressPercent : 0}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                ></div>
              </div>

              {/* Days Counter with better styling */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10 backdrop-blur-sm">
                  <p className="text-xs text-white text-opacity-70 uppercase tracking-wider font-bold mb-2">Days Used</p>
                  <p className="text-3xl font-black text-white">{daysUsed}<span className="text-lg opacity-70"> / 90</span></p>
                </div>
                <div className="bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10 backdrop-blur-sm">
                  <p className="text-xs text-white text-opacity-70 uppercase tracking-wider font-bold mb-2">Days Left</p>
                  <p className="text-3xl font-black text-yellow-300">{subscription.days_remaining}</p>
                </div>
              </div>
            </div>

            {/* Warning for expiring soon */}
            {isExpiringSoon && (
              <div className="bg-yellow-500 bg-opacity-30 border-2 border-yellow-300 border-opacity-70 rounded-xl p-4 mb-6 backdrop-blur-sm animate-pulse">
                <p className="font-bold text-sm flex items-center gap-2">
                  <span className="text-lg">⚠️</span> Your free trial expires in {subscription.days_remaining} day{subscription.days_remaining > 1 ? 's' : ''}!
                </p>
                <p className="text-sm text-white text-opacity-90 mt-2">Upgrade now to avoid losing access to all features.</p>
              </div>
            )}

            {/* Upgrade Button with enhanced styling */}
            <button
              onClick={onUpgradeClick}
              className="w-full bg-gradient-to-r from-white to-blue-50 text-blue-700 font-bold py-4 px-6 rounded-xl hover:from-blue-50 hover:to-white transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 text-base uppercase tracking-wide"
            >
              💳 Upgrade to Premium — ₹499/year
            </button>

            {/* Additional info text */}
            <p className="text-center text-xs text-white text-opacity-70 mt-4">
              Full access to all premium features • No credit card required
            </p>
          </div>
        </div>
      </>
    );
  }

  // Expired Trial View
  if (subscription.plan_type === 'free' && subscription.days_remaining === 0) {
    return (
      <>
        <style>{`
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
            50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-slide-in { animation: slideInDown 0.6s ease-out; }
          .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
          .shimmer-effect::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shimmer 2s infinite;
          }
        `}</style>

        <div className="bg-gradient-to-br from-red-500 via-red-600 to-orange-600 rounded-3xl p-8 shadow-2xl text-white mb-6 relative overflow-hidden animate-slide-in animate-pulse-glow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-3 rounded-full -ml-24 -mb-24 blur-3xl"></div>
          <div className="absolute inset-0 shimmer-effect pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl animate-bounce" style={{ animationDuration: '1s' }}>⏰</span>
                <div>
                  <h2 className="text-4xl font-black">Trial Expired</h2>
                  <p className="text-red-100 font-semibold">Access Restricted</p>
                </div>
              </div>
              <span className="bg-red-700 bg-opacity-80 px-4 py-2 rounded-full text-sm font-bold animate-pulse">❌ EXPIRED</span>
            </div>

            <div className="bg-red-600 bg-opacity-40 border-2 border-red-300 border-opacity-70 rounded-xl p-6 mb-6 backdrop-blur-sm">
              <p className="font-bold text-lg mb-3 flex items-center gap-2">❌ Your free trial has expired</p>
              <p className="text-sm text-red-100 mb-2">Expired on: <span className="font-bold">{formatDate(subscription.end_date)}</span></p>
              <p className="text-sm text-red-100">Upgrade to Premium now to regain access to all features and continue your business operations.</p>
            </div>

            <button
              onClick={onUpgradeClick}
              className="w-full bg-gradient-to-r from-white to-red-50 text-red-700 font-bold py-4 px-6 rounded-xl hover:from-red-50 hover:to-white transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 text-base uppercase tracking-wide"
            >
              💳 Upgrade Now — ₹499/year
            </button>

            <p className="text-center text-xs text-white text-opacity-70 mt-4">
              Restore access immediately with Premium plan
            </p>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default SubscriptionStatusCard;
