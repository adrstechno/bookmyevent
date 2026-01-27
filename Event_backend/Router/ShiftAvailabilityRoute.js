import express from "express";
import ShiftAvailabilityController from "../Controllers/ShiftAvailabilityController.js";

const router = express.Router();

// Get available shifts for a vendor on a specific date
router.get("/available-shifts", ShiftAvailabilityController.getAvailableShifts);

// Check if a specific shift is available
router.get("/check-shift", ShiftAvailabilityController.checkShiftAvailability);

// Get vendor availability calendar
router.get("/calendar", ShiftAvailabilityController.getVendorCalendar);

export default router;