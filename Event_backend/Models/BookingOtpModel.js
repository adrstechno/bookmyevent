import db from "../Config/DatabaseCon.js";

class BookingOtpModel {
    static createOtp(data, callback) {
        const sql = `
        INSERT INTO booking_otp
            (booking_id, user_id, vendor_id, otp, expires_at, generated_by)
            VALUES(?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.booking_id,
            data.user_id || null,
            data.vendor_id || null,
            data.otp,
            data.expires_at || null,
            data.generated_by || null,
        ];
        db.query(sql, values, callback);
    }

    static findValidOtp(booking_id, otp, callback) {
        const sql = `
        SELECT * FROM booking_otp
        WHERE booking_id = ?
        AND otp = ?
        AND is_used = 0
        AND (expires_at IS NULL OR expires_at > NOW())
        LIMIT 1
        `;
        db.query(sql, [booking_id, otp], callback);
    }

    static markOtpUsed(id, callback) {
        const sql = `UPDATE booking_otp SET is_used = 1 WHERE id = ?`;
        db.query(sql, [id], callback);
    }


}

export default BookingOtpModel;