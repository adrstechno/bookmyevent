import express from "express";
import OTPController from "../Controllers/OTPController.js";
import { authenticateToken } from "../Utils/auth.js";

const router = express.Router();

// Generate OTP for booking (vendor-initiated)
router.post("/generate", authenticateToken, OTPController.generateOTP);

// Verify OTP (vendor submits user's code)
router.post("/verify", authenticateToken, OTPController.verifyOTP);

// Get OTP status for booking
router.get("/:bookingId/status", authenticateToken, OTPController.getOTPStatus);

// Resend OTP code
router.post("/resend", authenticateToken, OTPController.resendOTP);

// Get remaining attempts for OTP verification
router.get("/:bookingId/attempts", authenticateToken, OTPController.getRemainingAttempts);

// Send OTP reminder to vendor
router.post("/reminder", authenticateToken, OTPController.sendOTPReminder);

// Get OTP history for booking (admin only)
router.get("/:bookingId/history", authenticateToken, OTPController.getOTPHistory);

export default router;