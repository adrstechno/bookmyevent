// Routes/adminRoutes.js
import express from "express";
import AdminController from "../Controllers/adminController.js";

const router = express.Router();

router.get("/users", AdminController.getAllUsers);
router.get("/vendors", AdminController.getAllVendors);

export default router;
