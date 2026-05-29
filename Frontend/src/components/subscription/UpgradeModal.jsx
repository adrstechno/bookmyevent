// ============================================================================
// UpgradeModal.jsx - Subscription Upgrade Dialog
// Purpose: Show upgrade benefits and trigger payment flow
// Date: May 26, 2026
// Status: FEATURE FLAGS CONTROLLED - Hidden until enabled
// ============================================================================

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
} from '@mui/icons-material';
import subscriptionService from '../../services/subscriptionService';

const loadRazorpayCheckout = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
  if (existingScript) {
    return new Promise((resolve) => {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const UpgradeModal = ({ open = true, onClose, daysRemaining = 0, onUpgradeSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handleUpgradeClick = async () => {
    setLoading(true);
    setPaymentError('');
    try {
      const checkoutLoaded = await loadRazorpayCheckout();

      if (!checkoutLoaded) {
        setPaymentError('Failed to load Razorpay checkout. Please check your connection and try again.');
        setLoading(false);
        return;
      }

      const data = await subscriptionService.createSubscriptionOrder();

      // Open Razorpay payment gateway
      const options = {
        key: data.data.key_id,
        amount: data.data.amount,
        currency: data.data.currency,
        name: 'GoEventify',
        description: 'Premium Subscription - ₹499/year',
        order_id: data.data.order_id,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyData = await subscriptionService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              vendor_id: data.data.vendor_id
            });

            if (verifyData.success) {
              alert('Upgrade successful! You now have full access.');
              onClose();
              if (onUpgradeSuccess) {
                onUpgradeSuccess();
              } else {
                window.location.reload();
              }
            } else {
              setPaymentError(verifyData.message || 'Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentError(error.response?.data?.message || 'Payment verification failed. Please contact support.');
          }
          setLoading(false);
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error initiating upgrade:', error);
      setPaymentError(error.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
        Upgrade to Premium Plan
      </DialogTitle>

      <DialogContent>
        {/* Free Trial Info */}
        {daysRemaining > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You have <strong>{daysRemaining} days</strong> of free trial remaining.
            Upgrade anytime to unlock all features immediately!
          </Alert>
        )}

        {daysRemaining === 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Your free trial has expired. Upgrade now to continue using all features.
          </Alert>
        )}

        {paymentError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {paymentError}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea' }}>
              ₹499
            </Typography>
            <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
              /year
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            One-time payment for 12 months of full access
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Premium Benefits */}
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
          Premium Features Included:
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckCircle sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText
              primary="View All Bookings"
              secondary="See bookings from any location"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircle sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText
              primary="See User Details"
              secondary="Full name, email, phone number"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircle sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText
              primary="View Complete Booking Info"
              secondary="Address, special requirements, pricing"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircle sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText
              primary="Full Notifications"
              secondary="See complete booking request details"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircle sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText
              primary="Multiple Locations"
              secondary="Manage bookings from all registered locations"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircle sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText
              primary="Advanced Analytics"
              secondary="Detailed dashboard and insights"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 3 }} />

        {/* Comparison with Free */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Current Free Plan:  Limited to 3 months only with restricted booking view
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpgradeClick}
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ minWidth: 150 }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            'Upgrade Now - ₹499'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpgradeModal;
