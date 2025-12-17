# Event Booking Platform - Setup Guide

## 🚀 Quick Start

This guide will help you set up the comprehensive notification service and OTP verification API system for your event booking platform.

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL database
- Existing Event_backend project structure

## 🔧 Installation Steps

### 1. Database Setup

First, run the enhanced schema updates to add new tables and columns:

```bash
# Navigate to your database and run the schema updates
mysql -u your_username -p your_database < enhanced_schema_updates.sql
```

This will add:
- Enhanced notifications table with type, metadata, and archiving
- Improved booking_otp table with attempt tracking and locking
- Updated booking statuses for complete workflow
- Enhanced review system with detailed ratings

### 2. Install Dependencies

All required dependencies are already in your package.json. If you need to reinstall:

```bash
npm install
```

### 3. Environment Configuration

Your existing `.env` file should work. Ensure these variables are set:

```env
PORT=3232
JWT_SECRET=your_jwt_secret_here
# Your existing database configuration
HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DBPORT=4000
USERNAME=7BwYZV8pqsv5d1i.root
PASSWORD=JcdhlSC3TEcYfndd
DATABASE=Event_Managment
```

### 4. Start the Server

```bash
npm start
```

The server will start on port 3232 with all new endpoints available.

## 📡 New API Endpoints

### Notification System
- `GET /notification/` - Get user notifications (paginated, filterable)
- `PUT /notification/:id/read` - Mark as read
- `PUT /notification/:id/archive` - Archive notification
- `DELETE /notification/:id` - Delete notification
- `GET /notification/count/unread` - Get unread count

### OTP System
- `POST /otp/generate` - Generate OTP for booking (vendor-initiated)
- `POST /otp/verify` - Verify OTP (vendor submits user's code)
- `GET /otp/:bookingId/status` - Check OTP status
- `POST /otp/resend` - Resend OTP code
- `GET /otp/:bookingId/attempts` - Get remaining attempts

### Enhanced Booking Management
- `POST /bookings/` - Create booking
- `PUT /bookings/:id/accept` - Vendor accepts booking
- `PUT /bookings/:id/reject` - Vendor rejects booking
- `PUT /bookings/:id/approve` - Admin approves booking
- `PUT /bookings/:id/admin-reject` - Admin rejects booking
- `PUT /bookings/:id/cancel` - User/Vendor cancel booking
- `GET /bookings/:id/status` - Get current booking status

### Review & Rating System
- `POST /reviews/bookings/:id` - Submit review and rating
- `GET /reviews/bookings/:id` - Get review for booking
- `GET /reviews/vendor/:vendorId` - Get all reviews for vendor
- `GET /reviews/vendor/:vendorId/rating/average` - Get average vendor rating
- `PUT /reviews/:id` - Update review (user only)

## 🔄 Booking Workflow

The new system implements a complete booking lifecycle:

1. **User creates booking** → `pending_vendor_response`
   - Notification sent to vendor

2. **Vendor accepts** → `accepted_by_vendor_pending_admin`
   - Notifications sent to user and admin

3. **Admin approves** → `approved_by_admin_pending_otp`
   - Notifications sent to user and vendor

4. **Vendor generates OTP** → `otp_verification_in_progress`
   - OTP sent to user via notification

5. **Vendor verifies OTP** → `booking_confirmed`
   - Confirmation notifications sent to all parties

6. **After event completion** → `awaiting_review`
   - Review reminder sent to user

7. **User submits review** → `completed`
   - Review notifications sent to vendor and admin

## 🔔 Notification Types

The system automatically sends notifications for:

**Admin Notifications:**
- Vendor account creation (pending approval)
- New booking requests
- Vendor booking confirmations (pending admin confirmation)
- Booking approvals and rejections
- OTP verification completions
- User review submissions

**Vendor Notifications:**
- New bookings created by users
- Admin booking approvals/rejections
- User booking cancellations
- Vendor booking cancellations
- OTP verification reminders
- User reviews posted

**User Notifications:**
- Vendor booking confirmations
- Admin booking approvals/rejections
- OTP code delivery
- Booking completion confirmations
- Review submission reminders

## 🔐 Security Features

### OTP Security
- 6-digit secure random codes
- 10-minute validity period
- Maximum 3 verification attempts
- 15-minute lockout after failed attempts
- Encrypted storage in database
- One OTP per active booking

### Authentication
- JWT-based authentication required for all protected endpoints
- Role-based access control (Admin, Vendor, User)
- Proper authorization checks for all operations

## 🧪 Testing the System

### 1. Test Notification System
```bash
# Get notifications (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3232/notification/

# Mark notification as read
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3232/notification/1/read
```

### 2. Test Booking Workflow
```bash
# Create booking
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"vendor_id":1,"shift_id":1,"package_id":1,"event_address":"Test Address","event_date":"2024-02-15","event_time":"14:00:00"}' \
     http://localhost:3232/bookings/

# Vendor accepts booking
curl -X PUT -H "Authorization: Bearer VENDOR_TOKEN" \
     http://localhost:3232/bookings/1/accept
```

### 3. Test OTP System
```bash
# Generate OTP (vendor)
curl -X POST -H "Authorization: Bearer VENDOR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"booking_id":1}' \
     http://localhost:3232/otp/generate

# Verify OTP (vendor)
curl -X POST -H "Authorization: Bearer VENDOR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"booking_id":1,"otp_code":"123456"}' \
     http://localhost:3232/otp/verify
```

### 4. Test Review System
```bash
# Submit review
curl -X POST -H "Authorization: Bearer USER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"rating":5,"review_text":"Excellent service!"}' \
     http://localhost:3232/reviews/bookings/1

# Get vendor reviews
curl http://localhost:3232/reviews/vendor/1
```

## 📊 Database Changes

The setup adds these new features to your existing tables:

**notifications table:**
- `type` - Categorizes notification types
- `metadata` - JSON field for additional data
- `related_booking_id` - Links to specific bookings
- `is_archived` - Archive functionality
- `updated_at` - Track modifications

**booking_otp table:**
- `attempts_count` - Track failed attempts
- `is_locked` - Lock after too many failures
- `locked_until` - Lock expiration time
- `verified_at` - Verification timestamp
- `updated_at` - Track modifications

**event_booking table:**
- Enhanced status enum with complete workflow states
- `updated_by` - Track who made changes
- `status_notes` - Additional status information

**review_and_rating table:**
- `service_quality` - Detailed rating breakdown
- `communication` - Communication rating
- `value_for_money` - Value rating
- `punctuality` - Punctuality rating
- `is_verified` - Admin verification flag
- `is_active` - Soft delete functionality

## 🔍 Monitoring & Logs

The system includes comprehensive error handling and logging:

- All critical operations are logged
- Detailed error messages for debugging
- Proper HTTP status codes
- Validation error details

## 📈 Performance Considerations

- Database indexes on frequently queried columns
- Pagination for large result sets
- Efficient queries with proper joins
- Rate limiting on OTP endpoints
- Bulk notification operations

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Verify your database credentials in `.env`
   - Ensure the database server is running
   - Check if the enhanced schema updates were applied

2. **Authentication Errors**
   - Verify JWT_SECRET is set in `.env`
   - Check if the token is properly formatted (Bearer TOKEN)
   - Ensure the user exists and has proper permissions

3. **OTP Issues**
   - Check if booking is in correct status for OTP generation
   - Verify vendor owns the booking
   - Check OTP expiration and attempt limits

4. **Notification Issues**
   - Verify user_id format matches your system
   - Check if notification type is valid
   - Ensure related_booking_id exists

## 📞 Support

If you encounter any issues:

1. Check the server logs for detailed error messages
2. Verify all database schema updates were applied
3. Test with the provided curl examples
4. Review the API documentation for correct request formats

## 🎉 You're Ready!

Your event booking platform now has a complete notification service and OTP verification system with:

✅ Real-time notifications for all booking events  
✅ Secure OTP verification with attempt limiting  
✅ Complete booking workflow management  
✅ Comprehensive review and rating system  
✅ Role-based access control  
✅ Production-ready error handling  
✅ Scalable database design  

The system is designed to handle the complete booking lifecycle from creation to completion, ensuring all stakeholders are properly notified at each step.