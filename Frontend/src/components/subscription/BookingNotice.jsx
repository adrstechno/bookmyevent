// ============================================================================
// BookingNotice.jsx - Notice for Limited Booking Access on Free Plan
// Purpose: Show upgrade notice when free vendor tries to see booking details
// Date: May 26, 2026
// Status: FEATURE FLAGS CONTROLLED - Hidden until enabled
// ============================================================================

import React from 'react';
import {
  Box,
  Alert,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import { WarningAmber, LockOutlined, UpgradeOutlined } from '@mui/icons-material';

/**
 * Shows notice for limited booking access
 * Used when free plan vendor tries to access booking details
 */
const BookingNotice = ({ type = 'limited_access', onUpgradeClick, bookingInfo = {} }) => {
  // Check if feature is enabled
  const FEATURE_ENABLED = import.meta.env.VITE_SUBSCRIPTION_BOOKING_FILTER_NOTICE_ENABLED === 'true';

  if (!FEATURE_ENABLED) {
    return null;
  }

  const renderNotice = () => {
    switch (type) {
      case 'limited_access':
        return (
          <Alert
            severity="info"
            icon={<LockOutlined />}
            sx={{
              mb: 2,
              backgroundColor: 'info.light',
              color: 'info.dark'
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Limited Access - Free Plan
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                You're on a free trial plan. Booking details are restricted to protect vendor privacy.
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<UpgradeOutlined />}
                onClick={onUpgradeClick}
              >
                Upgrade to Premium
              </Button>
            </Box>
          </Alert>
        );

      case 'cross_location':
        return (
          <Alert
            severity="warning"
            icon={<WarningAmber />}
            sx={{
              mb: 2,
              backgroundColor: 'warning.light',
              color: 'warning.dark'
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Booking from Another Location
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This booking is from a location outside your registered area. Upgrade to Premium to see bookings
                from all locations.
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 2, opacity: 0.8 }}>
                {bookingInfo.location && `Location: ${bookingInfo.location}`}
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="warning"
                startIcon={<UpgradeOutlined />}
                onClick={onUpgradeClick}
              >
                Unlock All Locations
              </Button>
            </Box>
          </Alert>
        );

      case 'details_hidden':
        return (
          <Card
            sx={{
              mb: 2,
              backgroundColor: 'background.paper',
              border: '2px dashed',
              borderColor: 'divider'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LockOutlined sx={{ fontSize: 40, color: 'action.disabled' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Booking Details Hidden
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Upgrade to Premium to see customer name, contact info, address, and special requirements.
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={onUpgradeClick}
                  >
                    Upgrade Now - ₹499/year
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return <Box>{renderNotice()}</Box>;
};

export default BookingNotice;
