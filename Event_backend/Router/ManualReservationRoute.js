import express from "express";
import ManualReservationController from "../Controllers/ManualReservationController.js";
import { authenticateToken } from "../Utils/auth.js";

const router = express.Router();

// Create manual reservation (Admin/Vendor only)
router.post("/", authenticateToken, ManualReservationController.createReservation);

// Get vendor reservations
router.get("/vendor/:vendor_id", ManualReservationController.getVendorReservations);

// Cancel reservation
router.delete("/:id", authenticateToken, ManualReservationController.cancelReservation);

export default router;