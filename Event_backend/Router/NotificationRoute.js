import express from "express";
import NotificationController from "../Controllers/NotificationController.js";
import { authenticateToken } from "../Utils/auth.js"; // Assuming you have auth middleware

const router = express.Router();

// Enhanced notification routes
router.get("/", authenticateToken, NotificationController.getUserNotifications);
router.get("/count/unread", authenticateToken, NotificationController.getUnreadCount);
router.get("/stats", authenticateToken, NotificationController.getNotificationStats);
router.get("/:id", authenticateToken, NotificationController.getNotificationById);

router.put("/:id/read", authenticateToken, NotificationController.markAsRead);
router.put("/mark-all-read", authenticateToken, NotificationController.markAllAsRead);
router.put("/:id/archive", authenticateToken, NotificationController.archiveNotification);

router.delete("/:id", authenticateToken, NotificationController.deleteNotification);

router.post("/", authenticateToken, NotificationController.createNotification);
router.post("/bulk", authenticateToken, NotificationController.sendBulkNotifications);

// Legacy routes for backward compatibility
router.get("/notifications", NotificationController.getUserNotification);
router.post("/send", NotificationController.sendNotification);
router.put("/read/:notification_id", NotificationController.markNotificationAsRead);

export default router;