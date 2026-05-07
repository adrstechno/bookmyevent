import express from 'express';
import {insertUser , login , logout , ChangePassword, verifyEmail, resendEmailVerification, testEmail, debugVendorData, validateToken, forgotPassword, resetPassword, verifyResetToken, getUserProfile, updateUserProfile } from '../Controllers/UserController.js';
import { authenticateToken } from '../Utils/auth.js';

const router = express.Router();

// ── Public routes (no auth required) ──
router.post('/InsertUser', insertUser);
router.post('/Login', login);
router.post('/Logout', logout);

// Email verification routes
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendEmailVerification);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token', verifyResetToken);

// ── Protected routes (auth required) ──
router.post('/changePassword', authenticateToken, ChangePassword);
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.post('/validate-token', authenticateToken, validateToken);

// Test / debug routes
router.post('/test-email', testEmail);
router.get('/debug-vendor/:vendor_id', debugVendorData);

export default router;