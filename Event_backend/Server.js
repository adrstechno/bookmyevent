import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // ✅ import cookie-parser
import cors from 'cors'; // optional but recommended if you’re using frontend
// import helmet from "helmet";

import db from './Config/DatabaseCon.js';   
import UserRouter from './Router/UserRouter.js';
import ServiceRouter from './Router/ServiceROuter.js';
import VendorRouter from './Router/VendorRouter.js';
import BookingRouter from './Router/BookingRouter.js';
import adminroutes from './Router/adminRoute.js'
import notificationroutes  from './Router/NotificationRoute.js'
import OTPRouter from './Router/OTPRoute.js';
import EnhancedBookingRouter from './Router/EnhancedBookingRoute.js';
import ReviewRouter from './Router/ReviewRoute.js';


dotenv.config();

const app = express();

// 🟢 Middleware
// app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ✅ Enables req.cookies

// (optional) if you're working with frontend:
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://bookmyevent-e2c3.vercel.app",
    "https://www.goeventify.com",
    "https://goeventify.com"
  ],
  credentials: true,
}));


// 🟢 Mount routers
app.use('/User', UserRouter);
app.use('/Service', ServiceRouter);
app.use('/Vendor', VendorRouter);
app.use('/Booking', BookingRouter);
app.use('/admin', adminroutes);
app.use('/notification',  notificationroutes);

// 🟢 Mount new enhanced routers
app.use('/otp', OTPRouter);
app.use('/bookings', EnhancedBookingRouter);
app.use('/reviews', ReviewRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Event Management API');
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// Custom error-handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ message: "Oops! Something went wrong." });
});