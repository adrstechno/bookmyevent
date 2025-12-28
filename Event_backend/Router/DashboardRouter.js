import express from 'express';
import DashboardController from '../Controllers/DashboardController.js';
import { authenticateToken } from '../Utils/auth.js';

const router = express.Router();

// KPIs for logged in user
router.get('/user/kpis', authenticateToken, DashboardController.userKpis);
// Monthly chart data
router.get('/user/monthly', authenticateToken, DashboardController.monthlyChart);

export default router;
