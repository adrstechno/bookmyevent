import express from 'express';
import BookingController from '../Controllers/BookingController_improved.js';

const router = express.Router();

// Test vendor lookup
router.get('/vendor-lookup/:vendor_id', BookingController.testVendorLookup);

export default router;