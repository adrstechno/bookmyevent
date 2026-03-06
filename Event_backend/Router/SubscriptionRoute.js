import express from 'express';
import SubscriptionController from '../Controllers/SubscriptionController.js';
import { authenticateToken, authorizeAdmin } from '../Utils/auth.js';

const router = express.Router();

// Create subscription order (Vendor only)
router.post('/create-order', authenticateToken, SubscriptionController.createSubscriptionOrder);

// Verify payment and activate subscription (Vendor only)
router.post('/verify-payment', authenticateToken, SubscriptionController.verifyAndActivateSubscription);

// Get subscription status (Vendor only)
router.get('/status', authenticateToken, SubscriptionController.getSubscriptionStatus);

// Get all subscriptions (Admin only)
router.get('/all', authenticateToken, authorizeAdmin, SubscriptionController.getAllSubscriptions);

export default router;