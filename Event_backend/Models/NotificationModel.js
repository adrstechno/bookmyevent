import db from "../Config/DatabaseCon.js";

class NotificationModel {
    // Create notification with optional type and related booking linkage
    static async createNotification(notificationData) {
        const {
            user_id,
            title,
            message,
            type = null,
            related_booking_id = null
        } = notificationData;

        const sql = `
            INSERT INTO notifications (user_id, title, message, type, related_booking_id, is_read)
            VALUES (?, ?, ?, ?, ?, FALSE)
        `;

        return new Promise((resolve, reject) => {
            db.query(
                sql,
                [user_id, title, message, type, related_booking_id],
                (err, result) => {
                    if (err) {
                        console.error('Notification creation error:', err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    // Get user notifications with pagination and optional status/type filters
    static async getUserNotifications(user_id, options = {}) {
        const { page = 1, limit = 20, status, type } = options;
        const offset = (page - 1) * limit;

        const whereClauses = ['user_id = ?'];
        const queryParams = [user_id];

        if (status === 'read') {
            whereClauses.push('is_read = TRUE');
        } else if (status === 'unread') {
            whereClauses.push('is_read = FALSE');
        }

        if (type) {
            whereClauses.push('type = ?');
            queryParams.push(type);
        }
        
        const sql = `
            SELECT id, user_id, title, message, type, related_booking_id, is_read, created_at
            FROM notifications
            WHERE ${whereClauses.join(' AND ')}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        return new Promise((resolve, reject) => {
            db.query(sql, [...queryParams, limit, offset], (err, results) => {
                if (err) reject(err);
                else resolve(results || []);
            });
        });
    }

    // Get unread notification count
    static async getUnreadCount(user_id) {
        const sql = `
            SELECT COUNT(*) as count
            FROM notifications
            WHERE user_id = ? AND is_read = FALSE
        `;
        
        return new Promise((resolve, reject) => {
            db.query(sql, [user_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]?.count || 0);
            });
        });
    }

    // Mark notification as read
    static async markAsRead(notification_id, user_id) {
        const sql = `
            UPDATE notifications 
            SET is_read = TRUE
            WHERE id = ? AND user_id = ?
        `;
        
        return new Promise((resolve, reject) => {
            db.query(sql, [notification_id, user_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }

    // Mark all as read
    static async markAllAsRead(user_id) {
        const sql = `
            UPDATE notifications 
            SET is_read = TRUE
            WHERE user_id = ? AND is_read = FALSE
        `;
        
        return new Promise((resolve, reject) => {
            db.query(sql, [user_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows);
            });
        });
    }

    // Delete notification
    static async deleteNotification(notification_id, user_id) {
        const sql = `
            DELETE FROM notifications 
            WHERE id = ? AND user_id = ?
        `;
        
        return new Promise((resolve, reject) => {
            db.query(sql, [notification_id, user_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }

    // Get notification by ID
    static async getNotificationById(notification_id, user_id) {
        const sql = `
            SELECT id, user_id, title, message, type, related_booking_id, is_read, created_at
            FROM notifications
            WHERE id = ? AND user_id = ?
        `;
        
        return new Promise((resolve, reject) => {
            db.query(sql, [notification_id, user_id], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    // Archive notification - just delete since we don't have is_archived column
    static async archiveNotification(notification_id, user_id) {
        return this.deleteNotification(notification_id, user_id);
    }

    // Legacy callback-based methods for backward compatibility
    static sendNotification(user_id, title, message, callback) {
        this.createNotification({ user_id, title, message })
            .then(result => callback(null, result))
            .catch(err => callback(err));
    }

    static getUserNotification(user_id, callback) {
        this.getUserNotifications(user_id)
            .then(results => callback(null, results))
            .catch(err => callback(err));
    }
}

export default NotificationModel;
