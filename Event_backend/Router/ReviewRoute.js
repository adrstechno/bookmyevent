import express from "express";
import ReviewController from "../Controllers/ReviewController.js";
import { authenticateToken } from "../Utils/auth.js";

const router = express.Router();

// Public route: Submit review using review token (no auth required)
router.post("/submit-with-token", ReviewController.submitReviewWithToken);

// Submit review for booking (authenticated)
router.post("/submit", authenticateToken, ReviewController.submitReview);
router.post("/bookings/:id", authenticateToken, ReviewController.submitReview);

// Get review for booking
router.get("/bookings/:id", ReviewController.getReviewByBooking);

// Check if user can review booking
router.get("/bookings/:id/can-review", authenticateToken, ReviewController.canUserReview);

// Get all reviews for vendor
router.get("/vendor/:vendorId", ReviewController.getVendorReviews);

// Get vendor rating average and statistics
router.get("/vendor/:vendorId/rating/average", ReviewController.getVendorRatingStats);

// Public routes (MUST BE BEFORE parameterized /:id route)
router.get("/recent", ReviewController.getRecentReviews);
router.get("/top-vendors", ReviewController.getTopRatedVendors);

// Admin routes (MUST BE BEFORE parameterized /:id route)
router.get("/admin/all", authenticateToken, ReviewController.getAllReviews);

// Update review (user only)
router.put("/:id", authenticateToken, ReviewController.updateReview);

// Delete review (user only)
router.delete("/:id", authenticateToken, ReviewController.deleteReview);

// Verify review (MUST BE BEFORE generic /:id)
router.put("/:id/verify", authenticateToken, ReviewController.updateReviewVerification);

// Get review by ID (LAST - catches everything)
router.get("/:id", ReviewController.getReviewById);

export default router;