import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // ✅ import cookie-parser
import cors from 'cors'; // optional but recommended if you’re using frontend
import helmet from 'helmet';

import db from './Config/DatabaseCon.js';   
import UserRouter from './Router/UserRouter.js';
import ServiceRouter from './Router/ServiceROuter.js';
import SubserviceRouter from './Router/SubserviceRouter.js';
import VendorRouter from './Router/VendorRouter.js';
import BookingRouter from './Router/BookingRouter.js';
import adminroutes from './Router/adminRoute.js'
import notificationroutes  from './Router/NotificationRoute.js'
import OTPRouter from './Router/OTPRoute.js';
import EnhancedBookingRouter from './Router/EnhancedBookingRoute.js';
import EnhancedBookingRouterV2 from './Router/EnhancedBookingRouter.js';
import ReviewRouter from './Router/ReviewRoute.js';
import ShiftAvailabilityRouter from './Router/ShiftAvailabilityRoute.js';
import DashboardRouter from './Router/DashboardRouter.js';
import ManualReservationRouter from './Router/ManualReservationRoute.js';
import SubscriptionRouter from './Router/SubscriptionRoute.js';
import SubscriptionCronJobs from './Utils/subscriptionCronJobs.js';

import TestRouter from './Router/TestRouter.js';


dotenv.config();

const app = express();

// 🟢 Middleware

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ✅ Enables req.cookies

// CORS configuration for production
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://bookmyevent-e2c3.vercel.app",
    "https://www.goeventify.com",
    "https://goeventify.com",
    "https://api.goeventify.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));





// 🟢 Mount routers
app.use('/User', UserRouter);
app.use('/Service', ServiceRouter);
app.use('/Subservice', SubserviceRouter);
app.use('/Vendor', VendorRouter);
app.use('/Booking', BookingRouter);
app.use('/admin', adminroutes);
app.use('/notification',  notificationroutes);

// 🟢 Mount new enhanced routers
app.use('/otp', OTPRouter);
app.use('/bookings', EnhancedBookingRouter);
app.use('/bookings-v2', EnhancedBookingRouterV2); // Enhanced booking with comprehensive notifications
app.use('/reviews', ReviewRouter);
app.use('/shift-availability', ShiftAvailabilityRouter);
app.use('/dashboard', DashboardRouter);
app.use('/manual-reservations', ManualReservationRouter);
app.use('/subscription', SubscriptionRouter);

// 🟢 Test routes (remove in production)
app.use('/test', TestRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Event Management API');
});

// 🟢 Initialize subscription cron jobs
SubscriptionCronJobs.init();

app.listen(process.env.PORT, () => {
  // console.log(`Server is running on port ${process.env.PORT}`);
});

// Custom error-handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Global error handler caught:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: "Oops! Something went wrong.",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});