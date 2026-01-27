import BookingModel from "../Models/BookingModel.js";
import OTPModel from "../Models/OTPModel.js";
import NotificationService from "../Services/NotificationService.js";
import EmailService from "../Services/emailService.js";
import GeocodingService from "../Services/GeocodingService.js";
import db from "../Config/DatabaseCon.js";
import VendorModel from "../Models/VendorModel.js";
import ReviewTokenService from "../Utils/reviewToken.js";
import { v4 as uuidv4 } from 'uuid';

class BookingController {
    // Create new booking with coordinate support and improved vendor notifications
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

            // If coordinates are provided but no address, try reverse geocoding
            let finalAddress = event_address;
            if (event_latitude && event_longitude && (!event_address || event_address.includes('Lat:'))) {
                try {
                    const geocodeResult = await GeocodingService.reverseGeocode(event_latitude, event_longitude);
                    if (geocodeResult.success) {
                        finalAddress = geocodeResult.address;
                        console.log('✅ Address resolved from coordinates:', finalAddress);
                    }
                } catch (geocodeError) {
                    console.log('⚠️ Reverse geocoding failed, using provided address:', geocodeError.message);
                }
            }

            // Generate booking UUID
            const booking_uuid = uuidv4();

            const bookingData = {
                booking_uuid,
                user_id,
                vendor_id,
                shift_id,
                package_id,
                event_address: finalAddress,
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

                // Get vendor details for email notification - IMPROVED QUERY
                const vendorQuery = `
                    SELECT u.first_name, u.last_name, u.email, u.phone, vp.vendor_id, vp.business_name, vp.contact
                    FROM vendor_profiles vp 
                    JOIN users u ON vp.user_id = u.user_id 
                    WHERE vp.vendor_id = ? AND u.is_active = 1
                `;
                const vendorResult = await new Promise((resolve, reject) => {
                    db.query(vendorQuery, [vendor_id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                console.log('🔍 Vendor lookup for vendor_id:', vendor_id);
                console.log('📧 Vendor query result:', vendorResult);

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

                // Send email notification to vendor with improved error handling
                if (vendor && vendor.email) {
                    try {
                        await EmailService.sendVendorBookingNotification({
                            vendorEmail: vendor.email,
                            vendorName: vendor.business_name || vendorName,
                            userName: userName,
                            userEmail: user ? user.email : 'N/A',
                            userPhone: user ? user.phone : 'N/A',
                            packageName: packageName,
                            eventDate: event_date,
                            eventTime: event_time,
                            amount: amount,
                            bookingId: result.booking_id,
                            bookingUuid: booking_uuid,
                            eventAddress: finalAddress
                        });
                        console.log('✅ Vendor booking notification email sent to:', vendor.email);
                    } catch (emailError) {
                        console.error('❌ Failed to send vendor booking notification email:', emailError);
                        // Log more details for debugging
                        console.error('Email service error details:', {
                            vendorEmail: vendor.email,
                            emailError: emailError.message
                        });
                    }
                } else {
                    console.log('⚠️ Vendor email notification skipped:', {
                        vendorFound: !!vendor,
                        vendorEmail: vendor?.email,
                        vendor_id: vendor_id,
                        vendorQueryResult: vendorResult
                    });
                }

            } catch (notificationError) {
                console.error('❌ Error sending booking notification:', notificationError);
                // Don't fail the booking if notification fails
            }

            res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: {
                    booking_id: result.booking_id,
                    booking_uuid: result.booking_uuid,
                    status: 'pending',
                    event_address: finalAddress
                }
            });

        } catch (error) {
            console.error('❌ Create booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create booking',
                error: error.message
            });
        }
    }

    // Test endpoint to check vendor email lookup
    static async testVendorLookup(req, res) {
        try {
            const { vendor_id } = req.params;
            
            const vendorQuery = `
                SELECT u.first_name, u.last_name, u.email, u.phone, vp.vendor_id, vp.business_name, vp.contact
                FROM vendor_profiles vp 
                JOIN users u ON vp.user_id = u.user_id 
                WHERE vp.vendor_id = ? AND u.is_active = 1
            `;
            
            const vendorResult = await new Promise((resolve, reject) => {
                db.query(vendorQuery, [vendor_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            res.json({
                success: true,
                vendor_id: vendor_id,
                result: vendorResult,
                found: vendorResult.length > 0
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

export default BookingController;