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
              backgroundColor: '#e3f2fd',
              color: '#01579b',
              borderRadius: '12px',
              border: '1px solid #90caf9',
              '& .MuiAlert-icon': {
                color: '#1976d2'
              }
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1rem' }}>
                🔒 Limited Access - Free Plan
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#01579b' }}>
                You're on a free trial plan. Booking details are restricted to protect vendor privacy.
              </Typography>
              <Button
                size="small"
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  color: 'white',
                  fontWeight: '600',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                  }
                }}
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
              backgroundColor: '#fff3e0',
              color: '#e65100',
              borderRadius: '12px',
              border: '1px solid #ffe0b2',
              '& .MuiAlert-icon': {
                color: '#f57c00'
              }
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1rem' }}>
                ⚠️ Booking from Another Location
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#e65100' }}>
                This booking is from a location outside your registered area. Upgrade to Premium to see bookings
                from all locations.
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 2, opacity: 0.8, color: '#e65100' }}>
                {bookingInfo.location && `📍 Location: ${bookingInfo.location}`}
              </Typography>
              <Button
                size="small"
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)',
                  color: 'white',
                  fontWeight: '600',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #e65100 0%, #bf360c 100%)'
                  }
                }}
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
              backgroundColor: '#f5f5f5',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                <Box sx={{
                  p: 2,
                  backgroundColor: '#e3f2fd',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LockOutlined sx={{ fontSize: 40, color: '#1976d2' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#212121', mb: 1 }}>
                    Booking Details Hidden
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3, color: '#616161', lineHeight: 1.6 }}>
                    Upgrade to Premium to see customer name, contact info, address, and special requirements.
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #3c6e71 0%, #284b63 100%)',
                      color: 'white',
                      fontWeight: '600',
                      textTransform: 'none',
                      borderRadius: '8px',
                      px: 3,
                      py: 1,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #284b63 0%, #1a2f42 100%)'
                      }
                    }}
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
