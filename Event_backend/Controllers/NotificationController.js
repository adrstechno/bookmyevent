import NotificationModel from "../Models/NotificationModel.js";
import NotificationService from "../Services/NotificationService.js";

class NotificationController {
    // Get user notifications with pagination
    static async getUserNotifications(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;
            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const { page = 1, limit = 20 } = req.query;

            const options = {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100)
            };

            const notifications = await NotificationModel.getUserNotifications(user_id, options);
            const unreadCount = await NotificationModel.getUnreadCount(user_id);

            res.status(200).json({
                success: true,
                data: {
                    notifications,
                    pagination: {
                        page: options.page,
                        limit: options.limit,
                        hasMore: notifications.length === options.limit
                    },
                    unreadCount,
                    count: unreadCount
                }
            });

        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch notifications',
                error: error.message
            });
        }
    }

    // Get unread notification count
    static async getUnreadCount(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;
            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const count = await NotificationModel.getUnreadCount(user_id);

            res.status(200).json({
                success: true,
                data: { 
                    unreadCount: count,
                    count: count 
                }
            });

        } catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get unread count',
                error: error.message
            });
        }
    }

    // Mark notification as read
    static async markAsRead(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;
            const { id } = req.params;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Notification ID is required'
                });
            }

            const success = await NotificationModel.markAsRead(id, user_id);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found or unauthorized'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Notification marked as read'
            });

        } catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark notification as read',
                error: error.message
            });
        }
    }

    // Mark all notifications as read
    static async markAllAsRead(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;
            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const updatedCount = await NotificationModel.markAllAsRead(user_id);

            res.status(200).json({
                success: true,
                message: `${updatedCount} notifications marked as read`,
                data: { updatedCount }
            });

        } catch (error) {
            console.error('Mark all as read error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark all notifications as read',
                error: error.message
            });
        }
    }

    // Delete notification
    static async deleteNotification(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;
            const { id } = req.params;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Notification ID is required'
                });
            }

            const success = await NotificationModel.deleteNotification(id, user_id);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found or unauthorized'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Notification deleted'
            });

        } catch (error) {
            console.error('Delete notification error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete notification',
                error: error.message
            });
        }
    }

    // Get notification by ID
    static async getNotificationById(req, res) {
        try {
            const user_id = req.user?.uuid || req.user?.user_id;
            const { id } = req.params;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Notification ID is required'
                });
            }

            const notification = await NotificationModel.getNotificationById(id, user_id);

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }

            res.status(200).json({
                success: true,
                data: notification
            });

        } catch (error) {
            console.error('Get notification by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch notification',
                error: error.message
            });
        }
    }

    // Create notification (admin/system use)
    static async createNotification(req, res) {
        try {
            const { user_id, title, message } = req.body;

            if (!user_id || !title || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'user_id, title, and message are required'
                });
            }

            const result = await NotificationModel.createNotification({ user_id, title, message });

            res.status(201).json({
                success: true,
                message: 'Notification created successfully',
                data: { id: result.insertId }
            });

        } catch (error) {
            console.error('Create notification error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create notification',
                error: error.message
            });
        }
    }

    // Archive notification (same as delete for now)
    static async archiveNotification(req, res) {
        return NotificationController.deleteNotification(req, res);
    }

    // Get notification statistics (placeholder)
    static async getNotificationStats(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: 'Notification statistics',
                data: {
                    totalSent: 0,
                    totalRead: 0,
                    readRate: 0
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get notification statistics',
                error: error.message
            });
        }
    }

    // Send bulk notifications
    static async sendBulkNotifications(req, res) {
        try {
            const { notifications } = req.body;

            if (!Array.isArray(notifications) || notifications.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'notifications array is required and cannot be empty'
                });
            }

            const promises = notifications.map(n => 
                NotificationModel.createNotification({ 
                    user_id: n.user_id, 
                    title: n.title, 
                    message: n.message 
                })
            );

            await Promise.all(promises);

            res.status(201).json({
                success: true,
                message: `${notifications.length} notifications sent successfully`
            });

        } catch (error) {
            console.error('Send bulk notifications error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send bulk notifications',
                error: error.message
            });
        }
    }

    // Legacy methods for backward compatibility
    static sendNotification(req, res) {
        const { user_id, title, message } = req.body;
        
        NotificationModel.sendNotification(user_id, title, message, (err, result) => {
            if (err) {
                console.error('Send notification error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send notification',
                    error: err.message
                });
            }
            
            res.status(201).json({
                success: true,
                message: 'Notification sent successfully',
                data: result
            });
        });
    }

    static getUserNotification(req, res) {
        const { user_id } = req.params;
        
        NotificationModel.getUserNotification(user_id, (err, results) => {
            if (err) {
                console.error('Get user notifications error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch notifications',
                    error: err.message
                });
            }
            
            res.status(200).json({
                success: true,
                data: results
            });
        });
    }

    static markNotificationAsRead(req, res) {
        const { notification_id } = req.params;
        const user_id = req.user?.uuid || req.user?.user_id;
        
        NotificationModel.markAsRead(notification_id, user_id)
            .then(success => {
                res.status(200).json({
                    success: true,
                    message: 'Notification marked as read'
                });
            })
            .catch(err => {
                console.error('Mark as read error:', err);
                res.status(500).json({
                    success: false,
                    message: 'Failed to mark notification as read',
                    error: err.message
                });
            });
    }
}

export default NotificationController;
