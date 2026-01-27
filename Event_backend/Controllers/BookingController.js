import BookingModel from "../Models/BookingModel.js";
import OTPModel from "../Models/OTPModel.js";
import NotificationService from "../Services/NotificationService.js";
import EmailService from "../Services/EmailService.js";
import db from "../Config/DatabaseCon.js";
import VendorModel from "../Models/VendorModel.js";
import ReviewTokenService from "../Utils/reviewToken.js";
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
                special_requirement,
                event_latitude,
                event_longitude
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
                special_requirement,
                event_latitude,
                event_longitude
            };

            const result = await BookingModel.createBooking(bookingData);

            // Send notification to vendor about new booking
            try {
                // Get user details for notification
                const userQuery = `SELECT first_name, last_name, email, phone FROM users WHERE uuid = ?`;
                const userResult = await new Promise((resolve, reject) => {
                    db.query(userQuery, [user_id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                // Get vendor details for email notification (FIXED: join vendor_profiles with users)
                const vendorQuery = `
                    SELECT u.first_name, u.last_name, u.email, vp.vendor_id, vp.business_name
                    FROM vendor_profiles vp 
                    JOIN users u ON vp.user_id = u.user_id 
                    WHERE vp.vendor_id = ?
                `;
                const vendorResult = await new Promise((resolve, reject) => {
                    db.query(vendorQuery, [vendor_id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                console.log('Vendor query result for createBooking:', vendorResult);
                console.log('Looking for vendor_id:', vendor_id);

                // Get package details
                const packageQuery = `SELECT package_name, amount FROM vendor_packages WHERE package_id = ?`;
                const packageResult = await new Promise((resolve, reject) => {
                    db.query(packageQuery, [package_id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                const user = userResult && userResult.length > 0 ? userResult[0] : null;
                const vendor = vendorResult && vendorResult.length > 0 ? vendorResult[0] : null;
                const packageInfo = packageResult && packageResult.length > 0 ? packageResult[0] : null;

                const userName = user ? `${user.first_name} ${user.last_name}` : 'A user';
                const vendorName = vendor ? `${vendor.first_name} ${vendor.last_name}` : 'Vendor';
                const packageName = packageInfo ? packageInfo.package_name : `Package #${package_id}`;
                const amount = packageInfo ? packageInfo.amount : 'N/A';

                // Send in-app notification
                await NotificationService.notifyBookingCreated({
                    booking_id: result.booking_id,
                    user_name: userName,
                    vendor_id: vendor_id,
                    event_date: event_date,
                    package_name: packageName
                });

                // Send email notification to vendor
                if (vendor && vendor.email) {
                    await EmailService.sendVendorBookingNotification({
                        vendorEmail: vendor.email,
                        vendorName: vendorName,
                        userName: userName,
                        userEmail: user ? user.email : 'N/A',
                        userPhone: user ? user.phone : 'N/A',
                        packageName: packageName,
                        eventDate: event_date,
                        eventTime: event_time,
                        amount: amount,
                        bookingId: result.booking_id,
                        bookingUuid: booking_uuid
                    });
                    console.log('Vendor booking notification email sent to:', vendor.email);
                }

            } catch (notificationError) {
                console.error('Error sending booking notification:', notificationError);
                // Don't fail the booking if notification fails
            }

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
            const user_id = req.user?.uuid || req.user?.user_id;

            console.log('Accept booking - user:', req.user);
            console.log('Accept booking - booking_id:', id);

            if (!user_id) {
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

            // Try to get vendor_id from req.user first (set by auth middleware)
            let vendor_id = req.user?.vendor_id;

            // If not available, fetch from VendorModel
            if (!vendor_id) {
                const vendorResult = await new Promise((resolve, reject) => {
                    VendorModel.findVendorID(user_id, (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                if (!vendorResult || vendorResult.length === 0) {
                    console.log('No vendor profile found for user_id:', user_id);
                    return res.status(401).json({
                        success: false,
                        message: 'Vendor authentication required. No vendor profile found.'
                    });
                }

                vendor_id = vendorResult[0].vendor_id;
            }

            console.log('Using vendor_id:', vendor_id);

            // Get booking details before update
            const booking = await BookingModel.getBookingById(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            console.log('Booking found:', booking.booking_id, 'vendor_id:', booking.vendor_id);

            // Verify this vendor owns this booking
            if (booking.vendor_id !== vendor_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You can only accept your own bookings'
                });
            }

            await BookingModel.vendorAcceptBooking(id, vendor_id);

            // Send notification to user about booking acceptance
            try {
                // Get vendor details for notification
                const vendorQuery = `SELECT business_name FROM vendor_profiles WHERE vendor_id = ?`;
                const vendorResult = await new Promise((resolve, reject) => {
                    db.query(vendorQuery, [vendor_id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                const vendorName = vendorResult && vendorResult.length > 0 
                    ? vendorResult[0].business_name 
                    : 'The vendor';

                await NotificationService.notifyBookingAccepted({
                    booking_id: id,
                    user_id: booking.user_id,
                    vendor_name: vendorName,
                    event_date: booking.event_date,
                    package_name: `Package #${booking.package_id}`,
                    user_name: 'User' // We'll get this from booking details later
                });
            } catch (notificationError) {
                console.error('Error sending acceptance notification:', notificationError);
                // Don't fail the booking if notification fails
            }

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
            const user_id = req.user?.uuid || req.user?.user_id;

            console.log('Reject booking - user:', req.user);
            console.log('Reject booking - booking_id:', id);

            if (!user_id) {
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

            // Try to get vendor_id from req.user first (set by auth middleware)
            let vendor_id = req.user?.vendor_id;

            // If not available, fetch from VendorModel
            if (!vendor_id) {
                const vendorResult = await new Promise((resolve, reject) => {
                    VendorModel.findVendorID(user_id, (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                if (!vendorResult || vendorResult.length === 0) {
                    console.log('No vendor profile found for user_id:', user_id);
                    return res.status(401).json({
                        success: false,
                        message: 'Vendor authentication required. No vendor profile found.'
                    });
                }

                vendor_id = vendorResult[0].vendor_id;
            }

            console.log('Using vendor_id:', vendor_id);

            // Get booking details before update
            const booking = await BookingModel.getBookingById(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            console.log('Booking found:', booking.booking_id, 'vendor_id:', booking.vendor_id);

            // Verify this vendor owns this booking
            if (booking.vendor_id !== vendor_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You can only reject your own bookings'
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

    // Admin approves booking - generates OTP and sends to user
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

            // Send booking approval notification and email
            try {
                await NotificationService.notifyBookingApproved({
                    booking_id: id,
                    user_id: booking.user_id,
                    vendor_id: booking.vendor_id,
                    vendor_name: booking.business_name,
                    event_date: booking.event_date,
                    package_name: booking.package_name || `Package #${booking.package_id}`
                });

                // ADDED: Send email notification to vendor about admin approval
                try {
                    // Get vendor details for email notification
                    const vendorQuery = `
                        SELECT u.first_name, u.last_name, u.email, vp.vendor_id, vp.business_name
                        FROM vendor_profiles vp 
                        JOIN users u ON vp.user_id = u.user_id 
                        WHERE vp.vendor_id = ?
                    `;
                    const vendorResult = await new Promise((resolve, reject) => {
                        db.query(vendorQuery, [booking.vendor_id], (err, results) => {
                            if (err) reject(err);
                            else resolve(results);
                        });
                    });

                    if (vendorResult && vendorResult.length > 0) {
                        const vendor = vendorResult[0];
                        
                        // Send vendor notification email about admin approval
                        await EmailService.sendVendorBookingApprovalNotification({
                            vendorEmail: vendor.email,
                            vendorName: `${vendor.first_name} ${vendor.last_name}`,
                            businessName: vendor.business_name,
                            bookingId: id,
                            packageName: booking.package_name || `Package #${booking.package_id}`,
                            eventDate: booking.event_date,
                            customerName: booking.user_name || 'Customer'
                        });
                        
                        console.log('✅ Vendor approval notification email sent to:', vendor.email);
                    } else {
                        console.log('❌ No vendor found for vendor_id:', booking.vendor_id);
                    }
                } catch (vendorEmailError) {
                    console.error('❌ Failed to send vendor approval notification:', vendorEmailError);
                }

            } catch (notificationError) {
                console.error('Error sending booking approval notification:', notificationError);
                // Don't fail the approval if notification fails
            }

            // Generate OTP for the user after admin approval
            let otpResult = null;
            try {
                otpResult = await OTPModel.createOTP(
                    id,
                    booking.user_id,
                    booking.vendor_id,
                    'vendor' // Using 'vendor' as generated_by since ENUM may not have 'admin' yet
                );

                // Send notification to user with OTP
                await NotificationService.notifyOTPGenerated({
                    booking_id: id,
                    user_id: booking.user_id,
                    otp_code: otpResult.otp,
                    vendor_name: booking.business_name,
                    event_date: booking.event_date,
                    expires_at: otpResult.expiresAt
                });
            } catch (otpError) {
                console.error('OTP generation error:', otpError);
                // Continue even if OTP generation fails - booking is still approved
            }

            res.status(200).json({
                success: true,
                message: 'Booking approved successfully. OTP has been sent to the user.',
                data: {
                    booking_id: id,
                    status: 'confirmed',
                    admin_approval: 'approved',
                    otp_generated: !!otpResult,
                    otp_expires_at: otpResult?.expiresAt
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
            const user_type = req.user?.user_type;

            console.log('Cancel booking - user:', req.user);
            console.log('Cancel booking - booking_id:', id);

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

            console.log('Booking found:', booking.booking_id, 'user_id:', booking.user_id, 'vendor_id:', booking.vendor_id);

            // Determine who is cancelling and validate access
            let cancelled_by, cancelled_by_type;
            
            if (booking.user_id === user_id) {
                cancelled_by = user_id;
                cancelled_by_type = 'user';
            } else {
                // Try to get vendor_id from req.user first (set by auth middleware)
                let vendor_id = req.user?.vendor_id;

                // If not available, fetch from VendorModel
                if (!vendor_id) {
                    const vendorResult = await new Promise((resolve, reject) => {
                        VendorModel.findVendorID(user_id, (err, results) => {
                            if (err) reject(err);
                            else resolve(results);
                        });
                    });

                    if (vendorResult && vendorResult.length > 0) {
                        vendor_id = vendorResult[0].vendor_id;
                    }
                }

                console.log('Checking vendor access - vendor_id:', vendor_id, 'booking.vendor_id:', booking.vendor_id);

                if (vendor_id && vendor_id === booking.vendor_id) {
                    cancelled_by = vendor_id;
                    cancelled_by_type = 'vendor';
                } else {
                    return res.status(403).json({
                        success: false,
                        message: 'Unauthorized: You can only cancel your own bookings'
                    });
                }
            }

            console.log('Cancelling booking - cancelled_by:', cancelled_by, 'type:', cancelled_by_type);

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
            let hasAccess = booking.user_id === user_id || user_type === 'admin';
            
            // For vendors, check if they own this booking
            if (!hasAccess && user_type === 'vendor') {
                const vendorResult = await new Promise((resolve, reject) => {
                    VendorModel.findVendorID(user_id, (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                if (vendorResult && vendorResult.length > 0) {
                    hasAccess = booking.vendor_id === vendorResult[0].vendor_id;
                }
            }

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
            const user_id = req.user?.uuid || req.user?.user_id;
            
            if (!user_id) {
                console.log('No user_id found for vendor');
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required'
                });
            }

            // Get the vendor_id for this user
            const vendorResult = await new Promise((resolve, reject) => {
                VendorModel.findVendorID(user_id, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (!vendorResult || vendorResult.length === 0) {
                console.log('No vendor profile found for user_id:', user_id);
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required. No vendor profile found.'
                });
            }

            const vendor_id = vendorResult[0].vendor_id;
            console.log('Fetching bookings for vendor_id:', vendor_id);

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
            console.log('Found', bookings.length, 'bookings for vendor');

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
            let hasAccess = booking.user_id === user_id || user_type === 'admin';
            
            // For vendors, check if they own this booking
            if (!hasAccess && user_type === 'vendor') {
                const vendorResult = await new Promise((resolve, reject) => {
                    VendorModel.findVendorID(user_id, (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                if (vendorResult && vendorResult.length > 0) {
                    hasAccess = booking.vendor_id === vendorResult[0].vendor_id;
                }
            }

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
                special_requirement,
                event_latitude,
                event_longitude
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
                special_requirement,
                event_latitude,
                event_longitude
            };

            const result = await BookingModel.createBooking(bookingData);

            // Send notification to vendor about new booking (same as createBooking method)
            try {
                // Get user details for notification
                const userQuery = `SELECT first_name, last_name, email, phone FROM users WHERE uuid = ?`;
                const userResult = await new Promise((resolve, reject) => {
                    db.query(userQuery, [user_id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                // Get vendor details for email notification (FIXED: join vendor_profiles with users)
                const vendorQuery = `
                    SELECT u.first_name, u.last_name, u.email, vp.vendor_id, vp.business_name
                    FROM vendor_profiles vp 
                    JOIN users u ON vp.user_id = u.user_id 
                    WHERE vp.vendor_id = ?
                `;
                const vendorResult = await new Promise((resolve, reject) => {
                    db.query(vendorQuery, [vendor_id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                console.log('Vendor query result for insertBooking:', vendorResult);
                console.log('Looking for vendor_id:', vendor_id);

                // Get package details
                const packageQuery = `SELECT package_name, amount FROM vendor_packages WHERE package_id = ?`;
                const packageResult = await new Promise((resolve, reject) => {
                    db.query(packageQuery, [package_id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                const user = userResult && userResult.length > 0 ? userResult[0] : null;
                const vendor = vendorResult && vendorResult.length > 0 ? vendorResult[0] : null;
                const packageInfo = packageResult && packageResult.length > 0 ? packageResult[0] : null;

                const userName = user ? `${user.first_name} ${user.last_name}` : 'A user';
                const vendorName = vendor ? `${vendor.first_name} ${vendor.last_name}` : 'Vendor';
                const packageName = packageInfo ? packageInfo.package_name : `Package #${package_id}`;
                const amount = packageInfo ? packageInfo.amount : 'N/A';

                // Send in-app notification
                await NotificationService.notifyBookingCreated({
                    booking_id: result.booking_id,
                    user_name: userName,
                    vendor_id: vendor_id,
                    event_date: event_date,
                    package_name: packageName
                });

                // Send email notification to vendor
                if (vendor && vendor.email) {
                    await EmailService.sendVendorBookingNotification({
                        vendorEmail: vendor.email,
                        vendorName: vendorName,
                        userName: userName,
                        userEmail: user ? user.email : 'N/A',
                        userPhone: user ? user.phone : 'N/A',
                        packageName: packageName,
                        eventDate: event_date,
                        eventTime: event_time,
                        amount: amount,
                        bookingId: result.booking_id,
                        bookingUuid: booking_uuid
                    });
                    console.log('Vendor booking notification email sent to:', vendor.email);
                }

            } catch (notificationError) {
                console.error('Error sending booking notification:', notificationError);
                // Don't fail the booking if notification fails
            }

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

    // Public endpoint to get booking details for review using review token
    static async getBookingForReview(req, res) {
        try {
            const { bookingId } = req.params;
            const { token } = req.query;

            if (!bookingId) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Review token is required'
                });
            }

            // Verify the review token
            const tokenVerification = ReviewTokenService.verifyReviewToken(token);
            if (!tokenVerification.success) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired review token'
                });
            }

            // Ensure the token is for this specific booking
            if (tokenVerification.data.booking_id !== bookingId) {
                return res.status(403).json({
                    success: false,
                    message: 'Token does not match booking ID'
                });
            }

            // Get booking details
            const booking = await BookingModel.getBookingById(bookingId);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Verify the booking belongs to the user in the token
            if (booking.user_email !== tokenVerification.data.user_email) {
                return res.status(403).json({
                    success: false,
                    message: 'Booking does not belong to the token user'
                });
            }

            // Check if booking is eligible for review
            if (!['awaiting_review', 'completed'].includes(booking.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'This booking is not eligible for review',
                    data: { status: booking.status }
                });
            }

            // Return booking details (without sensitive information)
            const reviewBookingData = {
                booking_id: booking.booking_id,
                booking_uuid: booking.booking_uuid,
                vendor_id: booking.vendor_id,
                vendor_name: booking.vendor_name,
                business_name: booking.business_name,
                package_id: booking.package_id,
                package_name: booking.package_name,
                event_date: booking.event_date,
                event_time: booking.event_time,
                status: booking.status,
                created_at: booking.created_at,
                user_email: booking.user_email,
                user_name: booking.user_name
            };

            res.status(200).json({
                success: true,
                data: reviewBookingData,
                message: 'Booking details retrieved for review'
            });

        } catch (error) {
            console.error('Get booking for review error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch booking for review',
                error: error.message
            });
        }
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
    getBookingForReview,
    approveBooking
} = BookingController;