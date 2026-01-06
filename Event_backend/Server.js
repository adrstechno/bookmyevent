import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // ✅ parse cookies
import cors from "cors"; // optional but recommended
import helmet from "helmet"; // security headers

// Routers
import UserRouter from "./Router/UserRouter.js";
import ServiceRouter from "./Router/ServiceRouter.js";
import VendorRouter from "./Router/VendorRouter.js";
import BookingRouter from "./Router/BookingRouter.js";
import AdminRouter from "./Router/adminRoute.js";
import NotificationRouter from "./Router/NotificationRoute.js";
import OTPRouter from "./Router/OTPRoute.js";
import EnhancedBookingRouter from "./Router/EnhancedBookingRoute.js";
import ReviewRouter from "./Router/ReviewRoute.js";
import DashboardRouter from "./Router/DashboardRouter.js";

dotenv.config();

const app = express();

// ------------------- MIDDLEWARE ------------------- //
app.use(helmet()); // secure headers
app.use(express.json()); // parse JSON body
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(cookieParser()); // parse cookies

// CORS setup for frontend
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://bookmyevent-e2c3.vercel.app",
      "https://www.goeventify.com",
      "https://goeventify.com",
    ],
    credentials: true, // allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ------------------- ROUTES ------------------- //
app.get("/", (req, res) => {
  res.send("Welcome to the Event Management API");
});

// User & Auth
app.use("/User", UserRouter);

// Services
app.use("/Service", ServiceRouter);

// Vendors
app.use("/Vendor", VendorRouter);

// Bookings
app.use("/Booking", BookingRouter);
app.use("/bookings", EnhancedBookingRouter);

// Admin
app.use("/admin", AdminRouter);

// Notifications
app.use("/notification", NotificationRouter);

// OTP
app.use("/otp", OTPRouter);

// Reviews
app.use("/reviews", ReviewRouter);

// Dashboard
app.use("/dashboard", DashboardRouter);

// ------------------- ERROR HANDLING ------------------- //

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", err);
  res.status(500).json({ message: "Oops! Something went wrong." });
});

// ------------------- START SERVER ------------------- //
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
