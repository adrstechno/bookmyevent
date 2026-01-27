import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class ReviewTokenService {
    // Generate a secure review token for a specific booking
    static generateReviewToken(bookingId, userEmail) {
        const payload = {
            booking_id: bookingId,
            user_email: userEmail,
            type: 'review_access',
            // Token expires in 30 days
            exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
        };

        return jwt.sign(payload, process.env.JWT_SECRET);
    }

    // Verify and decode review token
    static verifyReviewToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Ensure it's a review token
            if (decoded.type !== 'review_access') {
                throw new Error('Invalid token type');
            }

            return {
                success: true,
                data: {
                    booking_id: decoded.booking_id,
                    user_email: decoded.user_email
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate a short, secure review code (alternative to JWT for URLs)
    static generateReviewCode(bookingId, userEmail) {
        const data = `${bookingId}:${userEmail}:${Date.now()}`;
        const hash = crypto.createHmac('sha256', process.env.JWT_SECRET)
                          .update(data)
                          .digest('hex');
        
        // Return first 16 characters for a shorter URL
        return hash.substring(0, 16);
    }

    // Verify review code (would need to store mapping in database)
    static verifyReviewCode(code, bookingId, userEmail) {
        // This is a simplified version - in production, you'd store the mapping
        const expectedCode = this.generateReviewCode(bookingId, userEmail);
        return code === expectedCode;
    }
}

export default ReviewTokenService;