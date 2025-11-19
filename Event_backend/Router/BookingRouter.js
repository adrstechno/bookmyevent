import {
  insertBooking,
  updateBooking,
  deleteBooking,
  getBookingsByUserId,
  getBookingsByVendorId,
  getBookingById
} from "../Controllers/BookingController.js";
import express from "express";

const router = express.Router();

// Route to insert a new booking
router.post("/InsertBooking", insertBooking);

// Route to update a booking
router.post("/UpdateBooking", updateBooking);

// Route to delete a booking
router.get("/DeleteBooking", deleteBooking);

// Route to get bookings by user ID
router.get("/GetBookingsByUserId", getBookingsByUserId);

// Route to get bookings by vendor ID
router.get("/GetBookingsByVendorId", getBookingsByVendorId);

// Route to get a specific booking by ID
router.get("/GetBookingById", getBookingById);

export default router;