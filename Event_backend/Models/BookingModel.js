import db from "../Config/DatabaseCon.js";

class BookingModel {
    // Booking status constants
    static BOOKING_STATUS = {
        PENDING_VENDOR_RESPONSE: 'pending_vendor_response',
        ACCEPTED_BY_VENDOR_PENDING_ADMIN: 'accepted_by_vendor_pending_admin',
        APPROVED_BY_ADMIN_PENDING_OTP: 'approved_by_admin_pending_otp',
        OTP_VERIFICATION_IN_PROGRESS: 'otp_verification_in_progress',
        BOOKING_CONFIRMED: 'booking_confirmed',
        AWAITING_REVIEW: 'awaiting_review',
        COMPLETED: 'completed',
        CANCELLED_BY_USER: 'cancelled_by_user',
        CANCELLED_BY_VENDOR: 'cancelled_by_vendor',
        REJECTED_BY_ADMIN: 'rejected_by_admin'
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
            special_requirement
        } = bookingData;

        const sql = `
            INSERT INTO event_booking (
                booking_uuid, user_id, vendor_id, shift_id, package_id,
                event_address, event_date, event_time, special_requirement,
                status, admin_approval
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [
                booking_uuid, user_id, vendor_id, shift_id, package_id,
                event_address, event_date, event_time, special_requirement,
                this.BOOKING_STATUS.PENDING_VENDOR_RESPONSE
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
    static async updateBookingStatus(booking_id, status, updated_by, notes = null) {
        const sql = `
            UPDATE event_booking 
            SET status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?, status_notes = ?
            WHERE booking_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [status, updated_by, notes, booking_id], (err, result) => {
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

        if (booking.status !== this.BOOKING_STATUS.PENDING_VENDOR_RESPONSE) {
            throw new Error('Booking cannot be accepted in current status');
        }

        return await this.updateBookingStatus(
            booking_id, 
            this.BOOKING_STATUS.ACCEPTED_BY_VENDOR_PENDING_ADMIN, 
            `vendor_${vendor_id}`
        );
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
            this.BOOKING_STATUS.CANCELLED_BY_VENDOR, 
            `vendor_${vendor_id}`,
            reason
        );
    }

    // Admin approves booking
    static async adminApproveBooking(booking_id, admin_id) {
        const booking = await this.getBookingById(booking_id);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== this.BOOKING_STATUS.ACCEPTED_BY_VENDOR_PENDING_ADMIN) {
            throw new Error('Booking cannot be approved in current status');
        }

        // Update both status and admin_approval
        const sql = `
            UPDATE event_booking 
            SET status = ?, admin_approval = 'approved', updated_at = CURRENT_TIMESTAMP, updated_by = ?
            WHERE booking_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [
                this.BOOKING_STATUS.APPROVED_BY_ADMIN_PENDING_OTP, 
                `admin_${admin_id}`, 
                booking_id
            ], (err, result) => {
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

        if (booking.status !== this.BOOKING_STATUS.ACCEPTED_BY_VENDOR_PENDING_ADMIN) {
            throw new Error('Booking cannot be rejected in current status');
        }

        const sql = `
            UPDATE event_booking 
            SET status = ?, admin_approval = 'rejected', updated_at = CURRENT_TIMESTAMP, 
                updated_by = ?, status_notes = ?
            WHERE booking_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [
                this.BOOKING_STATUS.REJECTED_BY_ADMIN, 
                `admin_${admin_id}`, 
                reason,
                booking_id
            ], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }

    // Start OTP verification process
    static async startOTPVerification(booking_id) {
        const booking = await this.getBookingById(booking_id);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== this.BOOKING_STATUS.APPROVED_BY_ADMIN_PENDING_OTP) {
            throw new Error('OTP verification cannot be started in current status');
        }

        return await this.updateBookingStatus(
            booking_id, 
            this.BOOKING_STATUS.OTP_VERIFICATION_IN_PROGRESS, 
            'system'
        );
    }

    // Complete OTP verification
    static async completeOTPVerification(booking_id) {
        const booking = await this.getBookingById(booking_id);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== this.BOOKING_STATUS.OTP_VERIFICATION_IN_PROGRESS) {
            throw new Error('OTP verification cannot be completed in current status');
        }

        return await this.updateBookingStatus(
            booking_id, 
            this.BOOKING_STATUS.BOOKING_CONFIRMED, 
            'system'
        );
    }

    // Cancel booking (user or vendor)
    static async cancelBooking(booking_id, cancelled_by, user_type, reason = null) {
        const booking = await this.getBookingById(booking_id);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        // Check if booking can be cancelled
        const cancellableStatuses = [
            this.BOOKING_STATUS.PENDING_VENDOR_RESPONSE,
            this.BOOKING_STATUS.ACCEPTED_BY_VENDOR_PENDING_ADMIN,
            this.BOOKING_STATUS.APPROVED_BY_ADMIN_PENDING_OTP
        ];

        if (!cancellableStatuses.includes(booking.status)) {
            throw new Error('Booking cannot be cancelled in current status');
        }

        // Determine cancellation status based on who is cancelling
        let newStatus;
        if (user_type === 'user') {
            newStatus = this.BOOKING_STATUS.CANCELLED_BY_USER;
        } else if (user_type === 'vendor') {
            newStatus = this.BOOKING_STATUS.CANCELLED_BY_VENDOR;
        } else {
            throw new Error('Invalid user type for cancellation');
        }

        return await this.updateBookingStatus(
            booking_id, 
            newStatus, 
            `${user_type}_${cancelled_by}`,
            reason
        );
    }

    // Mark booking as awaiting review (after completion)
    static async markAwaitingReview(booking_id) {
        const booking = await this.getBookingById(booking_id);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== this.BOOKING_STATUS.BOOKING_CONFIRMED) {
            throw new Error('Only confirmed bookings can be marked as awaiting review');
        }

        return await this.updateBookingStatus(
            booking_id, 
            this.BOOKING_STATUS.AWAITING_REVIEW, 
            'system'
        );
    }

    // Complete booking (after review)
    static async completeBooking(booking_id) {
        const booking = await this.getBookingById(booking_id);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== this.BOOKING_STATUS.AWAITING_REVIEW) {
            throw new Error('Only bookings awaiting review can be completed');
        }

        return await this.updateBookingStatus(
            booking_id, 
            this.BOOKING_STATUS.COMPLETED, 
            'system'
        );
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