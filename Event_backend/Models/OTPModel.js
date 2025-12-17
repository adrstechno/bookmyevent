import db from "../Config/DatabaseCon.js";
import crypto from "crypto";

class OTPModel {
    // Generate secure 6-digit OTP
    static generateOTP() {
        return crypto.randomInt(100000, 999999).toString();
    }

    // Create OTP for booking
    static async createOTP(bookingId, userId, vendorId, generatedBy = 'vendor') {
        // First, invalidate any existing active OTPs for this booking
        await this.invalidateExistingOTPs(bookingId);
        
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        
        const sql = `
            INSERT INTO booking_otp (booking_id, user_id, vendor_id, otp, expires_at, generated_by, is_used)
            VALUES (?, ?, ?, ?, ?, ?, FALSE)
        `;
        
        return new Promise((resolve, reject) => {
            db.query(sql, [bookingId, userId, vendorId, otp, expiresAt, generatedBy], (err, result) => {
                if (err) reject(err);
                else resolve({ id: result.insertId, otp, expiresAt });
            });
        });
    }

    // Verify OTP
    static async verifyOTP(bookingId, otpCode, vendorId) {
        // Get the active OTP record
        const otpRecord = await this.getActiveOTP(bookingId);
        
        if (!otpRecord) {
            return { success: false, message: 'No active OTP found for this booking' };
        }

        // Check if OTP has expired
        if (otpRecord.expires_at && new Date() > new Date(otpRecord.expires_at)) {
            return { success: false, message: 'OTP has expired', isExpired: true };
        }

        // Check if OTP has already been used
        if (otpRecord.is_used) {
            return { success: false, message: 'OTP has already been used' };
        }

        // Verify the OTP code
        if (otpRecord.otp !== otpCode) {
            return { 
                success: false, 
                message: 'Invalid OTP code',
                attemptsRemaining: 2
            };
        }

        // OTP is valid, mark as used
        await this.markOTPAsUsed(otpRecord.id);
        
        return { 
            success: true, 
            message: 'OTP verified successfully',
            otpId: otpRecord.id
        };
    }

    // Get active OTP for booking
    static async getActiveOTP(bookingId) {
        const sql = `
            SELECT id, booking_id, user_id, vendor_id, otp, expires_at, generated_by, 
                   is_used, created_at
            FROM booking_otp
            WHERE booking_id = ? AND is_used = FALSE
            ORDER BY created_at DESC
            LIMIT 1
        `;
        
        return new Promise((resolve, reject) => {
            db.query(sql, [bookingId], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    // Get OTP status for booking
    static async getOTPStatus(bookingId) {
        const otpRecord = await this.getActiveOTP(bookingId);
        
        if (!otpRecord) {
            return { status: 'no_otp', message: 'No OTP generated for this booking' };
        }

        const now = new Date();
        const expiresAt = otpRecord.expires_at ? new Date(otpRecord.expires_at) : null;

        if (otpRecord.is_used) {
            return { 
                status: 'verified', 
                message: 'OTP has been verified'
            };
        }

        if (expiresAt && now > expiresAt) {
            return { 
                status: 'expired', 
                message: 'OTP has expired',
                expiredAt: expiresAt
            };
        }

        return { 
            status: 'active', 
            message: 'OTP is active and ready for verification',
            expiresAt: expiresAt,
            attemptsRemaining: 3
        };
    }

    // Resend OTP (generate new one)
    static async resendOTP(bookingId, userId, vendorId) {
        // Check if there's a recent OTP (within last 2 minutes) to prevent spam
        const recentOTP = await this.getRecentOTP(bookingId, 2);
        if (recentOTP) {
            return { 
                success: false, 
                message: 'Please wait 2 minutes before requesting a new OTP',
                canResendAt: new Date(recentOTP.created_at.getTime() + 2 * 60 * 1000)
            };
        }

        // Generate new OTP
        const result = await this.createOTP(bookingId, userId, vendorId);
        return { 
            success: true, 
            message: 'New OTP generated successfully',
            expiresAt: result.expiresAt
        };
    }

    // Get recent OTP within specified minutes
    static async getRecentOTP(bookingId, withinMinutes) {
        const timeThreshold = new Date(Date.now() - withinMinutes * 60 * 1000);
        
        const sql = `
            SELECT id, created_at
            FROM booking_otp
            WHERE booking_id = ? AND created_at > ?
            ORDER BY created_at DESC
            LIMIT 1
        `;
        
        return new Promise((resolve, reject) => {
            db.query(sql, [bookingId, timeThreshold], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    // Helper methods
    static async invalidateExistingOTPs(bookingId) {
        const sql = `
            UPDATE booking_otp 
            SET is_used = TRUE
            WHERE booking_id = ? AND is_used = FALSE
        `;
        
        return new Promise((resolve, reject) => {
            db.query(sql, [bookingId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    static async markOTPAsUsed(otpId) {
        const sql = `
            UPDATE booking_otp 
            SET is_used = TRUE
            WHERE id = ?
        `;
        
        return new Promise((resolve, reject) => {
            db.query(sql, [otpId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    // Get OTP history for booking (for admin purposes)
    static async getOTPHistory(bookingId) {
        const sql = `
            SELECT id, otp, expires_at, generated_by, is_used, created_at
            FROM booking_otp
            WHERE booking_id = ?
            ORDER BY created_at DESC
        `;
        
        return new Promise((resolve, reject) => {
            db.query(sql, [bookingId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }
}

export default OTPModel;