import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class EmailVerificationService {
    // Generate email verification token
    static generateVerificationToken(userEmail, userId) {
        const payload = {
            email: userEmail,
            user_id: userId,
            type: 'email_verification',
            // Token expires in 24 hours
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        };

        return jwt.sign(payload, process.env.JWT_SECRET);
    }

    // Verify email verification token
    static verifyEmailToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Ensure it's an email verification token
            if (decoded.type !== 'email_verification') {
                throw new Error('Invalid token type');
            }

            return {
                success: true,
                data: {
                    email: decoded.email,
                    user_id: decoded.user_id
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate a simple verification code (alternative to JWT)
    static generateVerificationCode() {
        return crypto.randomBytes(32).toString('hex');
    }
}

export default EmailVerificationService;