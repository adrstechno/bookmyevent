-- ============================================
-- ADD NEW TABLES ONLY
-- ============================================
-- This file adds only the NEW tables (booking_otp and notifications)
-- Safe to run - will not affect existing tables or data
-- ============================================

-- ============================================
-- 1. BOOKING OTP TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS booking_otp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id VARCHAR(255),
    vendor_id INT,
    otp VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    generated_by ENUM('user', 'vendor') DEFAULT 'user',
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES event_booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(vendor_id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_otp (otp),
    INDEX idx_is_used (is_used),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. NOTIFICATIONS TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify tables were created successfully:

-- Check if booking_otp table exists
SELECT 'booking_otp table created successfully' AS status 
FROM information_schema.tables 
WHERE table_name = 'booking_otp' 
LIMIT 1;

-- Check if notifications table exists
SELECT 'notifications table created successfully' AS status 
FROM information_schema.tables 
WHERE table_name = 'notifications' 
LIMIT 1;

-- ============================================
-- END
-- ============================================
