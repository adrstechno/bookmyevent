import db from "../Config/DatabaseCon.js";

class NotificationModel {
    static sendNotification(user_id, title, message, callback) {
        const sql = `
        INSERT INTO notifications (user_id, title, message)
        VALUES (?, ?, ?)
        `;
        db.query(sql, [user_id, title, message], callback);
    }

    static getUserNotification(user_id, callback){
        const sql = `
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        `;
        db.query(sql, [user_id], callback);
    }

    static markAsRead(notification_id, callback) {
        const sql = `
        UPDATE notifications SET is_read = TRUE WHERE id = ?
        `;
        db.query(sql, [notification_id], callback);
    }
}

export default NotificationModel;