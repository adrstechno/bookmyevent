import BookingModel from "../Models/BookingModel.js";
import { v4 as uuidv4 } from 'uuid';

class BookingController {
    // Create new booking
    static async createBooking(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;
            
            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const {
                vendor_id,
                shift_id,
                package_id,
                event_address,
                event_date,
                event_time,
                special_requirement
            } = req.body;

            // Validate required fields
            if (!vendor_id || !shift_id || !package_id || !event_address || !event_date || !event_time) {
                return res.status(400).json({
                    success: false,
                    message: 'vendor_id, shift_id, package_id, event_address, event_date, and event_time are required'
                });
            }

            // Generate booking UUID
            const booking_uuid = uuidv4();

            const bookingData = {
                booking_uuid,
                user_id,
                vendor_id,
                shift_id,
                package_id,
                event_address,
                event_date,
                event_time,
                special_requirement
            };

            const result = await BookingModel.createBooking(bookingData);

            // Notification will be handled separately if needed

            res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: {
                    booking_id: result.booking_id,
                    booking_uuid: result.booking_uuid,
                    status: 'pending'
                }
            });

        } catch (error) {
            console.error('Create booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create booking',
                error: error.message
            });
        }
    }

    // Vendor accepts booking
    static async acceptBooking(req, res) {
        try {
            const { id } = req.params;
            const vendor_id = req.user?.vendor_id || req.user?.user_id;

            if (!vendor_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required'
                });
            }

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            // Get booking details before update
            const booking = await BookingModel.getBookingById(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            await BookingModel.vendorAcceptBooking(id, vendor_id);

            // Notification will be handled separately if needed

            res.status(200).json({
                success: true,
                message: 'Booking accepted successfully',
                data: {
                    booking_id: id,
                    status: 'confirmed'
                }
            });

        } catch (error) {
            console.error('Accept booking error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to accept booking',
                error: error.message
            });
        }
    }

    // Vendor rejects booking
    static async rejectBooking(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const vendor_id = req.user?.vendor_id || req.user?.user_id;

            if (!vendor_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required'
                });
            }

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            // Get booking details before update
            const booking = await BookingModel.getBookingById(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            await BookingModel.vendorRejectBooking(id, vendor_id, reason);

            // Notification will be handled separately if needed

            res.status(200).json({
                success: true,
                message: 'Booking rejected successfully',
                data: {
                    booking_id: id,
                    status: 'cancelled'
                }
            });

        } catch (error) {
            console.error('Reject booking error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to reject booking',
                error: error.message
            });
        }
    }

    // Admin approves booking
    static async approveBooking(req, res) {
        try {
            const { id } = req.params;
            const admin_id = req.user?.user_id;

            if (!admin_id || req.user?.user_type !== 'admin') {
                return res.status(401).json({
                    success: false,
                    message: 'Admin authentication required'
                });
            }

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            // Get booking details before update
            const booking = await BookingModel.getBookingById(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            await BookingModel.adminApproveBooking(id, admin_id);

            // Notification will be handled separately if needed

            res.status(200).json({
                success: true,
                message: 'Booking approved successfully',
                data: {
                    booking_id: id,
                    status: 'confirmed'
                }
            });

        } catch (error) {
            console.error('Approve booking error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to approve booking',
                error: error.message
            });
        }
    }

    // Admin rejects booking
    static async adminRejectBooking(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const admin_id = req.user?.user_id;

            if (!admin_id || req.user?.user_type !== 'admin') {
                return res.status(401).json({
                    success: false,
                    message: 'Admin authentication required'
                });
            }

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            // Get booking details before update
            const booking = await BookingModel.getBookingById(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            await BookingModel.adminRejectBooking(id, admin_id, reason);

            // Notification will be handled separately if needed

            res.status(200).json({
                success: true,
                message: 'Booking rejected successfully',
                data: {
                    booking_id: id,
                    status: 'cancelled'
                }
            });

        } catch (error) {
            console.error('Admin reject booking error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to reject booking',
                error: error.message
            });
        }
    }

    // Cancel booking (user or vendor)
    static async cancelBooking(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const user_id = req.user?.uuid || req.user?.user_id;
            const vendor_id = req.user?.vendor_id;
            const user_type = req.user?.user_type;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            // Get booking details before update
            const booking = await BookingModel.getBookingById(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Determine who is cancelling and validate access
            let cancelled_by, cancelled_by_type;
            
            if (booking.user_id === user_id) {
                cancelled_by = user_id;
                cancelled_by_type = 'user';
            } else if (booking.vendor_id === vendor_id) {
                cancelled_by = vendor_id;
                cancelled_by_type = 'vendor';
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You can only cancel your own bookings'
                });
            }

            await BookingModel.cancelBooking(id, cancelled_by, cancelled_by_type, reason);

            // Notification will be handled separately if needed

            const newStatus = 'cancelled';

            res.status(200).json({
                success: true,
                message: 'Booking cancelled successfully',
                data: {
                    booking_id: id,
                    status: newStatus,
                    cancelled_by: cancelled_by_type
                }
            });

        } catch (error) {
            console.error('Cancel booking error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to cancel booking',
                error: error.message
            });
        }
    }

    // Get booking status
    static async getBookingStatus(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user?.uuid || req.user?.user_id;
            const vendor_id = req.user?.vendor_id;
            const user_type = req.user?.user_type;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            const booking = await BookingModel.getBookingById(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Check access permissions
            const hasAccess = booking.user_id === user_id || 
                            booking.vendor_id === vendor_id ||
                            user_type === 'admin';

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You do not have access to this booking'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    booking_id: id,
                    status: booking.status,
                    admin_approval: booking.admin_approval,
                    created_at: booking.created_at,
                    updated_at: booking.updated_at,
                    event_date: booking.event_date,
                    event_time: booking.event_time,
                    vendor_name: booking.business_name,
                    package_name: booking.package_name,
                    user_name: `${booking.first_name} ${booking.last_name}`
                }
            });

        } catch (error) {
            console.error('Get booking status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get booking status',
                error: error.message
            });
        }
    }

    // Get user bookings
    static async getUserBookings(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;
            
            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const {
                page = 1,
                limit = 20,
                status
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                status
            };

            const bookings = await BookingModel.getBookingsByUser(user_id, options);

            res.status(200).json({
                success: true,
                data: {
                    bookings,
                    pagination: {
                        page: options.page,
                        limit: options.limit,
                        hasMore: bookings.length === options.limit
                    }
                }
            });

        } catch (error) {
            console.error('Get user bookings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user bookings',
                error: error.message
            });
        }
    }

    // Get vendor bookings
    static async getVendorBookings(req, res) {
        try {
            const vendor_id = req.user?.vendor_id || req.user?.user_id;
            
            if (!vendor_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required'
                });
            }

            const {
                page = 1,
                limit = 20,
                status
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                status
            };

            const bookings = await BookingModel.getBookingsByVendor(vendor_id, options);

            res.status(200).json({
                success: true,
                data: {
                    bookings,
                    pagination: {
                        page: options.page,
                        limit: options.limit,
                        hasMore: bookings.length === options.limit
                    }
                }
            });

        } catch (error) {
            console.error('Get vendor bookings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch vendor bookings',
                error: error.message
            });
        }
    }

    // Get all bookings (admin)
    static async getAllBookings(req, res) {
        try {
            const user_type = req.user?.user_type;
            
            if (user_type !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            const {
                page = 1,
                limit = 20,
                status,
                admin_approval
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                status,
                admin_approval
            };

            const bookings = await BookingModel.getAllBookings(options);

            res.status(200).json({
                success: true,
                data: {
                    bookings,
                    pagination: {
                        page: options.page,
                        limit: options.limit,
                        hasMore: bookings.length === options.limit
                    }
                }
            });

        } catch (error) {
            console.error('Get all bookings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch all bookings',
                error: error.message
            });
        }
    }

    // Get booking by ID
    static async getBookingById(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user?.uuid || req.user?.user_id;
            const vendor_id = req.user?.vendor_id;
            const user_type = req.user?.user_type;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            const booking = await BookingModel.getBookingById(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Check access permissions
            const hasAccess = booking.user_id === user_id || 
                            booking.vendor_id === vendor_id ||
                            user_type === 'admin';

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You do not have access to this booking'
                });
            }

            res.status(200).json({
                success: true,
                data: booking
            });

        } catch (error) {
            console.error('Get booking by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch booking',
                error: error.message
            });
        }
    }

    // Mark booking as awaiting review
    static async markAwaitingReview(req, res) {
        try {
            const { id } = req.params;
            
            // This would typically be called by a system process after event completion
            // For now, allow admin to trigger it
            if (req.user?.user_type !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            await BookingModel.markAwaitingReview(id);

            // Get booking details for notification
            const booking = await BookingModel.getBookingById(id);

            // Notification will be handled separately if needed

            res.status(200).json({
                success: true,
                message: 'Booking marked as awaiting review',
                data: {
                    booking_id: id,
                    status: 'completed'
                }
            });

        } catch (error) {
            console.error('Mark awaiting review error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to mark booking as awaiting review',
                error: error.message
            });
        }
    }

    // Legacy functions for backward compatibility with existing routes
    static async insertBooking(req, res) {
        try {
            // For legacy compatibility, get user_id from request body if not authenticated
            const user_id = req.user?.uuid || req.user?.user_id || req.body.user_id;
            
            if (!user_id) {
                return res.status(400).json({
                    success: false,
                    message: 'user_id is required'
                });
            }

            const {
                vendor_id,
                shift_id,
                package_id,
                event_address,
                event_date,
                event_time,
                special_requirement
            } = req.body;

            // Validate required fields
            if (!vendor_id || !shift_id || !package_id || !event_address || !event_date || !event_time) {
                return res.status(400).json({
                    success: false,
                    message: 'vendor_id, shift_id, package_id, event_address, event_date, and event_time are required'
                });
            }

            // Generate booking UUID
            const booking_uuid = uuidv4();

            const bookingData = {
                booking_uuid,
                user_id,
                vendor_id,
                shift_id,
                package_id,
                event_address,
                event_date,
                event_time,
                special_requirement
            };

            const result = await BookingModel.createBooking(bookingData);

            res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: {
                    booking_id: result.booking_id,
                    booking_uuid: result.booking_uuid,
                    status: 'pending'
                }
            });

        } catch (error) {
            console.error('Insert booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create booking',
                error: error.message
            });
        }
    }

    static async updateBooking(req, res) {
        // This would need to be implemented based on your existing logic
        // For now, return a placeholder response
        res.status(501).json({
            success: false,
            message: 'Update booking functionality moved to specific action endpoints (accept/reject/approve/cancel)'
        });
    }

    static async deleteBooking(req, res) {
        // This would redirect to cancel booking or implement soft delete
        res.status(501).json({
            success: false,
            message: 'Delete booking functionality moved to cancel booking endpoint'
        });
    }

    static async getBookingsByUserId(req, res) {
        // Redirect to getUserBookings
        return BookingController.getUserBookings(req, res);
    }

    static async getBookingsByVendorId(req, res) {
        // Redirect to getVendorBookings
        return BookingController.getVendorBookings(req, res);
    }
}

// Export both class and individual functions for compatibility
export default BookingController;

// Named exports for legacy compatibility
export const {
    insertBooking,
    updateBooking,
    deleteBooking,
    getBookingsByUserId,
    getBookingsByVendorId,
    getBookingById,
    approveBooking
} = BookingController;