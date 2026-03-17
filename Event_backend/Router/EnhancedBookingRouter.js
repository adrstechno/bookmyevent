import express from "express";
import EnhancedBookingController from "../Controllers/EnhancedBookingController.js";
import { authenticateToken } from "../Utils/auth.js";

const router = express.Router();

// Create new booking with comprehensive notifications
router.post("/", authenticateToken, EnhancedBookingController.createBooking);

// Vendor actions with enhanced notifications
router.put("/:id/accept", authenticateToken, EnhancedBookingController.acceptBooking);

// Admin actions with enhanced notifications
router.put("/:id/approve", authenticateToken, EnhancedBookingController.approveBooking);

export default router;