-- ============================================
-- ADD MISSING COLUMNS TO BOOKING_OTP TABLE
-- ============================================
-- Run this script to add the missing columns needed for OTP functionality
-- Safe to run multiple times (uses IF NOT EXISTS logic via ALTER IGNORE)

-- Add attempts_count column
ALTER TABLE booking_otp ADD COLUMN IF NOT EXISTS attempts_count INT DEFAULT 0;

-- Add is_locked column
ALTER TABLE booking_otp ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;

-- Add locked_until column
ALTER TABLE booking_otp ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL DEFAULT NULL;

-- Add verified_at column
ALTER TABLE booking_otp ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL DEFAULT NULL;

-- Add updated_at column
ALTER TABLE booking_otp ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update generated_by ENUM to include 'admin'
ALTER TABLE booking_otp MODIFY COLUMN generated_by ENUM('user', 'vendor', 'admin') DEFAULT 'user';

-- ============================================
-- END OF MIGRATION
-- ============================================
