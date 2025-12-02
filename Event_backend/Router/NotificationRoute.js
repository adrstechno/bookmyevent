import express from "express";
const router = express.Router();

import {getUserNotification} from "../Controllers/NotificationController.js"


router.get("/notifications", getUserNotification);

export default router;