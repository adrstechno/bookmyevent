import express from "express";
import BookingController from "../Controllers/BookingController.js";
import { authenticateToken } from "../Utils/auth.js";

const router = express.Router();

// Create new booking
router.post("/", authenticateToken, BookingController.createBooking);

// Get booking by ID
router.get("/:id", authenticateToken, BookingController.getBookingById);

// Get booking status
router.get("/:id/status", authenticateToken, BookingController.getBookingStatus);

// Vendor actions
router.put("/:id/accept", authenticateToken, BookingController.acceptBooking);
router.put("/:id/reject", authenticateToken, BookingController.rejectBooking);

// Admin actions
router.put("/:id/approve", authenticateToken, BookingController.approveBooking);
router.put("/:id/admin-reject", authenticateToken, BookingController.adminRejectBooking);

// User/Vendor actions
router.put("/:id/cancel", authenticateToken, BookingController.cancelBooking);

// System actions
router.put("/:id/awaiting-review", authenticateToken, BookingController.markAwaitingReview);

// Get bookings by user type
router.get("/user/my-bookings", authenticateToken, BookingController.getUserBookings);
router.get("/vendor/my-bookings", authenticateToken, BookingController.getVendorBookings);
router.get("/admin/all-bookings", authenticateToken, BookingController.getAllBookings);

export default router;