import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ⚠️ CRITICAL: Load .env file FIRST before importing any other modules
// This ensures environment variables are available when routers/controllers/services are imported
dotenv.config({ path: join(__dirname, '.env') });

// Verify critical environment variables are loaded
const requiredEnvVars = ['JWT_SECRET', 'PORT', 'Cloudnary_CLOUD_NAME', 'Cloudnary_API_KEY', 'Cloudnary_API_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('❌ Server cannot start without these variables. Please check your .env file.');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('✅ Server starting on port:', process.env.PORT);
console.log('✅ Cloudinary configured:', process.env.Cloudnary_CLOUD_NAME);

// Now import routers dynamically after environment is configured
const { default: db } = await import('./Config/DatabaseCon.js');
const { default: UserRouter } = await import('./Router/UserRouter.js');
const { default: ServiceRouter } = await import('./Router/ServiceROuter.js');
const { default: SubserviceRouter } = await import('./Router/SubserviceRouter.js');
const { default: VendorRouter } = await import('./Router/VendorRouter.js');
const { default: BookingRouter } = await import('./Router/BookingRouter.js');
const { default: adminroutes } = await import('./Router/adminRoute.js');
const { default: notificationroutes } = await import('./Router/NotificationRoute.js');
const { default: OTPRouter } = await import('./Router/OTPRoute.js');
const { default: EnhancedBookingRouter } = await import('./Router/EnhancedBookingRoute.js');
const { default: EnhancedBookingRouterV2 } = await import('./Router/EnhancedBookingRouter.js');
const { default: ReviewRouter } = await import('./Router/ReviewRoute.js');
const { default: ShiftAvailabilityRouter } = await import('./Router/ShiftAvailabilityRoute.js');
const { default: DashboardRouter } = await import('./Router/DashboardRouter.js');
const { default: ManualReservationRouter } = await import('./Router/ManualReservationRoute.js');
const { default: SubscriptionRouter } = await import('./Router/SubscriptionRoute.js');
const { default: SubscriptionCronJobs } = await import('./Utils/subscriptionCronJobs.js');
const { default: TestRouter } = await import('./Router/TestRouter.js');
const { default: ContactRouter } = await import('./Router/ContactRouter.js');

const app = express();

// 🟢 Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration for production
const staticAllowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "https://bookmyevent-e2c3.vercel.app",
  "https://www.goeventify.com",
  "https://goeventify.com",
  "https://api.goeventify.com",
  "http://localhost:8081"
]);

const isLanOrDevOrigin = (origin) => {
  return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);
};

const isExpoOrigin = (origin) => {
  return /^exp:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools (curl/postman/native apps) that send no Origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (staticAllowedOrigins.has(origin) || isLanOrDevOrigin(origin) || isExpoOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// 🟢 Mount routers
app.use('/User', UserRouter);
app.use('/Service', ServiceRouter);
app.use('/Subservice', SubserviceRouter);
app.use('/Vendor', VendorRouter);
app.use('/Booking', BookingRouter);
app.use('/admin', adminroutes);
app.use('/notification', notificationroutes);

// 🟢 Mount new enhanced routers
app.use('/otp', OTPRouter);
app.use('/bookings', EnhancedBookingRouter);
app.use('/bookings-v2', EnhancedBookingRouterV2);
app.use('/reviews', ReviewRouter);
app.use('/shift-availability', ShiftAvailabilityRouter);
app.use('/dashboard', DashboardRouter);
app.use('/manual-reservations', ManualReservationRouter);
app.use('/subscription', SubscriptionRouter);

// 🟢 Test routes
app.use('/test', TestRouter);

// 🟢 Contact form
app.use('/contact', ContactRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Event Management API');
});

// 🟢 Initialize subscription cron jobs
SubscriptionCronJobs.init();

app.listen(process.env.PORT, () => {
  console.log(`✅ Server is running on port ${process.env.PORT}`);
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
