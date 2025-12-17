import express from "express";
import ReviewController from "../Controllers/ReviewController.js";
import { authenticateToken } from "../Utils/auth.js";

const router = express.Router();

// Submit review for booking
router.post("/bookings/:id", authenticateToken, ReviewController.submitReview);

// Get review for booking
router.get("/bookings/:id", ReviewController.getReviewByBooking);

// Check if user can review booking
router.get("/bookings/:id/can-review", authenticateToken, ReviewController.canUserReview);

// Get all reviews for vendor
router.get("/vendor/:vendorId", ReviewController.getVendorReviews);

// Get vendor rating average and statistics
router.get("/vendor/:vendorId/rating/average", ReviewController.getVendorRatingStats);

// Update review (user only)
router.put("/:id", authenticateToken, ReviewController.updateReview);

// Delete review (user only)
router.delete("/:id", authenticateToken, ReviewController.deleteReview);

// Get review by ID
router.get("/:id", ReviewController.getReviewById);

// Public routes
router.get("/recent", ReviewController.getRecentReviews);
router.get("/top-vendors", ReviewController.getTopRatedVendors);

// Admin routes
router.get("/admin/all", authenticateToken, ReviewController.getAllReviews);
router.put("/:id/verify", authenticateToken, ReviewController.updateReviewVerification);

export default router;