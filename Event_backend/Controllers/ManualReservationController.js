import db from "../Config/DatabaseCon.js";

class ManualReservationController {
    // Create manual reservation (Admin/Vendor only)
    static async createReservation(req, res) {
        try {
            const { vendor_id, shift_id, event_date, reason, reserved_by_type } = req.body;
            const user_id = req.user?.user_id || req.user?.uuid;
            const user_type = req.user?.user_type;

            // Check authorization
            if (user_type !== 'admin' && user_type !== 'vendor') {
                return res.status(403).json({
                    success: false,
                    message: 'Only admin or vendor can create manual reservations'
                });
            }

            // If vendor, verify they can only reserve their own shifts
            if (user_type === 'vendor' && req.user?.vendor_id !== parseInt(vendor_id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Vendors can only reserve their own shifts'
                });
            }

            // Validate required fields
            if (!vendor_id || !shift_id || !event_date) {
                return res.status(400).json({
                    success: false,
                    message: 'vendor_id, shift_id, and event_date are required'
                });
            }

            // Check if shift is already booked (regular booking or manual reservation)
            const checkQuery = `
                SELECT 'booking' as type, booking_id as id FROM event_booking
                WHERE vendor_id = ? 
                AND shift_id = ? 
                AND event_date = ? 
                AND status NOT IN ('cancelled')
                AND removed_at IS NULL
                UNION
                SELECT 'reservation' as type, reservation_id as id FROM manual_reservations
                WHERE vendor_id = ?
                AND shift_id = ?
                AND event_date = ?
                AND status = 'active'
            `;

            db.query(checkQuery, [vendor_id, shift_id, event_date, vendor_id, shift_id, event_date], (checkErr, checkResults) => {
                if (checkErr) {
                    console.error('Error checking existing bookings:', checkErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to check existing bookings',
                        error: checkErr.message
                    });
                }

                if (checkResults.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'This shift is already booked for the selected date'
                    });
                }

                // Create manual reservation
                const insertQuery = `
                    INSERT INTO manual_reservations 
                    (vendor_id, shift_id, event_date, reason, reserved_by, reserved_by_type, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'active')
                `;

                db.query(insertQuery, [
                    vendor_id, 
                    shift_id, 
                    event_date, 
                    reason || 'Manual reservation', 
                    user_id,
                    reserved_by_type || user_type
                ], (insertErr, result) => {
                    if (insertErr) {
                        console.error('Error creating reservation:', insertErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to create reservation',
                            error: insertErr.message
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: 'Shift reserved successfully',
                        data: {
                            reservation_id: result.insertId,
                            vendor_id,
                            shift_id,
                            event_date,
                            status: 'active'
                        }
                    });
                });
            });

        } catch (error) {
            console.error('Create reservation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create reservation',
                error: error.message
            });
        }
    }

    // Get all reservations for a vendor
    static async getVendorReservations(req, res) {
        try {
            const { vendor_id } = req.params;
            const { month, year } = req.query;

            if (!vendor_id) {
                return res.status(400).json({
                    success: false,
                    message: 'vendor_id is required'
                });
            }

            let query = `
                SELECT mr.*, vs.shift_name, vs.start_time, vs.end_time
                FROM manual_reservations mr
                LEFT JOIN vendor_shifts vs ON mr.shift_id = vs.shift_id
                WHERE mr.vendor_id = ? AND mr.status = 'active'
            `;
            const params = [vendor_id];

            if (month && year) {
                query += ` AND MONTH(mr.event_date) = ? AND YEAR(mr.event_date) = ?`;
                params.push(month, year);
            }

            query += ` ORDER BY mr.event_date ASC`;

            db.query(query, params, (err, results) => {
                if (err) {
                    console.error('Error fetching reservations:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch reservations',
                        error: err.message
                    });
                }

                res.status(200).json({
                    success: true,
                    data: results
                });
            });

        } catch (error) {
            console.error('Get reservations error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch reservations',
                error: error.message
            });
        }
    }

    // Cancel/Remove reservation
    static async cancelReservation(req, res) {
        try {
            const { id } = req.params;
            const user_type = req.user?.user_type;

            if (user_type !== 'admin' && user_type !== 'vendor') {
                return res.status(403).json({
                    success: false,
                    message: 'Only admin or vendor can cancel reservations'
                });
            }

            const query = `
                UPDATE manual_reservations 
                SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
                WHERE reservation_id = ?
            `;

            db.query(query, [id], (err, result) => {
                if (err) {
                    console.error('Error cancelling reservation:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to cancel reservation',
                        error: err.message
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Reservation not found'
                    });
                }

                res.status(200).json({
                    success: true,
                    message: 'Reservation cancelled successfully'
                });
            });

        } catch (error) {
            console.error('Cancel reservation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel reservation',
                error: error.message
            });
        }
    }
}

export default ManualReservationController;