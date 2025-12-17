import ReviewModel from "../Models/ReviewModel.js";
import BookingModel from "../Models/BookingModel.js";
import NotificationService from "../Services/NotificationService.js";

class ReviewController {
    // Submit review for booking
    static async submitReview(req, res) {
        try {
            const { id: booking_id } = req.params;
            const user_id = req.user?.uuid || req.user?.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const {
                rating,
                review_text,
                service_quality,
                communication,
                value_for_money,
                punctuality
            } = req.body;

            // Validate required fields
            if (!booking_id || !rating) {
                return res.status(400).json({
                    success: false,
                    message: 'booking_id and rating are required'
                });
            }

            // Validate rating range
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }

            // Check if user can review this booking
            const canReview = await ReviewModel.canUserReviewBooking(booking_id, user_id);
            if (!canReview.canReview) {
                return res.status(400).json({
                    success: false,
                    message: canReview.reason
                });
            }

            const booking = canReview.booking;

            // Create review
            const reviewData = {
                user_id,
                booking_id,
                vendor_id: booking.vendor_id,
                rating,
                review_text: review_text || null,
                service_quality,
                communication,
                value_for_money,
                punctuality
            };

            const result = await ReviewModel.createReview(reviewData);

            // Update booking status to completed
            await BookingModel.completeBooking(booking_id);

            // Get full booking details for notifications
            const fullBooking = await BookingModel.getBookingById(booking_id);

            // Send notifications
            await NotificationService.notifyReviewSubmitted({
                booking_id,
                user_name: `${fullBooking.first_name} ${fullBooking.last_name}`,
                vendor_id: booking.vendor_id,
                vendor_name: fullBooking.business_name,
                rating,
                review_text,
                event_date: fullBooking.event_date
            });

            res.status(201).json({
                success: true,
                message: 'Review submitted successfully',
                data: {
                    rating_id: result.rating_id,
                    rating_uuid: result.rating_uuid,
                    overall_rating: result.overall_rating,
                    booking_status: BookingModel.BOOKING_STATUS.COMPLETED
                }
            });

        } catch (error) {
            console.error('Submit review error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit review',
                error: error.message
            });
        }
    }

    // Get review for booking
    static async getReviewByBooking(req, res) {
        try {
            const { id: booking_id } = req.params;
            const user_id = req.user?.uuid || req.user?.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!booking_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            // Get booking to verify access
            const booking = await BookingModel.getBookingById(booking_id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Check access permissions
            const hasAccess = booking.user_id === user_id || 
                            booking.vendor_id === req.user?.vendor_id ||
                            req.user?.user_type === 'admin';

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You do not have access to this booking'
                });
            }

            const review = await ReviewModel.getReviewByBookingId(booking_id);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'No review found for this booking'
                });
            }

            res.status(200).json({
                success: true,
                data: review
            });

        } catch (error) {
            console.error('Get review by booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch review',
                error: error.message
            });
        }
    }

    // Get all reviews for vendor
    static async getVendorReviews(req, res) {
        try {
            const { vendorId } = req.params;

            if (!vendorId) {
                return res.status(400).json({
                    success: false,
                    message: 'Vendor ID is required'
                });
            }

            const {
                page = 1,
                limit = 20,
                rating_filter,
                sort_by = 'created_at',
                sort_order = 'DESC'
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                rating_filter: rating_filter ? parseInt(rating_filter) : null,
                sort_by,
                sort_order
            };

            const reviews = await ReviewModel.getVendorReviews(vendorId, options);

            res.status(200).json({
                success: true,
                data: {
                    reviews,
                    pagination: {
                        page: options.page,
                        limit: options.limit,
                        hasMore: reviews.length === options.limit
                    }
                }
            });

        } catch (error) {
            console.error('Get vendor reviews error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch vendor reviews',
                error: error.message
            });
        }
    }

    // Get vendor rating average and statistics
    static async getVendorRatingStats(req, res) {
        try {
            const { vendorId } = req.params;

            if (!vendorId) {
                return res.status(400).json({
                    success: false,
                    message: 'Vendor ID is required'
                });
            }

            const stats = await ReviewModel.getVendorRatingStats(vendorId);

            res.status(200).json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Get vendor rating stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch vendor rating statistics',
                error: error.message
            });
        }
    }

    // Update review (user only)
    static async updateReview(req, res) {
        try {
            const { id: rating_id } = req.params;
            const user_id = req.user?.uuid || req.user?.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const {
                rating,
                review_text,
                service_quality,
                communication,
                value_for_money,
                punctuality
            } = req.body;

            // Validate rating if provided
            if (rating && (rating < 1 || rating > 5)) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }

            const updateData = {
                rating,
                review_text,
                service_quality,
                communication,
                value_for_money,
                punctuality
            };

            // Remove undefined values
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one field must be provided for update'
                });
            }

            const success = await ReviewModel.updateReview(rating_id, user_id, updateData);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found or unauthorized'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Review updated successfully'
            });

        } catch (error) {
            console.error('Update review error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update review',
                error: error.message
            });
        }
    }

    // Delete review (user only)
    static async deleteReview(req, res) {
        try {
            const { id: rating_id } = req.params;
            const user_id = req.user?.uuid || req.user?.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const success = await ReviewModel.deleteReview(rating_id, user_id);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found or unauthorized'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Review deleted successfully'
            });

        } catch (error) {
            console.error('Delete review error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete review',
                error: error.message
            });
        }
    }

    // Get recent reviews (public)
    static async getRecentReviews(req, res) {
        try {
            const { limit = 10 } = req.query;
            const reviews = await ReviewModel.getRecentReviews(Math.min(parseInt(limit), 50));

            res.status(200).json({
                success: true,
                data: reviews
            });

        } catch (error) {
            console.error('Get recent reviews error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recent reviews',
                error: error.message
            });
        }
    }

    // Get top rated vendors (public)
    static async getTopRatedVendors(req, res) {
        try {
            const { limit = 10, min_reviews = 5 } = req.query;
            
            const vendors = await ReviewModel.getTopRatedVendors(
                Math.min(parseInt(limit), 50),
                parseInt(min_reviews)
            );

            res.status(200).json({
                success: true,
                data: vendors
            });

        } catch (error) {
            console.error('Get top rated vendors error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch top rated vendors',
                error: error.message
            });
        }
    }

    // Admin: Get all reviews with filters
    static async getAllReviews(req, res) {
        try {
            if (req.user?.user_type !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            const {
                page = 1,
                limit = 20,
                vendor_id,
                rating_filter,
                is_verified
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                vendor_id: vendor_id ? parseInt(vendor_id) : null,
                rating_filter: rating_filter ? parseInt(rating_filter) : null,
                is_verified: is_verified !== undefined ? is_verified === 'true' : undefined
            };

            const reviews = await ReviewModel.getAllReviews(options);

            res.status(200).json({
                success: true,
                data: {
                    reviews,
                    pagination: {
                        page: options.page,
                        limit: options.limit,
                        hasMore: reviews.length === options.limit
                    }
                }
            });

        } catch (error) {
            console.error('Get all reviews error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch all reviews',
                error: error.message
            });
        }
    }

    // Admin: Verify/Unverify review
    static async updateReviewVerification(req, res) {
        try {
            if (req.user?.user_type !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            const { id: rating_id } = req.params;
            const { is_verified } = req.body;

            if (typeof is_verified !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'is_verified must be a boolean value'
                });
            }

            const success = await ReviewModel.updateReviewVerification(rating_id, is_verified);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found'
                });
            }

            res.status(200).json({
                success: true,
                message: `Review ${is_verified ? 'verified' : 'unverified'} successfully`
            });

        } catch (error) {
            console.error('Update review verification error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update review verification',
                error: error.message
            });
        }
    }

    // Check if user can review booking
    static async canUserReview(req, res) {
        try {
            const { id: booking_id } = req.params;
            const user_id = req.user?.uuid || req.user?.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const result = await ReviewModel.canUserReviewBooking(booking_id, user_id);

            res.status(200).json({
                success: true,
                data: {
                    can_review: result.canReview,
                    reason: result.reason,
                    booking: result.booking
                }
            });

        } catch (error) {
            console.error('Can user review error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check review eligibility',
                error: error.message
            });
        }
    }

    // Get review by ID
    static async getReviewById(req, res) {
        try {
            const { id: rating_id } = req.params;

            if (!rating_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Review ID is required'
                });
            }

            const review = await ReviewModel.getReviewById(rating_id);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found'
                });
            }

            res.status(200).json({
                success: true,
                data: review
            });

        } catch (error) {
            console.error('Get review by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch review',
                error: error.message
            });
        }
    }
}

export default ReviewController;