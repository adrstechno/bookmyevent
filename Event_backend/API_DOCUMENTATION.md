# Event Booking Platform - API Documentation

## Overview
This document provides comprehensive documentation for the Event Booking Platform's notification service, OTP verification system, booking management, and review system APIs.

## Base URL
```
http://localhost:3232
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this standard format:
```json
{
  "success": boolean,
  "message": "string",
  "data": object | array,
  "error": "string" // Only present on errors
}
```

---

## 🔔 Notification API

### Get User Notifications
**GET** `/notification/`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `type` (optional): Filter by notification type
- `status` (optional): Filter by status (read/unread/archived)
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "title": "New Booking Request",
        "message": "John Doe has requested a booking...",
        "type": "booking_created",
        "metadata": {},
        "related_booking_id": 123,
        "is_read": false,
        "is_archived": false,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "hasMore": true
    },
    "unreadCount": 5
  }
}
```

### Get Unread Count
**GET** `/notification/count/unread`

### Mark as Read
**PUT** `/notification/:id/read`

### Mark All as Read
**PUT** `/notification/mark-all-read`

### Archive Notification
**PUT** `/notification/:id/archive`

### Delete Notification
**DELETE** `/notification/:id`

---

## 🔐 OTP API

### Generate OTP
**POST** `/otp/generate`

**Body:**
```json
{
  "booking_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP generated and sent to user",
  "data": {
    "otp_id": 456,
    "expires_at": "2024-01-15T10:40:00Z",
    "booking_id": 123
  }
}
```

### Verify OTP
**POST** `/otp/verify`

**Body:**
```json
{
  "booking_id": 123,
  "otp_code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully. Booking confirmed!",
  "data": {
    "booking_id": 123,
    "verified_at": "2024-01-15T10:35:00Z",
    "booking_status": "booking_confirmed"
  }
}
```

### Get OTP Status
**GET** `/otp/:bookingId/status`

### Resend OTP
**POST** `/otp/resend`

### Get Remaining Attempts
**GET** `/otp/:bookingId/attempts`

---

## 📅 Enhanced Booking API

### Create Booking
**POST** `/bookings/`

**Body:**
```json
{
  "vendor_id": 1,
  "shift_id": 1,
  "package_id": 1,
  "event_address": "123 Main St, City",
  "event_date": "2024-02-15",
  "event_time": "14:00:00",
  "special_requirement": "Optional requirements"
}
```

### Booking Status Flow
The booking follows this status progression:
1. `pending_vendor_response` - Initial state after creation
2. `accepted_by_vendor_pending_admin` - Vendor accepted
3. `approved_by_admin_pending_otp` - Admin approved
4. `otp_verification_in_progress` - OTP generated
5. `booking_confirmed` - OTP verified
6. `awaiting_review` - Event completed, awaiting review
7. `completed` - Review submitted

### Vendor Actions
**PUT** `/bookings/:id/accept` - Accept booking
**PUT** `/bookings/:id/reject` - Reject booking

### Admin Actions
**PUT** `/bookings/:id/approve` - Approve booking
**PUT** `/bookings/:id/admin-reject` - Reject booking

### User/Vendor Actions
**PUT** `/bookings/:id/cancel` - Cancel booking

### Get Bookings
**GET** `/bookings/user/my-bookings` - User's bookings
**GET** `/bookings/vendor/my-bookings` - Vendor's bookings
**GET** `/bookings/admin/all-bookings` - All bookings (admin only)

---

## ⭐ Review & Rating API

### Submit Review
**POST** `/reviews/bookings/:id`

**Body:**
```json
{
  "rating": 5,
  "review_text": "Excellent service!",
  "service_quality": 5,
  "communication": 4,
  "value_for_money": 5,
  "punctuality": 5
}
```

### Get Vendor Reviews
**GET** `/reviews/vendor/:vendorId`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `rating_filter` (optional): Filter by rating (1-5)
- `sort_by` (optional): Sort field (default: created_at)
- `sort_order` (optional): Sort order (ASC/DESC)

### Get Vendor Rating Statistics
**GET** `/reviews/vendor/:vendorId/rating/average`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_reviews": 25,
    "average_rating": 4.2,
    "avg_service_quality": 4.3,
    "avg_communication": 4.1,
    "avg_value_for_money": 4.0,
    "avg_punctuality": 4.4,
    "rating_distribution": {
      "5": 40,
      "4": 32,
      "3": 20,
      "2": 8,
      "1": 0
    }
  }
}
```

### Update Review
**PUT** `/reviews/:id`

### Delete Review
**DELETE** `/reviews/:id`

### Public Endpoints
**GET** `/reviews/recent` - Recent reviews
**GET** `/reviews/top-vendors` - Top rated vendors

---

## 📊 Notification Types

The system supports the following notification types:

- `booking_created` - New booking request
- `booking_accepted` - Vendor accepted booking
- `booking_rejected` - Vendor rejected booking
- `booking_approved` - Admin approved booking
- `booking_admin_rejected` - Admin rejected booking
- `booking_cancelled` - Booking cancelled
- `otp_generated` - OTP code sent
- `otp_verified` - OTP verified successfully
- `otp_reminder` - OTP verification reminder
- `booking_confirmed` - Booking confirmed
- `review_submitted` - Review submitted
- `review_received` - Review received
- `vendor_account_created` - New vendor registration
- `booking_completion_reminder` - Review reminder

---

## 🔒 Security Features

### OTP Security
- 6-digit secure random codes
- 10-minute validity period
- Maximum 3 verification attempts
- 15-minute lockout after failed attempts
- Encrypted storage in database

### Authentication
- JWT-based authentication
- Role-based access control (Admin, Vendor, User)
- Token expiration handling

### Data Protection
- Input validation on all endpoints
- SQL injection prevention
- Rate limiting on sensitive endpoints

---

## 📈 Performance Features

### Database Optimization
- Proper indexing on frequently queried columns
- Efficient pagination
- Optimized queries with joins

### Caching Strategy
- Notification count caching
- Vendor rating statistics caching
- Recent reviews caching

---

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables:**
   ```env
   PORT=3232
   JWT_SECRET=your_jwt_secret
   # Database configuration
   HOST=your_db_host
   DBPORT=4000
   USERNAME=your_db_username
   PASSWORD=your_db_password
   DATABASE=Event_Managment
   ```

3. **Run Database Migrations:**
   ```bash
   # Run the enhanced schema updates
   mysql -u username -p database_name < enhanced_schema_updates.sql
   ```

4. **Start Server:**
   ```bash
   npm start
   ```

---

## 📝 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## 🧪 Testing

### Sample API Calls

**Create a booking:**
```bash
curl -X POST http://localhost:3232/bookings/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vendor_id": 1,
    "shift_id": 1,
    "package_id": 1,
    "event_address": "123 Main St",
    "event_date": "2024-02-15",
    "event_time": "14:00:00"
  }'
```

**Generate OTP:**
```bash
curl -X POST http://localhost:3232/otp/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"booking_id": 123}'
```

**Submit Review:**
```bash
curl -X POST http://localhost:3232/reviews/bookings/123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "review_text": "Excellent service!"
  }'
```

---

## 📞 Support

For technical support or questions about the API, please contact the development team.

**Version:** 1.0.0  
**Last Updated:** December 2024