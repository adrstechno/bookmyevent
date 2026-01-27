import OTPModel from "../Models/OTPModel.js";
import BookingModel from "../Models/BookingModel.js";
import NotificationService from "../Services/NotificationService.js";

class OTPController {
    // Generate OTP for booking (vendor-initiated)
    static async generateOTP(req, res) {
        try {
            const { booking_id } = req.body;
            const user_id = req.user?.uuid || req.user?.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required'
                });
            }

            if (!booking_id) {
                return res.status(400).json({
                    success: false,
                    message: 'booking_id is required'
                });
            }

            // Get the vendor_id for this user
            const VendorModel = (await import('../Models/VendorModel.js')).default;
            
            const vendorResult = await new Promise((resolve, reject) => {
                VendorModel.findVendorID(user_id, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (!vendorResult || vendorResult.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required. No vendor profile found.'
                });
            }

            const vendor_id = vendorResult[0].vendor_id;

            // Get booking details
            const booking = await BookingModel.getBookingById(booking_id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Verify vendor owns this booking
            if (booking.vendor_id !== vendor_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You can only generate OTP for your own bookings'
                });
            }

            // Check if booking is in correct status for OTP generation
            if (booking.status !== 'confirmed' || booking.admin_approval !== 'approved') {
                return res.status(400).json({
                    success: false,
                    message: 'OTP can only be generated for admin-approved bookings',
                    currentStatus: booking.status,
                    adminApproval: booking.admin_approval
                });
            }

            // Generate OTP
            const otpResult = await OTPModel.createOTP(
                booking_id,
                booking.user_id,
                vendor_id,
                'vendor'
            );

            // Update booking status to indicate OTP verification is in progress
            await BookingModel.startOTPVerification(booking_id);

            // Send notification to user with OTP
            await NotificationService.notifyOTPGenerated({
                booking_id,
                user_id: booking.user_id,
                otp_code: otpResult.otp,
                vendor_name: booking.business_name,
                event_date: booking.event_date,
                expires_at: otpResult.expiresAt
            });

            res.status(201).json({
                success: true,
                message: 'OTP generated and sent to user',
                data: {
                    otp_id: otpResult.id,
                    expires_at: otpResult.expiresAt,
                    booking_id
                }
            });

        } catch (error) {
            console.error('Generate OTP error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate OTP',
                error: error.message
            });
        }
    }

    // Verify OTP (vendor submits user's code)
    static async verifyOTP(req, res) {
        try {
            const { booking_id, otp_code } = req.body;
            const user_id = req.user?.uuid || req.user?.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required'
                });
            }

            if (!booking_id || !otp_code) {
                return res.status(400).json({
                    success: false,
                    message: 'booking_id and otp_code are required'
                });
            }

            // Get the vendor_id for this user
            const VendorModel = (await import('../Models/VendorModel.js')).default;
            
            const vendorResult = await new Promise((resolve, reject) => {
                VendorModel.findVendorID(user_id, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (!vendorResult || vendorResult.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required. No vendor profile found.'
                });
            }

            const vendor_id = vendorResult[0].vendor_id;

            // Get booking details
            const booking = await BookingModel.getBookingById(booking_id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Verify vendor owns this booking
            if (booking.vendor_id !== vendor_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You can only verify OTP for your own bookings'
                });
            }

            // Verify OTP
            const verificationResult = await OTPModel.verifyOTP(booking_id, otp_code, vendor_id);

            if (!verificationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: verificationResult.message,
                    data: {
                        isLocked: verificationResult.isLocked,
                        isExpired: verificationResult.isExpired,
                        attemptsRemaining: verificationResult.attemptsRemaining,
                        lockExpiresAt: verificationResult.lockExpiresAt
                    }
                });
            }

            // Update booking status to confirmed
            await BookingModel.completeOTPVerification(booking_id);

            // Send confirmation notifications
            await NotificationService.notifyOTPVerified({
                booking_id,
                user_id: booking.user_id,
                user_name: `${booking.first_name} ${booking.last_name}`,
                vendor_id,
                vendor_name: booking.business_name,
                event_date: booking.event_date,
                package_name: booking.package_name
            });

            // Send notification to user to add review after booking is confirmed
            await NotificationService.notifyReviewReminder({
                booking_id,
                user_id: booking.user_id,
                vendor_name: booking.business_name,
                event_date: booking.event_date,
                package_name: booking.package_name
            });

            res.status(200).json({
                success: true,
                message: 'OTP verified successfully. Booking confirmed!',
                data: {
                    booking_id,
                    verified_at: new Date(),
                    booking_status: 'confirmed'
                }
            });

        } catch (error) {
            console.error('Verify OTP error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify OTP',
                error: error.message
            });
        }
    }

    // Get OTP status for booking
    static async getOTPStatus(req, res) {
        try {
            const { bookingId } = req.params;
            const user_id = req.user?.uuid || req.user?.user_id;
            const user_type = req.user?.user_type;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!bookingId) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            // Get booking details to verify access
            const booking = await BookingModel.getBookingById(bookingId);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Check if user has access to this booking
            let hasAccess = booking.user_id === user_id || user_type === 'admin';
            
            // For vendors, check if they own this booking
            if (!hasAccess && user_type === 'vendor') {
                const VendorModel = (await import('../Models/VendorModel.js')).default;
                
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

            const otpStatus = await OTPModel.getOTPStatus(bookingId);

            res.status(200).json({
                success: true,
                data: {
                    booking_id: bookingId,
                    otp_status: otpStatus,
                    booking_status: booking.status
                }
            });

        } catch (error) {
            console.error('Get OTP status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get OTP status',
                error: error.message
            });
        }
    }

    // Resend OTP
    static async resendOTP(req, res) {
        try {
            const { booking_id } = req.body;
            const user_id = req.user?.uuid || req.user?.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required'
                });
            }

            if (!booking_id) {
                return res.status(400).json({
                    success: false,
                    message: 'booking_id is required'
                });
            }

            // Get the vendor_id for this user
            const VendorModel = (await import('../Models/VendorModel.js')).default;
            
            const vendorResult = await new Promise((resolve, reject) => {
                VendorModel.findVendorID(user_id, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (!vendorResult || vendorResult.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required. No vendor profile found.'
                });
            }

            const vendor_id = vendorResult[0].vendor_id;

            // Get booking details
            const booking = await BookingModel.getBookingById(booking_id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Verify vendor owns this booking
            if (booking.vendor_id !== vendor_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You can only resend OTP for your own bookings'
                });
            }

            // Check booking status
            if (booking.status !== 'confirmed' || booking.admin_approval !== 'approved') {
                return res.status(400).json({
                    success: false,
                    message: 'OTP can only be resent for admin-approved bookings',
                    currentStatus: booking.status,
                    adminApproval: booking.admin_approval
                });
            }

            // Resend OTP
            const resendResult = await OTPModel.resendOTP(
                booking_id,
                booking.user_id,
                vendor_id
            );

            if (!resendResult.success) {
                return res.status(429).json({
                    success: false,
                    message: resendResult.message,
                    data: {
                        canResendAt: resendResult.canResendAt
                    }
                });
            }

            // Get the new OTP (for notification)
            const activeOTP = await OTPModel.getActiveOTP(booking_id);

            // Send notification to user with new OTP
            await NotificationService.notifyOTPGenerated({
                booking_id,
                user_id: booking.user_id,
                otp_code: activeOTP.otp,
                vendor_name: booking.business_name,
                event_date: booking.event_date,
                expires_at: resendResult.expiresAt
            });

            res.status(200).json({
                success: true,
                message: 'New OTP generated and sent to user',
                data: {
                    expires_at: resendResult.expiresAt,
                    booking_id
                }
            });

        } catch (error) {
            console.error('Resend OTP error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to resend OTP',
                error: error.message
            });
        }
    }

    // Get remaining attempts for OTP verification
    static async getRemainingAttempts(req, res) {
        try {
            const { bookingId } = req.params;
            const user_id = req.user?.uuid || req.user?.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required'
                });
            }

            if (!bookingId) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            // Get the vendor_id for this user
            const VendorModel = (await import('../Models/VendorModel.js')).default;
            
            const vendorResult = await new Promise((resolve, reject) => {
                VendorModel.findVendorID(user_id, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (!vendorResult || vendorResult.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor authentication required. No vendor profile found.'
                });
            }

            const vendor_id = vendorResult[0].vendor_id;

            // Get booking details to verify access
            const booking = await BookingModel.getBookingById(bookingId);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            if (booking.vendor_id !== vendor_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You can only check attempts for your own bookings'
                });
            }

            const activeOTP = await OTPModel.getActiveOTP(bookingId);
            
            if (!activeOTP) {
                return res.status(404).json({
                    success: false,
                    message: 'No active OTP found for this booking'
                });
            }

            const attemptsRemaining = Math.max(0, 3 - activeOTP.attempts_count);
            const isLocked = activeOTP.is_locked && new Date() < new Date(activeOTP.locked_until);

            res.status(200).json({
                success: true,
                data: {
                    booking_id: bookingId,
                    attempts_remaining: attemptsRemaining,
                    is_locked: isLocked,
                    locked_until: activeOTP.locked_until,
                    expires_at: activeOTP.expires_at
                }
            });

        } catch (error) {
            console.error('Get remaining attempts error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get remaining attempts',
                error: error.message
            });
        }
    }

    // Get OTP history for booking (admin use)
    static async getOTPHistory(req, res) {
        try {
            const { bookingId } = req.params;
            const user_type = req.user?.user_type;

            // Only admin can access OTP history
            if (user_type !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            if (!bookingId) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            const otpHistory = await OTPModel.getOTPHistory(bookingId);

            res.status(200).json({
                success: true,
                data: {
                    booking_id: bookingId,
                    otp_history: otpHistory
                }
            });

        } catch (error) {
            console.error('Get OTP history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get OTP history',
                error: error.message
            });
        }
    }

    // Send OTP reminder to vendor
    static async sendOTPReminder(req, res) {
        try {
            const { booking_id } = req.body;

            if (!booking_id) {
                return res.status(400).json({
                    success: false,
                    message: 'booking_id is required'
                });
            }

            // Get booking details
            const booking = await BookingModel.getBookingById(booking_id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Check if there's an active OTP
            const activeOTP = await OTPModel.getActiveOTP(booking_id);
            if (!activeOTP) {
                return res.status(404).json({
                    success: false,
                    message: 'No active OTP found for this booking'
                });
            }

            // Send reminder notification to vendor
            await NotificationService.notifyOTPReminder({
                booking_id,
                vendor_id: booking.vendor_id,
                user_name: `${booking.first_name} ${booking.last_name}`,
                event_date: booking.event_date,
                expires_at: activeOTP.expires_at
            });

            res.status(200).json({
                success: true,
                message: 'OTP reminder sent to vendor'
            });

        } catch (error) {
            console.error('Send OTP reminder error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP reminder',
                error: error.message
            });
        }
    }
}

export default OTPController;