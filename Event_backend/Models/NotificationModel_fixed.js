import db from "../Config/DatabaseCon.js";

class NotificationModel {
    // Enhanced notification creation with type and metadata
    static async createNotification(notificationData) {
        const { user_id, title, message, type, metadata, related_booking_id } = notificationData;
        
        const sql = `
            INSERT INTO notifications (user_id, title, message, type, metadata, related_booking_id, is_read, is_archived)
            VALUES (?, ?, ?, ?, ?, ?, FALSE, FALSE)
        `;
        
        return new Promise((resolve, reject) => {
            db.execute(sql, [user_id, title, message, type || 'general', JSON.stringify(metadata || {}), related_booking_id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    // Get paginated notifications with filters
    static async getUserNotifications(user_id, options = {}) {
        const { page = 1, limit = 20, type, status, dateFrom, dateTo } = options;
        const offset = (page - 1) * limit;
        
        let whereConditions = ['user_id = ?'];
        let params = [user_id];
        
        if (type) {
            whereConditions.push('type = ?');
            params.push(type);
        }
        
        if (status === 'read') {
            whereConditions.push('is_read = TRUE');
        } else if (status === 'unread') {
            whereConditions.push('is_read = FALSE');
        }
        
        if (status === 'archived') {
            whereConditions.push('is_archived = TRUE');
        } else {
            whereConditions.push('is_archived = FALSE');
        }
        
        if (dateFrom) {
            whereConditions.push('created_at >= ?');
            params.push(dateFrom);
        }
        
        if (dateTo) {
            whereConditions.push('created_at <= ?');
            params.push(dateTo);
        }
        
        const whereClause = whereConditions.join(' AND ');
        
        const sql = `
            SELECT id, title, message, type, metadata, related_booking_id, is_read, is_archived, created_at
            FROM notifications
            WHERE ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        params.push(limit, offset);
        
        return new Promise((resolve, reject) => {
            db.execute(sql, params, (err, results) => {
                if (err) reject(err);
                else {
                    // Parse metadata JSON for each notification
                    const notifications = results.map(notification => ({
                        ...notification,
                        metadata: notification.metadata ? JSON.parse(notification.metadata) : {}
                    }));
                    resolve(notifications);
                }
            });
        });
    }

    // Get unread notification count
    static async getUnreadCount(user_id) {
        const sql = `
            SELECT COUNT(*) as count
            FROM notifications
            WHERE user_id = ? AND is_read = FALSE AND is_archived = FALSE
        `;
        
        return new Promise((resolve, reject) => {
            db.execute(sql, [user_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0].count);
            });
        });
    }

    // Mark notification as read
    static async markAsRead(notification_id, user_id) {
        const sql = `
            UPDATE notifications 
            SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `;
        
        return new Promise((resolve, reject) => {
            db.execute(sql, [notification_id, user_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }

    // Archive notification
    static async archiveNotification(notification_id, user_id) {
        const sql = `
            UPDATE notifications 
            SET is_archived = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `;
        
        return new Promise((resolve, reject) => {
            db.execute(sql, [notification_id, user_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
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
            db.execute(sql, [notification_id, user_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows > 0);
            });
        });
    }

    // Bulk operations
    static async markAllAsRead(user_id) {
        const sql = `
            UPDATE notifications 
            SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND is_read = FALSE
        `;
        
        return new Promise((resolve, reject) => {
            db.execute(sql, [user_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows);
            });
        });
    }

    // Get notification by ID
    static async getNotificationById(notification_id, user_id) {
        const sql = `
            SELECT id, title, message, type, metadata, related_booking_id, is_read, is_archived, created_at
            FROM notifications
            WHERE id = ? AND user_id = ?
        `;
        
        return new Promise((resolve, reject) => {
            db.execute(sql, [notification_id, user_id], (err, results) => {
                if (err) reject(err);
                else {
                    if (results.length > 0) {
                        const notification = {
                            ...results[0],
                            metadata: results[0].metadata ? JSON.parse(results[0].metadata) : {}
                        };
                        resolve(notification);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    // Legacy methods for backward compatibility
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

    static markAsRead(notification_id, callback) {
        // Note: This legacy method doesn't include user_id validation
        const sql = `UPDATE notifications SET is_read = TRUE WHERE id = ?`;
        db.execute(sql, [notification_id], callback);
    }
}

export default NotificationModel;