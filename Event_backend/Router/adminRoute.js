// Routes/adminRoutes.js
import express from "express";
import AdminController from "../Controllers/adminController.js";
import { authenticateToken, authorizeAdmin } from "../Utils/auth.js";

const router = express.Router();

// Existing routes
router.get("/users", AdminController.getAllUsers);
router.get("/vendors", AdminController.getAllVendors);

// New dashboard analytics routes with authentication
router.get("/dashboard/kpis", authenticateToken, authorizeAdmin, AdminController.getAdminKPIs);
router.get("/dashboard/activities", authenticateToken, authorizeAdmin, AdminController.getAdminRecentActivities);
router.get("/dashboard/analytics", authenticateToken, authorizeAdmin, AdminController.getAdminAnalytics);

// Test database connectivity (for debugging)
router.get("/test-database", AdminController.testDatabase);

export default router;
