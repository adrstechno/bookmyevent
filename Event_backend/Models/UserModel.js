//require db 
import db from '../Config/DatabaseCon.js';

// User Model
class UserModel { 
    // insert user
    static async insertUser(data, callback) {
        const sql = 'INSERT INTO users (uuid, email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(sql, [data.uuid, data.email, data.phone, data.password_hash, data.first_name, data.last_name, data.user_type, data.is_verified, data.is_active], callback);
    }

    static async findonebyemail(email  , callback) {
        const sql = `SELECT * FROM users WHERE email = ?`;
        db.query(sql, [email], callback);
    }
static async findonebyphone(phone, callback) {
        const sql = `SELECT * FROM users WHERE phone = ?`;
        db.query(sql, [phone], callback);
    }
    static async updatepassword(email , hashedPassword , callback){
        const sql = 'UPDATE users SET password_hash = ? WHERE email = ?';
        db.query(sql, [hashedPassword, email], callback);
    }

    // Update email verification status
    static async updateVerificationStatus(userId, isVerified, callback) {
        const sql = 'UPDATE users SET is_verified = ? WHERE uuid = ?';
        db.query(sql, [isVerified, userId], callback);
    }

    // Find user by UUID
    static async findByUuid(uuid, callback) {
        const sql = 'SELECT * FROM users WHERE uuid = ?';
        db.query(sql, [uuid], callback);
    }

    // Store password reset token
    static async storePasswordResetToken(userId, token, expiresAt, callback) {
        const sql = 'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)';
        db.query(sql, [userId, token, expiresAt], callback);
    }

    // Get password reset token
    static async getPasswordResetToken(userId, token, callback) {
        const sql = 'SELECT * FROM password_reset_tokens WHERE user_id = ? AND token = ? AND used_at IS NULL';
        db.query(sql, [userId, token], callback);
    }

    // Mark password reset token as used
    static async markPasswordResetTokenAsUsed(tokenId, callback) {
        const sql = 'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?';
        db.query(sql, [tokenId], callback);
    }

    // Clean up expired password reset tokens (optional - for maintenance)
    static async cleanupExpiredResetTokens(callback) {
        const sql = 'DELETE FROM password_reset_tokens WHERE expires_at < NOW()';
        db.query(sql, [], callback);
    }
}


export default UserModel;