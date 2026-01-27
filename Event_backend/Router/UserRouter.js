import express from 'express';
import {insertUser , login , logout , ChangePassword, verifyEmail, resendEmailVerification, testEmail, debugVendorData, validateToken } from '../Controllers/UserController.js';

const router = express.Router();

// Route to insert a new user
router.post('/InsertUser', insertUser);
// Route for user login
router.post('/Login', login);
// Route for user logout
router.post('/Logout', logout);
router.post('/changePassword' , ChangePassword );

// Email verification routes
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendEmailVerification);

// Test email functionality
router.post('/test-email', testEmail);

// Debug vendor data
router.get('/debug-vendor/:vendor_id', debugVendorData);

// Validate token
router.post('/validate-token', validateToken);

export default router;