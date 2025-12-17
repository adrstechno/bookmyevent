import db from "../Config/DatabaseCon.js";
import { v4 as uuidv4 } from 'uuid';

class ReviewModel {
    // Create a new review
    static async createReview(reviewData) {
        const {
            user_id,
            booking_id,
            vendor_id,
            rating,
            review_text,
            service_quality,
            communication,
            value_for_money,
            punctuality
        } = reviewData;

        const rating_uuid = uuidv4();

        const sql = `
            INSERT INTO review_and_rating (
                rating_uuid, user_id, booking_id, vendor_id, rating, review,
                service_quality, communication, value_for_money, punctuality,
                is_verified, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, TRUE)
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [
                rating_uuid, user_id, booking_id, vendor_id, rating, review_text,
                service_quality || rating, communication || rating, 
                value_for_money || rating, punctuality || rating
            ], (err, result) => {
                if (err) reject(err);
                else resolve({ 
                    rating_id: result.insertId, 
                    rating_uuid,
                    overall_rating: rating
                });
            });
        });
    }

    // Get review by booking ID
    static async getReviewByBookingId(booking_id) {
        const sql = `
            SELECT rar.*, u.first_name, u.last_name, u.email,
                   eb.event_date, eb.status as booking_status,
                   vp.business_name
            FROM review_and_rating rar
            LEFT JOIN users u ON rar.user_id = u.uuid
            LEFT JOIN event_booking eb ON rar.booking_id = eb.booking_id
            LEFT JOIN vendor_profiles vp ON rar.vendor_id = vp.vendor_id
            WHERE rar.booking_id = ? AND rar.is_active = TRUE
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [booking_id], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    // Get review by ID
    static async getReviewById(rating_id) {
        const sql = `
            SELECT rar.*, u.first_name, u.last_name, u.email,
                   eb.event_date, eb.status as booking_status,
                   vp.business_name
            FROM review_and_rating rar
            LEFT JOIN users u ON rar.user_id = u.uuid
            LEFT JOIN event_booking eb ON rar.booking_id = eb.booking_id
            LEFT JOIN vendor_profiles vp ON rar.vendor_id = vp.vendor_id
            WHERE rar.rating_id = ? AND rar.is_active = TRUE
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [rating_id], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    // Get all reviews for a vendor
    static async getVendorReviews(vendor_id, options = {}) {
        const { page = 1, limit = 20, rating_filter, sort_by = 'created_at', sort_order = 'DESC' } = options;
        const offset = (page - 1) * limit;
        
        let whereConditions = ['rar.vendor_id = ?', 'rar.is_active = TRUE'];
        let params = [vendor_id];
        
        if (rating_filter) {
            whereConditions.push('rar.rating = ?');
            params.push(rating_filter);
        }
        
        const whereClause = whereConditions.join(' AND ');
        const orderClause = `ORDER BY rar.${sort_by} ${sort_order}`;
        
        const sql = `
            SELECT rar.*, u.first_name, u.last_name,
                   eb.event_date, eb.status as booking_status
            FROM review_and_rating rar
            LEFT JOIN users u ON rar.user_id = u.uuid
            LEFT JOIN event_booking eb ON rar.booking_id = eb.booking_id
            WHERE ${whereClause}
            ${orderClause}
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

    // Get vendor rating statistics
    static async getVendorRatingStats(vendor_id) {
        const sql = `
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                AVG(service_quality) as avg_service_quality,
                AVG(communication) as avg_communication,
                AVG(value_for_money) as avg_value_for_money,
                AVG(punctuality) as avg_punctuality,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star_count,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star_count,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star_count,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star_count,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star_count
            FROM review_and_rating
            WHERE vendor_id = ? AND is_active = TRUE
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [vendor_id], (err, results) => {
                if (err) reject(err);
                else {
                    const stats = results[0];
                    // Calculate rating distribution percentages
                    if (stats.total_reviews > 0) {
                        stats.rating_distribution = {
                            5: Math.round((stats.five_star_count / stats.total_reviews) * 100),
                            4: Math.round((stats.four_star_count / stats.total_reviews) * 100),
                            3: Math.round((stats.three_star_count / stats.total_reviews) * 100),
                            2: Math.round((stats.two_star_count / stats.total_reviews) * 100),
                            1: Math.round((stats.one_star_count / stats.total_reviews) * 100)
                        };
                        
                        // Round averages to 2 decimal places
                        stats.average_rating = Math.round(stats.average_rating * 100) / 100;
                        stats.avg_service_quality = Math.round(stats.avg_service_quality * 100) / 100;
                        stats.avg_communication = Math.round(stats.avg_communication * 100) / 100;
                        stats.avg_value_for_money = Math.round(stats.avg_value_for_money * 100) / 100;
                        stats.avg_punctuality = Math.round(stats.avg_punctuality * 100) / 100;
                    } else {
                        stats.rating_distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                        stats.average_rating = 0;
                    }
                    
                    resolve(stats);
                }
            });
        });
    }

    // Update review
    static async updateReview(rating_id, user_id, updateData) {
        const {
            rating,
            review_text,
            service_quality,
            communication,
            value_for_money,
            punctuality
        } = updateData;

        // First check if the review belongs to the user
        const existingReview = await this.getReviewById(rating_id);
        if (!existingReview || existingReview.user_id !== user_id) {
            throw new Error('Review not found or unauthorized');
        }

        const sql = `
            UPDATE review_and_rating 
            SET rating = ?, review = ?, service_quality = ?, communication = ?, 
                value_for_money = ?, punctuality = ?, updated_at = CURRENT_TIMESTAMP
            WHERE rating_id = ? AND user_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [
                rating, review_text, 
                service_quality || rating, communication || rating,
                value_for_money || rating, punctuality || rating,
                rating_id, user_id
            ], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }

    // Delete review (soft delete)
    static async deleteReview(rating_id, user_id) {
        // First check if the review belongs to the user
        const existingReview = await this.getReviewById(rating_id);
        if (!existingReview || existingReview.user_id !== user_id) {
            throw new Error('Review not found or unauthorized');
        }

        const sql = `
            UPDATE review_and_rating 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE rating_id = ? AND user_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [rating_id, user_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }

    // Check if user can review booking
    static async canUserReviewBooking(booking_id, user_id) {
        // Check if booking exists and belongs to user
        const bookingSql = `
            SELECT booking_id, user_id, status, vendor_id
            FROM event_booking
            WHERE booking_id = ? AND user_id = ? AND removed_at IS NULL
        `;

        const booking = await new Promise((resolve, reject) => {
            db.query(bookingSql, [booking_id, user_id], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        });

        if (!booking) {
            return { canReview: false, reason: 'Booking not found or unauthorized' };
        }

        // Check if booking is in a reviewable state
        const reviewableStatuses = ['completed'];
        if (!reviewableStatuses.includes(booking.status)) {
            return { canReview: false, reason: 'Booking must be completed to leave a review' };
        }

        // Check if review already exists
        const existingReview = await this.getReviewByBookingId(booking_id);
        if (existingReview) {
            return { canReview: false, reason: 'Review already exists for this booking' };
        }

        return { canReview: true, booking };
    }

    // Get recent reviews (for homepage/dashboard)
    static async getRecentReviews(limit = 10) {
        const sql = `
            SELECT rar.rating_id, rar.rating, rar.review, rar.created_at,
                   u.first_name, u.last_name,
                   vp.business_name, vp.vendor_id
            FROM review_and_rating rar
            LEFT JOIN users u ON rar.user_id = u.uuid
            LEFT JOIN vendor_profiles vp ON rar.vendor_id = vp.vendor_id
            WHERE rar.is_active = TRUE AND rar.review IS NOT NULL AND rar.review != ''
            ORDER BY rar.created_at DESC
            LIMIT ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [limit], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    // Get top rated vendors
    static async getTopRatedVendors(limit = 10, min_reviews = 5) {
        const sql = `
            SELECT vp.vendor_id, vp.business_name, vp.city, vp.profile_url,
                   COUNT(rar.rating_id) as total_reviews,
                   AVG(rar.rating) as average_rating,
                   sc.category_name
            FROM vendor_profiles vp
            LEFT JOIN review_and_rating rar ON vp.vendor_id = rar.vendor_id AND rar.is_active = TRUE
            LEFT JOIN service_categories sc ON vp.service_category_id = sc.service_category_id
            WHERE vp.is_active = TRUE AND vp.is_verified = TRUE
            GROUP BY vp.vendor_id
            HAVING total_reviews >= ?
            ORDER BY average_rating DESC, total_reviews DESC
            LIMIT ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [min_reviews, limit], (err, results) => {
                if (err) reject(err);
                else {
                    // Round average ratings
                    const vendors = results.map(vendor => ({
                        ...vendor,
                        average_rating: Math.round(vendor.average_rating * 100) / 100
                    }));
                    resolve(vendors);
                }
            });
        });
    }

    // Admin: Get all reviews with filters
    static async getAllReviews(options = {}) {
        const { page = 1, limit = 20, vendor_id, rating_filter, is_verified } = options;
        const offset = (page - 1) * limit;
        
        let whereConditions = ['rar.is_active = TRUE'];
        let params = [];
        
        if (vendor_id) {
            whereConditions.push('rar.vendor_id = ?');
            params.push(vendor_id);
        }
        
        if (rating_filter) {
            whereConditions.push('rar.rating = ?');
            params.push(rating_filter);
        }
        
        if (is_verified !== undefined) {
            whereConditions.push('rar.is_verified = ?');
            params.push(is_verified);
        }
        
        const whereClause = whereConditions.join(' AND ');
        
        const sql = `
            SELECT rar.*, u.first_name, u.last_name, u.email,
                   vp.business_name, eb.event_date
            FROM review_and_rating rar
            LEFT JOIN users u ON rar.user_id = u.uuid
            LEFT JOIN vendor_profiles vp ON rar.vendor_id = vp.vendor_id
            LEFT JOIN event_booking eb ON rar.booking_id = eb.booking_id
            WHERE ${whereClause}
            ORDER BY rar.created_at DESC
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

    // Admin: Verify/Unverify review
    static async updateReviewVerification(rating_id, is_verified) {
        const sql = `
            UPDATE review_and_rating 
            SET is_verified = ?, updated_at = CURRENT_TIMESTAMP
            WHERE rating_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [is_verified, rating_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }
}

export default ReviewModel;