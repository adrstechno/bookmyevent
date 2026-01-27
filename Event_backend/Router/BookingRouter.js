import {
  insertBooking,
  updateBooking,
  deleteBooking,
  getBookingsByUserId,
  getBookingsByVendorId,
  getBookingById,
  getBookingForReview,
  approveBooking
} from "../Controllers/BookingController.js";
import express from "express";
import { authenticateToken } from "../Utils/auth.js";

const router = express.Router();

// Route to insert a new booking (requires auth)
router.post("/InsertBooking", authenticateToken, insertBooking);

// Route to update a booking (requires auth)
router.post("/UpdateBooking", authenticateToken, updateBooking);

// Route to approve the booking (requires auth)
router.post("/booking/approve", authenticateToken, approveBooking);

// Route to delete a booking (requires auth)
router.get("/DeleteBooking/:id", authenticateToken, deleteBooking);

// Route to get bookings by user ID (requires auth)
router.get("/GetBookingsByUserId", authenticateToken, getBookingsByUserId);

// Route to get bookings by vendor ID (requires auth)
router.get("/GetBookingsByVendorId", authenticateToken, getBookingsByVendorId);

// Route to get a specific booking by ID (requires auth)
router.get("/GetBookingById/:id", authenticateToken, getBookingById);

// Public route to get booking details for review (no auth required, uses review token)
router.get("/review/:bookingId", getBookingForReview);

export default router;