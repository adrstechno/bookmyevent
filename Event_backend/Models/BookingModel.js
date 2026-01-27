import db from "../Config/DatabaseCon.js";

class BookingModel {
    // Booking status constants (using original shorter values for compatibility)
    static BOOKING_STATUS = {
        PENDING_VENDOR_RESPONSE: 'pending',
        ACCEPTED_BY_VENDOR_PENDING_ADMIN: 'confirmed',
        APPROVED_BY_ADMIN_PENDING_OTP: 'confirmed',
        OTP_VERIFICATION_IN_PROGRESS: 'confirmed',
        BOOKING_CONFIRMED: 'confirmed',
        AWAITING_REVIEW: 'completed',
        COMPLETED: 'completed',
        CANCELLED_BY_USER: 'cancelled',
        CANCELLED_BY_VENDOR: 'cancelled',
        REJECTED_BY_ADMIN: 'cancelled'
    };

    // Create new booking
    static async createBooking(bookingData) {
        const {
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
        } = bookingData;

        const sql = `
            INSERT INTO event_booking (
                booking_uuid, user_id, vendor_id, shift_id, package_id,
                event_address, event_date, event_time, special_requirement,
                event_latitude, event_longitude, status, admin_approval
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [
                booking_uuid, user_id, vendor_id, shift_id, package_id,
                event_address, event_date, event_time, special_requirement,
                event_latitude, event_longitude, 'pending'
            ], (err, result) => {
                if (err) reject(err);
                else resolve({ booking_id: result.insertId, booking_uuid });
            });
        });
    }

    // Get booking by ID
    static async getBookingById(booking_id) {
        const sql = `
            SELECT eb.*, vp.business_name, vp.contact as vendor_contact,
                   vs.shift_name, vs.start_time, vs.end_time,
                   vpack.package_name, vpack.amount, vpack.package_desc,
                   u.first_name, u.last_name, u.email, u.phone
            FROM event_booking eb
            LEFT JOIN vendor_profiles vp ON eb.vendor_id = vp.vendor_id
            LEFT JOIN vendor_shifts vs ON eb.shift_id = vs.shift_id
            LEFT JOIN vendor_packages vpack ON eb.package_id = vpack.package_id
            LEFT JOIN users u ON eb.user_id = u.uuid
            WHERE eb.booking_id = ? AND eb.removed_at IS NULL
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [booking_id], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    // Get booking by UUID
    static async getBookingByUUID(booking_uuid) {
        const sql = `
            SELECT eb.*, vp.business_name, vp.contact as vendor_contact,
                   vs.shift_name, vs.start_time, vs.end_time,
                   vpack.package_name, vpack.amount, vpack.package_desc,
                   u.first_name, u.last_name, u.email, u.phone
            FROM event_booking eb
            LEFT JOIN vendor_profiles vp ON eb.vendor_id = vp.vendor_id
            LEFT JOIN vendor_shifts vs ON eb.shift_id = vs.shift_id
            LEFT JOIN vendor_packages vpack ON eb.package_id = vpack.package_id
            LEFT JOIN users u ON eb.user_id = u.uuid
            WHERE eb.booking_uuid = ? AND eb.removed_at IS NULL
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [booking_uuid], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    // Update booking status
    static async updateBookingStatus(booking_id, status) {
        const sql = `
            UPDATE event_booking 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [status, booking_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }

    // Vendor accepts booking
    static async vendorAcceptBooking(booking_id, vendor_id) {
        const booking = await this.getBookingById(booking_id);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.vendor_id !== vendor_id) {
            throw new Error('Unauthorized: You can only accept your own bookings');
        }

        if (booking.status !== 'pending') {
            throw new Error('Booking cannot be accepted in current status');
        }

        // Update both status and admin_approval for vendor acceptance
        const sql = `
            UPDATE event_booking 
            SET status = 'confirmed', admin_approval = 'pending', updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [booking_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }

    // Vendor rejects booking
    static async vendorRejectBooking(booking_id, vendor_id, reason = null) {
        const booking = await this.getBookingById(booking_id);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.vendor_id !== vendor_id) {
            throw new Error('Unauthorized: You can only reject your own bookings');
        }

        if (booking.status !== this.BOOKING_STATUS.PENDING_VENDOR_RESPONSE) {
            throw new Error('Booking cannot be rejected in current status');
        }

        return await this.updateBookingStatus(
            booking_id, 
            this.BOOKING_STATUS.CANCELLED_BY_VENDOR
        );
    }

    // Admin approves booking
    static async adminApproveBooking(booking_id, admin_id) {
        const booking = await this.getBookingById(booking_id);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== 'confirmed' || booking.admin_approval !== 'pending') {
            throw new Error('Booking cannot be approved in current status');
        }

        // Update admin_approval to approved
        const sql = `
            UPDATE event_booking 
            SET admin_approval = 'approved', updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [booking_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }

    // Admin rejects booking
    static async adminRejectBooking(booking_id, admin_id, reason = null) {
        const booking = await this.getBookingById(booking_id);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== 'confirmed' || booking.admin_approval !== 'pending') {
            throw new Error('Booking cannot be rejected in current status');
        }

        const sql = `
            UPDATE event_booking 
            SET status = 'cancelled', admin_approval = 'rejected', updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [booking_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }

    // Start OTP verification process
    static async startOTPVerification(booking_id) {
        // For simplicity, just return true since status is already 'confirmed'
        return true;
    }

    // Complete OTP verification
    static async completeOTPVerification(booking_id) {
        // Mark booking as completed after OTP verification
        const sql = `
            UPDATE event_booking 
            SET status = 'completed', updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [booking_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }

    // Cancel booking (user or vendor)
    static async cancelBooking(booking_id, cancelled_by, user_type, reason = null) {
        const booking = await this.getBookingById(booking_id);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        // Check if booking can be cancelled
        const cancellableStatuses = ['pending', 'confirmed'];

        if (!cancellableStatuses.includes(booking.status)) {
            throw new Error('Booking cannot be cancelled in current status');
        }

        return await this.updateBookingStatus(booking_id, 'cancelled');
    }

    // Mark booking as awaiting review (after completion)
    static async markAwaitingReview(booking_id) {
        const booking = await this.getBookingById(booking_id);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== 'confirmed') {
            throw new Error('Only confirmed bookings can be marked as awaiting review');
        }

        return await this.updateBookingStatus(booking_id, 'completed');
    }

    // Complete booking (after review)
    static async completeBooking(booking_id) {
        return await this.updateBookingStatus(booking_id, 'completed');
    }

    // Get bookings by user
    static async getBookingsByUser(user_id, options = {}) {
        const { page = 1, limit = 20, status } = options;
        const offset = (page - 1) * limit;
        
        let whereConditions = ['eb.user_id = ?', 'eb.removed_at IS NULL'];
        let params = [user_id];
        
        if (status) {
            whereConditions.push('eb.status = ?');
            params.push(status);
        }
        
        const whereClause = whereConditions.join(' AND ');
        
        const sql = `
            SELECT eb.*, vp.business_name, vp.contact as vendor_contact,
                   vs.shift_name, vpack.package_name, vpack.amount
            FROM event_booking eb
            LEFT JOIN vendor_profiles vp ON eb.vendor_id = vp.vendor_id
            LEFT JOIN vendor_shifts vs ON eb.shift_id = vs.shift_id
            LEFT JOIN vendor_packages vpack ON eb.package_id = vpack.package_id
            WHERE ${whereClause}
            ORDER BY eb.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        params.push(limit, offset);
        
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    // Get bookings by vendor
    static async getBookingsByVendor(vendor_id, options = {}) {
        const { page = 1, limit = 20, status } = options;
        const offset = (page - 1) * limit;
        
        let whereConditions = ['eb.vendor_id = ?', 'eb.removed_at IS NULL'];
        let params = [vendor_id];
        
        if (status) {
            whereConditions.push('eb.status = ?');
            params.push(status);
        }
        
        const whereClause = whereConditions.join(' AND ');
        
        const sql = `
            SELECT eb.*, u.first_name, u.last_name, u.email, u.phone,
                   vs.shift_name, vpack.package_name, vpack.amount
            FROM event_booking eb
            LEFT JOIN users u ON eb.user_id = u.uuid
            LEFT JOIN vendor_shifts vs ON eb.shift_id = vs.shift_id
            LEFT JOIN vendor_packages vpack ON eb.package_id = vpack.package_id
            WHERE ${whereClause}
            ORDER BY eb.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        params.push(limit, offset);
        
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    // Get all bookings (admin view)
    static async getAllBookings(options = {}) {
        const { page = 1, limit = 20, status, admin_approval } = options;
        const offset = (page - 1) * limit;
        
        let whereConditions = ['eb.removed_at IS NULL'];
        let params = [];
        
        if (status) {
            whereConditions.push('eb.status = ?');
            params.push(status);
        }
        
        if (admin_approval) {
            whereConditions.push('eb.admin_approval = ?');
            params.push(admin_approval);
        }
        
        const whereClause = whereConditions.join(' AND ');
        
        const sql = `
            SELECT eb.*, u.first_name, u.last_name, u.email, u.phone,
                   vp.business_name, vp.contact as vendor_contact,
                   vs.shift_name, vpack.package_name, vpack.amount
            FROM event_booking eb
            LEFT JOIN users u ON eb.user_id = u.uuid
            LEFT JOIN vendor_profiles vp ON eb.vendor_id = vp.vendor_id
            LEFT JOIN vendor_shifts vs ON eb.shift_id = vs.shift_id
            LEFT JOIN vendor_packages vpack ON eb.package_id = vpack.package_id
            WHERE ${whereClause}
            ORDER BY eb.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        params.push(limit, offset);
        
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    // Get booking status history (for tracking)
    static async getBookingStatusHistory(booking_id) {
        // This would require a separate status_history table in a production system
        // For now, we'll return the current booking with timestamps
        return await this.getBookingById(booking_id);
    }
}

export default BookingModel;