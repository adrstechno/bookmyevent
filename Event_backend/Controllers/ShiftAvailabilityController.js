import db from "../Config/DatabaseCon.js";

class ShiftAvailabilityController {
    // Get available shifts for a vendor on a specific date
    static async getAvailableShifts(req, res) {
        try {
            const { vendor_id, event_date } = req.query;

            if (!vendor_id || !event_date) {
                return res.status(400).json({
                    success: false,
                    message: 'vendor_id and event_date are required'
                });
            }

            // Get all shifts for the vendor
            const shiftsQuery = `
                SELECT shift_id, shift_name, start_time, end_time, days_of_week
                FROM vendor_shifts
                WHERE vendor_id = ? AND is_active = TRUE
            `;

            db.query(shiftsQuery, [vendor_id], (err, shifts) => {
                if (err) {
                    console.error('Error fetching shifts:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch shifts',
                        error: err.message
                    });
                }

                if (shifts.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'No shifts found for this vendor'
                    });
                }

                // Check which shifts are already booked for this date (including manual reservations)
                const bookingsQuery = `
                    SELECT shift_id FROM event_booking
                    WHERE vendor_id = ? 
                    AND event_date = ? 
                    AND status NOT IN ('cancelled')
                    AND removed_at IS NULL
                    UNION
                    SELECT shift_id FROM manual_reservations
                    WHERE vendor_id = ?
                    AND event_date = ?
                    AND status = 'active'
                `;

                db.query(bookingsQuery, [vendor_id, event_date, vendor_id, event_date], (bookErr, bookedShifts) => {
                    if (bookErr) {
                        console.error('Error fetching bookings:', bookErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to check bookings',
                            error: bookErr.message
                        });
                    }

                    // Create a set of booked shift IDs
                    const bookedShiftIds = new Set(bookedShifts.map(b => b.shift_id));

                    // Filter available shifts
                    const availableShifts = shifts.filter(shift => !bookedShiftIds.has(shift.shift_id));

                    // Check if all shifts are booked
                    if (availableShifts.length === 0) {
                        return res.status(200).json({
                            success: true,
                            message: 'This vendor is fully booked for the selected date. Please choose another date or vendor.',
                            available: false,
                            availableShifts: [],
                            totalShifts: shifts.length,
                            bookedShifts: shifts.length
                        });
                    }

                    // Return available shifts
                    res.status(200).json({
                        success: true,
                        message: 'Available shifts retrieved successfully',
                        available: true,
                        availableShifts: availableShifts.map(shift => ({
                            shift_id: shift.shift_id,
                            shift_name: shift.shift_name,
                            start_time: shift.start_time,
                            end_time: shift.end_time,
                            time_display: `${shift.start_time.substring(0, 5)} - ${shift.end_time.substring(0, 5)}`
                        })),
                        totalShifts: shifts.length,
                        bookedShifts: bookedShiftIds.size,
                        availableCount: availableShifts.length
                    });
                });
            });

        } catch (error) {
            console.error('Get available shifts error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get available shifts',
                error: error.message
            });
        }
    }

    // Check if a specific shift is available
    static async checkShiftAvailability(req, res) {
        try {
            const { vendor_id, event_date, shift_id } = req.query;

            if (!vendor_id || !event_date || !shift_id) {
                return res.status(400).json({
                    success: false,
                    message: 'vendor_id, event_date, and shift_id are required'
                });
            }

            const query = `
                SELECT 
                    (SELECT COUNT(*) FROM event_booking
                     WHERE vendor_id = ? AND event_date = ? AND shift_id = ?
                     AND status NOT IN ('cancelled') AND removed_at IS NULL) +
                    (SELECT COUNT(*) FROM manual_reservations
                     WHERE vendor_id = ? AND event_date = ? AND shift_id = ?
                     AND status = 'active') as booking_count
            `;

            db.query(query, [vendor_id, event_date, shift_id, vendor_id, event_date, shift_id], (err, results) => {
                if (err) {
                    console.error('Error checking shift availability:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to check shift availability',
                        error: err.message
                    });
                }

                const isAvailable = results[0].booking_count === 0;

                res.status(200).json({
                    success: true,
                    available: isAvailable,
                    message: isAvailable 
                        ? 'This shift is available for booking' 
                        : 'This shift is already booked for the selected date'
                });
            });

        } catch (error) {
            console.error('Check shift availability error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check shift availability',
                error: error.message
            });
        }
    }

    // Get vendor availability calendar (shows booked dates)
    static async getVendorCalendar(req, res) {
        try {
            const { vendor_id, month, year } = req.query;

            if (!vendor_id || !month || !year) {
                return res.status(400).json({
                    success: false,
                    message: 'vendor_id, month, and year are required'
                });
            }

            // Get all bookings for the vendor in the specified month (including manual reservations)
            const query = `
                SELECT 
                    event_date,
                    COUNT(*) as bookings_count,
                    GROUP_CONCAT(shift_id) as booked_shift_ids
                FROM (
                    SELECT event_date, shift_id FROM event_booking
                    WHERE vendor_id = ? 
                    AND MONTH(event_date) = ?
                    AND YEAR(event_date) = ?
                    AND status NOT IN ('cancelled')
                    AND removed_at IS NULL
                    UNION ALL
                    SELECT event_date, shift_id FROM manual_reservations
                    WHERE vendor_id = ?
                    AND MONTH(event_date) = ?
                    AND YEAR(event_date) = ?
                    AND status = 'active'
                ) as all_bookings
                GROUP BY event_date
            `;

            db.query(query, [vendor_id, month, year, vendor_id, month, year], (err, bookings) => {
                if (err) {
                    console.error('Error fetching calendar:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch calendar',
                        error: err.message
                    });
                }

                // Get total shifts count for the vendor
                const shiftsQuery = `
                    SELECT COUNT(*) as total_shifts
                    FROM vendor_shifts
                    WHERE vendor_id = ? AND is_active = TRUE
                `;

                db.query(shiftsQuery, [vendor_id], (shiftErr, shiftResults) => {
                    if (shiftErr) {
                        console.error('Error fetching shifts count:', shiftErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to fetch shifts count',
                            error: shiftErr.message
                        });
                    }

                    const totalShifts = shiftResults[0].total_shifts;

                    // Format the calendar data
                    const calendar = bookings.map(booking => ({
                        date: booking.event_date,
                        bookings_count: booking.bookings_count,
                        total_shifts: totalShifts,
                        is_fully_booked: booking.bookings_count >= totalShifts,
                        availability_status: booking.bookings_count >= totalShifts 
                            ? 'fully_booked' 
                            : 'partially_available'
                    }));

                    res.status(200).json({
                        success: true,
                        message: 'Calendar retrieved successfully',
                        calendar,
                        month: parseInt(month),
                        year: parseInt(year)
                    });
                });
            });

        } catch (error) {
            console.error('Get vendor calendar error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get vendor calendar',
                error: error.message
            });
        }
    }
}

export default ShiftAvailabilityController;