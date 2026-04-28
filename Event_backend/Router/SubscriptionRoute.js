import express from 'express';
import SubscriptionController from '../Controllers/SubscriptionController.js';
import SubscriptionNotificationService from '../Services/SubscriptionNotificationService.js';
import { authenticateToken, authorizeAdmin } from '../Utils/auth.js';

const router = express.Router();

// Create subscription order (Vendor only)
router.post('/create-order', authenticateToken, SubscriptionController.createSubscriptionOrder);

// Verify payment and activate subscription (Vendor only)
router.post('/verify-payment', authenticateToken, SubscriptionController.verifyAndActivateSubscription);

// Test mode: Activate subscription without payment (Vendor only - for testing)
router.post('/test-activate', authenticateToken, SubscriptionController.testActivateSubscription);

// Get subscription status (Vendor only)
router.get('/status', authenticateToken, SubscriptionController.getSubscriptionStatus);

// Get all subscriptions (Admin only)
router.get('/all', authenticateToken, authorizeAdmin, SubscriptionController.getAllSubscriptions);

// Admin: Manually trigger expiry check
router.post('/check-expiring', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const result = await SubscriptionNotificationService.checkExpiringSubscriptions();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Manually trigger expired check
router.post('/check-expired', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const result = await SubscriptionNotificationService.checkExpiredSubscriptions();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Get subscription statistics
router.get('/stats', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const result = await SubscriptionNotificationService.getSubscriptionStats();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Send test notification
router.post('/test-notification/:vendorId', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { vendorId } = req.params;
        const result = await SubscriptionNotificationService.sendTestExpiryNotification(vendorId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;