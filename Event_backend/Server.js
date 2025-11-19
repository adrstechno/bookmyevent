import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // ✅ import cookie-parser
import cors from 'cors'; // optional but recommended if you’re using frontend

import db from './Config/DatabaseCon.js';   
import UserRouter from './Router/UserRouter.js';
import ServiceRouter from './Router/ServiceROuter.js';
import VendorRouter from './Router/VendorRouter.js';
import BookingRouter from './Router/BookingRouter.js';


dotenv.config();

const app = express();

// 🟢 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ✅ Enables req.cookies

// (optional) if you're working with frontend:
app.use(cors({
  origin: 'http://localhost:5173', // or your frontend URL
  credentials: true, // ✅ allows cookies to be sent
}));

// 🟢 Mount routers
app.use('/User', UserRouter);
app.use('/Service', ServiceRouter);
app.use('/Vendor', VendorRouter);
app.use('/Booking', BookingRouter);

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