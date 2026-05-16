-- Migration 005: Add Razorpay payment columns to vendor_subscriptions
-- Run in phpMyAdmin: goeventifydb > SQL tab
-- Safe to run multiple times — each ALTER is guarded by the IF NOT EXISTS check via stored procedure

USE goeventifydb;

-- Add razorpay_order_id column if it doesn't exist
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'vendor_subscriptions'
      AND column_name = 'razorpay_order_id'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE vendor_subscriptions ADD COLUMN razorpay_order_id VARCHAR(255) NULL',
    'SELECT "razorpay_order_id already exists" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add razorpay_payment_id column if it doesn't exist
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'vendor_subscriptions'
      AND column_name = 'razorpay_payment_id'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE vendor_subscriptions ADD COLUMN razorpay_payment_id VARCHAR(255) NULL',
    'SELECT "razorpay_payment_id already exists" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add amount_paid column if it doesn't exist
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'vendor_subscriptions'
      AND column_name = 'amount_paid'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE vendor_subscriptions ADD COLUMN amount_paid DECIMAL(10,2) NULL',
    'SELECT "amount_paid already exists" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Verify final structure
SELECT column_name, column_type, is_nullable
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'vendor_subscriptions'
ORDER BY ordinal_position;
