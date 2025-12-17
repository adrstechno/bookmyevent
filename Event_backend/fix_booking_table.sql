-- ============================================
-- FIX EVENT_BOOKING TABLE COLUMNS
-- ============================================
-- Run this script to fix column definitions
-- This will update the ENUM values to match the expected values

-- Fix status column - ensure it can hold 'confirmed' (9 chars)
ALTER TABLE event_booking MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending';

-- Fix admin_approval column
ALTER TABLE event_booking MODIFY COLUMN admin_approval ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';

-- Verify the changes
DESCRIBE event_booking;

-- ============================================
-- END OF FIX
-- ============================================
