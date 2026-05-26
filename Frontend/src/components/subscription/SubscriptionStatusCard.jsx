// ============================================================================
// SubscriptionStatusCard.jsx - Display Subscription Status
// Purpose: Show vendor subscription plan and trial countdown
// Date: May 26, 2026
// Status: FEATURE FLAGS CONTROLLED - Hidden until VITE_SUBSCRIPTION_UI_ENABLED=true
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip,
  Alert
} from '@mui/material';
import { CheckCircle, AccessTime, WarningAmber } from '@mui/icons-material';

const SubscriptionStatusCard = ({ onUpgradeClick }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if feature is enabled
  const FEATURE_ENABLED = import.meta.env.VITE_SUBSCRIPTION_UI_ENABLED === 'true';

  useEffect(() => {
    if (!FEATURE_ENABLED) {
      setLoading(false);
      return;
    }

    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscription/enhanced-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && !data.is_hidden) {
        setSubscription(data.subscription);
      }
      setLoading(false);
    } catch (error) {
      console.log('Subscription fetch error (non-critical):', error);
      setLoading(false);
    }
  };

  // Don't render if feature is disabled
  if (!FEATURE_ENABLED) {
    return null;
  }

  if (loading) {
    return null;
  }

  // Don't render if subscription data unavailable
  if (!subscription) {
    return null;
  }

  const getProgressColor = () => {
    if (subscription.plan_type === 'premium') {
      return 'success';
    }
    if (subscription.days_remaining <= 7) {
      return 'error';
    }
    if (subscription.days_remaining <= 30) {
      return 'warning';
    }
    return 'info';
  };

  const getProgressValue = () => {
    if (subscription.plan_type === 'premium') {
      return 100;
    }
    return (subscription.days_remaining / 90) * 100;
  };

  return (
    <Card
      sx={{
        mb: 3,
        background: subscription.plan_type === 'premium'
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
      }}
    >
      <CardContent>
        {/* Premium Plan Status */}
        {subscription.plan_type === 'premium' && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Premium Plan Active
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Full access unlocked!
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Renews on:{' '}
              {new Date(subscription.subscription.end_date).toLocaleDateString()}
            </Typography>
          </Box>
        )}

        {/* Free Trial Status */}
        {subscription.plan_type === 'free' && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTime sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Free Trial
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Limited access for {subscription.days_remaining} days
                </Typography>
              </Box>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {subscription.days_remaining} of 90 days remaining
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {Math.round(getProgressValue())}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressValue()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'white'
                  }
                }}
              />
            </Box>

            {/* Warning if about to expire */}
            {subscription.days_remaining <= 7 && subscription.days_remaining > 0 && (
              <Alert
                severity="warning"
                icon={<WarningAmber />}
                sx={{
                  mb: 2,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '& .MuiAlert-icon': { color: 'white' }
                }}
              >
                Your free trial is expiring soon!
              </Alert>
            )}

            {/* Upgrade Button */}
            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: 'white',
                color: subscription.plan_type === 'premium' ? '#667eea' : '#f5576c',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
              onClick={onUpgradeClick}
            >
              Upgrade to Premium - ₹499/year
            </Button>
          </Box>
        )}

        {/* Expired Trial Status */}
        {subscription.plan_type === 'free' && subscription.days_remaining === 0 && (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              Your free trial has expired
            </Alert>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Upgrade to Premium to continue using all features
            </Typography>
            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: 'white',
                color: '#f5576c',
                fontWeight: 'bold'
              }}
              onClick={onUpgradeClick}
            >
              Upgrade Now - ₹499/year
            </Button>
          </Box>
        )}

        {/* Status Badge */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Chip
            label={subscription.plan_type.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white'
            }}
          />
          <Chip
            label={subscription.status}
            size="small"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white'
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;
