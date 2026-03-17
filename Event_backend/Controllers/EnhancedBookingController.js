import BookingModel from "../Models/BookingModel.js";
import OTPModel from "../Models/OTPModel.js";
import NotificationService from "../Services/NotificationService.js";
import EmailService from "../Services/emailService.js";
import db from "../Config/DatabaseCon.js";
import VendorModel from "../Models/VendorModel.js";
import ReviewTokenService from "../Utils/reviewToken.js";
import { v4 as uuidv4 } from 'uuid';

class EnhancedBookingController {
    // Create new booking with comprehensive notifications
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

            // Send comprehensive notifications to all parties
            try {
                // Get user details for notification
                const userQuery = `SELECT first_name, last_name, email, phone FROM users WHERE uuid = ?`;
                const userResult = await new Promise((resolve, reject) => {
                    db.query(userQuery, [user_id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                // Get vendor details for email notification
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

                // 1. Send in-app notification to vendor
                await NotificationService.notifyBookingCreated({
                    booking_id: result.booking_id,
                    user_name: userName,
                    vendor_id: vendor_id,
                    event_date: event_date,
                    package_name: packageName
                });

                // 2. Send notification to admin about new booking
                await NotificationService.notifyAdminNewBooking({
                    booking_id: result.booking_id,
                    user_name: userName,
                    vendor_name: vendorName,
                    vendor_id: vendor_id,
                    event_date: event_date,
                    package_name: packageName,
                    amount: amount
                });

                // 3. Send email notification to vendor
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
                    console.log('✅ Vendor booking notification email sent to:', vendor.email);
                }

                // 4. Send confirmation email to user
                if (user && user.email) {
                    await EmailService.sendUserBookingConfirmation({
                        userEmail: user.email,
                        userName: userName,
                        vendorName: vendorName,
                        packageName: packageName,
                        eventDate: event_date,
                        eventTime: event_time,
                        amount: amount,
                        bookingId: result.booking_id,
                        bookingUuid: booking_uuid
                    });
                    console.log('✅ User booking confirmation email sent to:', user.email);
                }

                // 5. Send notification email to admin
                await EmailService.sendAdminBookingNotification({
                    userName: userName,
                    userEmail: user ? user.email : 'N/A',
                    vendorName: vendorName,
                    vendorEmail: vendor ? vendor.email : 'N/A',
                    packageName: packageName,
                    eventDate: event_date,
                    eventTime: event_time,
                    amount: amount,
                    bookingId: result.booking_id,
                    bookingUuid: booking_uuid
                });
                console.log('✅ Admin booking notification email sent');

            } catch (notificationError) {
                console.error('❌ Error sending booking notifications:', notificationError);
                // Don't fail the booking if notification fails
            }

            res.status(201).json({
                success: true,
                message: 'Booking created successfully. Notifications sent to all parties.',
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

    // Vendor accepts booking - enhanced with admin notifications
    static async acceptBooking(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user?.uuid || req.user?.user_id;

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

            // Get vendor_id
            let vendor_id = req.user?.vendor_id;
            if (!vendor_id) {
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
                vendor_id = vendorResult[0].vendor_id;
            }

            // Accept the booking
            const result = await BookingModel.acceptBooking(id, vendor_id);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found or already processed'
                });
            }

            // Send comprehensive notifications
            try {
                // Get booking details for notifications
                const bookingQuery = `
                    SELECT b.*, u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email,
                           v.first_name as vendor_first_name, v.last_name as vendor_last_name, v.email as vendor_email,
                           vp.package_name, vp.amount
                    FROM bookings b
                    JOIN users u ON b.user_id = u.uuid
                    JOIN vendor_profiles vpr ON b.vendor_id = vpr.vendor_id
                    JOIN users v ON vpr.user_id = v.user_id
                    LEFT JOIN vendor_packages vp ON b.package_id = vp.package_id
                    WHERE b.booking_id = ?
                `;
                
                const bookingResult = await new Promise((resolve, reject) => {
                    db.query(bookingQuery, [id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                if (bookingResult && bookingResult.length > 0) {
                    const booking = bookingResult[0];
                    const userName = `${booking.user_first_name} ${booking.user_last_name}`;
                    const vendorName = `${booking.vendor_first_name} ${booking.vendor_last_name}`;

                    // Send notifications to user, vendor, and admin
                    await NotificationService.notifyBookingAccepted({
                        booking_id: id,
                        user_id: booking.user_id,
                        vendor_name: vendorName,
                        user_name: userName,
                        event_date: booking.event_date,
                        package_name: booking.package_name || 'Package'
                    });

                    // Send email notifications
                    if (booking.user_email) {
                        await EmailService.sendUserBookingAcceptedNotification({
                            userEmail: booking.user_email,
                            userName: userName,
                            vendorName: vendorName,
                            packageName: booking.package_name || 'Package',
                            eventDate: booking.event_date,
                            bookingId: id
                        });
                        console.log('✅ User booking accepted email sent to:', booking.user_email);
                    }

                    // Send admin notification email
                    await EmailService.sendAdminBookingAcceptedNotification({
                        userName: userName,
                        vendorName: vendorName,
                        packageName: booking.package_name || 'Package',
                        eventDate: booking.event_date,
                        amount: booking.amount || 'N/A',
                        bookingId: id
                    });
                    console.log('✅ Admin booking accepted notification sent');
                }

            } catch (notificationError) {
                console.error('❌ Error sending booking acceptance notifications:', notificationError);
            }

            res.json({
                success: true,
                message: 'Booking accepted successfully. Awaiting admin approval.',
                data: { booking_id: id, status: 'accepted' }
            });

        } catch (error) {
            console.error('Accept booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to accept booking',
                error: error.message
            });
        }
    }

    // Admin approves booking - enhanced with comprehensive notifications
    static async approveBooking(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user?.uuid || req.user?.user_id;

            if (!user_id) {
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

            // Approve the booking
            const result = await BookingModel.approveBooking(id);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found or already processed'
                });
            }

            // Send comprehensive notifications
            try {
                // Get booking details for notifications
                const bookingQuery = `
                    SELECT b.*, u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email,
                           v.first_name as vendor_first_name, v.last_name as vendor_last_name, v.email as vendor_email,
                           vp.package_name, vp.amount
                    FROM bookings b
                    JOIN users u ON b.user_id = u.uuid
                    JOIN vendor_profiles vpr ON b.vendor_id = vpr.vendor_id
                    JOIN users v ON vpr.user_id = v.user_id
                    LEFT JOIN vendor_packages vp ON b.package_id = vp.package_id
                    WHERE b.booking_id = ?
                `;
                
                const bookingResult = await new Promise((resolve, reject) => {
                    db.query(bookingQuery, [id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                if (bookingResult && bookingResult.length > 0) {
                    const booking = bookingResult[0];
                    const userName = `${booking.user_first_name} ${booking.user_last_name}`;
                    const vendorName = `${booking.vendor_first_name} ${booking.vendor_last_name}`;

                    // Send notifications to user and vendor
                    await NotificationService.notifyBookingApproved({
                        booking_id: id,
                        user_id: booking.user_id,
                        vendor_id: booking.vendor_id,
                        vendor_name: vendorName,
                        event_date: booking.event_date,
                        package_name: booking.package_name || 'Package'
                    });

                    // Send email notifications to user
                    if (booking.user_email) {
                        await EmailService.sendUserBookingApprovedNotification({
                            userEmail: booking.user_email,
                            userName: userName,
                            vendorName: vendorName,
                            packageName: booking.package_name || 'Package',
                            eventDate: booking.event_date,
                            eventTime: booking.event_time,
                            amount: booking.amount || 'N/A',
                            bookingId: id
                        });
                        console.log('✅ User booking approved email sent to:', booking.user_email);
                    }

                    // Send email notification to vendor
                    if (booking.vendor_email) {
                        await EmailService.sendVendorBookingApprovalNotification({
                            vendorEmail: booking.vendor_email,
                            vendorName: vendorName,
                            userName: userName,
                            packageName: booking.package_name || 'Package',
                            eventDate: booking.event_date,
                            eventTime: booking.event_time,
                            amount: booking.amount || 'N/A',
                            bookingId: id
                        });
                        console.log('✅ Vendor booking approved email sent to:', booking.vendor_email);
                    }
                }

            } catch (notificationError) {
                console.error('❌ Error sending booking approval notifications:', notificationError);
            }

            res.json({
                success: true,
                message: 'Booking approved successfully. All parties have been notified.',
                data: { booking_id: id, status: 'approved' }
            });

        } catch (error) {
            console.error('Approve booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to approve booking',
                error: error.message
            });
        }
    }
}

export default EnhancedBookingController;