-- ============================================
-- ENHANCED SCHEMA UPDATES FOR NOTIFICATION & OTP SYSTEM
-- ============================================
-- Run this script to add missing columns and tables
-- Safe to run on existing databases
-- ============================================

-- ============================================
-- 1. UPDATE NOTIFICATIONS TABLE
-- ============================================
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'general' AFTER message,
ADD COLUMN IF NOT EXISTS metadata JSON AFTER type,
ADD COLUMN IF NOT EXISTS related_booking_id INT AFTER metadata,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE AFTER is_read,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related_booking ON notifications(related_booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_archived ON notifications(is_archived);
CREATE INDEX IF NOT EXISTS idx_notifications_updated_at ON notifications(updated_at);

-- ============================================
-- 2. UPDATE BOOKING_OTP TABLE
-- ============================================
ALTER TABLE booking_otp 
ADD COLUMN IF NOT EXISTS attempts_count INT DEFAULT 0 AFTER is_used,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE AFTER attempts_count,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL AFTER is_locked,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL AFTER locked_until,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_booking_otp_attempts ON booking_otp(attempts_count);
CREATE INDEX IF NOT EXISTS idx_booking_otp_is_locked ON booking_otp(is_locked);
CREATE INDEX IF NOT EXISTS idx_booking_otp_locked_until ON booking_otp(locked_until);
CREATE INDEX IF NOT EXISTS idx_booking_otp_verified_at ON booking_otp(verified_at);
CREATE INDEX IF NOT EXISTS idx_booking_otp_updated_at ON booking_otp(updated_at);

-- ============================================
-- 3. UPDATE EVENT_BOOKING TABLE
-- ============================================
-- Update status enum to include new statuses
ALTER TABLE event_booking 
MODIFY COLUMN status ENUM(
    'pending', 'confirmed', 'cancelled', 'completed',
    'pending_vendor_response', 'accepted_by_vendor_pending_admin',
    'approved_by_admin_pending_otp', 'otp_verification_in_progress',
    'booking_confirmed', 'awaiting_review', 'cancelled_by_user',
    'cancelled_by_vendor', 'rejected_by_admin'
) DEFAULT 'pending_vendor_response';

-- Add new columns for enhanced tracking
ALTER TABLE event_booking 
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100) AFTER updated_at,
ADD COLUMN IF NOT EXISTS status_notes TEXT AFTER updated_by;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_event_booking_updated_by ON event_booking(updated_by);

-- ============================================
-- 4. UPDATE REVIEW_AND_RATING TABLE
-- ============================================
ALTER TABLE review_and_rating 
ADD COLUMN IF NOT EXISTS service_quality DECIMAL(2,1) DEFAULT NULL AFTER review,
ADD COLUMN IF NOT EXISTS communication DECIMAL(2,1) DEFAULT NULL AFTER service_quality,
ADD COLUMN IF NOT EXISTS value_for_money DECIMAL(2,1) DEFAULT NULL AFTER communication,
ADD COLUMN IF NOT EXISTS punctuality DECIMAL(2,1) DEFAULT NULL AFTER value_for_money,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE AFTER punctuality,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER is_verified;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_review_rating_service_quality ON review_and_rating(service_quality);
CREATE INDEX IF NOT EXISTS idx_review_rating_communication ON review_and_rating(communication);
CREATE INDEX IF NOT EXISTS idx_review_rating_value_for_money ON review_and_rating(value_for_money);
CREATE INDEX IF NOT EXISTS idx_review_rating_punctuality ON review_and_rating(punctuality);
CREATE INDEX IF NOT EXISTS idx_review_rating_is_verified ON review_and_rating(is_verified);
CREATE INDEX IF NOT EXISTS idx_review_rating_is_active ON review_and_rating(is_active);

-- ============================================
-- 5. CREATE NOTIFICATION_TEMPLATES TABLE (OPTIONAL)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_templates (
    template_id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL UNIQUE,
    template_type VARCHAR(50) NOT NULL,
    title_template VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    variables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_template_name (template_name),
    INDEX idx_template_type (template_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. CREATE BOOKING_STATUS_HISTORY TABLE (OPTIONAL)
-- ============================================
CREATE TABLE IF NOT EXISTS booking_status_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(100),
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES event_booking(booking_id) ON DELETE CASCADE,
    INDEX idx_booking_status_history_booking_id (booking_id),
    INDEX idx_booking_status_history_new_status (new_status),
    INDEX idx_booking_status_history_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. INSERT SAMPLE NOTIFICATION TEMPLATES
-- ============================================
INSERT IGNORE INTO notification_templates (template_name, template_type, title_template, message_template, variables) VALUES
('booking_created', 'booking', 'New Booking Request', '{{user_name}} has requested a booking for {{package_name}} on {{event_date}}. Please review and respond.', '["user_name", "package_name", "event_date"]'),
('booking_accepted', 'booking', 'Booking Accepted', 'Great news! {{vendor_name}} has accepted your booking for {{package_name}} on {{event_date}}. Awaiting admin approval.', '["vendor_name", "package_name", "event_date"]'),
('booking_approved', 'booking', 'Booking Approved', 'Your booking with {{vendor_name}} for {{package_name}} on {{event_date}} has been approved! You will receive an OTP for verification.', '["vendor_name", "package_name", "event_date"]'),
('otp_generated', 'otp', 'OTP Code for Booking Verification', 'Your OTP code is: {{otp_code}}. Please share this with {{vendor_name}} to verify your booking for {{event_date}}.', '["otp_code", "vendor_name", "event_date"]'),
('booking_confirmed', 'booking', 'Booking Confirmed!', 'Your booking with {{vendor_name}} for {{package_name}} on {{event_date}} has been confirmed via OTP verification.', '["vendor_name", "package_name", "event_date"]'),
('review_reminder', 'review', 'Share Your Experience', 'How was your experience with {{vendor_name}} for {{package_name}} on {{event_date}}? Please leave a review to help other customers.', '["vendor_name", "package_name", "event_date"]');

-- ============================================
-- 8. UPDATE FOREIGN KEY CONSTRAINTS
-- ============================================
-- Add foreign key for notifications related_booking_id if not exists
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'notifications' 
     AND CONSTRAINT_NAME = 'fk_notifications_booking') = 0,
    'ALTER TABLE notifications ADD CONSTRAINT fk_notifications_booking FOREIGN KEY (related_booking_id) REFERENCES event_booking(booking_id) ON DELETE SET NULL',
    'SELECT "Foreign key already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- END OF ENHANCED SCHEMA UPDATES
-- ============================================