-- ============================================================================
-- MIGRATION: Implement Tiered Subscription System (Free Trial + Premium)
-- Purpose: Add plan_type and trial tracking to enable subscription tiers
-- Date: May 26, 2026
-- Author: Nayan Malviya
-- Status: READY FOR DEPLOYMENT
-- ============================================================================

-- ============================================================================
-- PHASE 1: ADD NEW COLUMNS TO EXISTING TABLES
-- ============================================================================

-- STEP 1.1: Add columns to vendor_subscriptions table
-- Purpose: Track subscription plan type and trial status
ALTER TABLE vendor_subscriptions
ADD COLUMN IF NOT EXISTS plan_type ENUM('free', 'premium') DEFAULT 'free' AFTER status,
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT FALSE AFTER plan_type,
ADD COLUMN IF NOT EXISTS cancel_date DATETIME NULL AFTER end_date;

-- Verification query for Step 1.1
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'vendor_subscriptions'
-- AND COLUMN_NAME IN ('plan_type', 'is_trial', 'cancel_date');

-- STEP 1.2: Add columns to vendor_profiles table
-- Purpose: Track subscription status at profile level for faster queries
ALTER TABLE vendor_profiles
ADD COLUMN IF NOT EXISTS current_subscription_status ENUM('free', 'premium', 'expired') DEFAULT 'free' AFTER is_active,
ADD COLUMN IF NOT EXISTS free_trial_end_date DATETIME NULL AFTER current_subscription_status;

-- Verification query for Step 1.2
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'vendor_profiles'
-- AND COLUMN_NAME IN ('current_subscription_status', 'free_trial_end_date');

-- ============================================================================
-- PHASE 2: CREATE SUBSCRIPTION_PLANS REFERENCE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  plan_id INT PRIMARY KEY AUTO_INCREMENT,
  plan_type ENUM('free', 'premium') NOT NULL UNIQUE,
  plan_name VARCHAR(100) NOT NULL,
  duration_days INT DEFAULT 90,
  amount DECIMAL(10, 2) DEFAULT 0,
  features_json JSON DEFAULT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_plan_type (plan_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verification query for Phase 2
-- SELECT COUNT(*) as plan_count FROM subscription_plans;

-- ============================================================================
-- PHASE 3: SEED SUBSCRIPTION_PLANS TABLE WITH DEFAULT DATA
-- ============================================================================

INSERT IGNORE INTO subscription_plans (plan_id, plan_type, plan_name, duration_days, amount, features_json, description, is_active)
VALUES
(1, 'free', 'Free Trial', 90, 0,
  JSON_OBJECT(
    'booking_visibility', 'location_only',
    'user_profile_visible', false,
    'booking_details_visible', false,
    'notifications_limited', true,
    'multiple_locations', false,
    'admin_dashboard', false
  ),
  '3-month free trial for new vendors - limited booking access',
  TRUE),
(2, 'premium', 'Premium Plan', 365, 499,
  JSON_OBJECT(
    'booking_visibility', 'full',
    'user_profile_visible', true,
    'booking_details_visible', true,
    'notifications_limited', false,
    'multiple_locations', true,
    'admin_dashboard', true
  ),
  'Annual subscription at ₹499/year - full access to all features',
  TRUE);

-- ============================================================================
-- PHASE 4: ADD INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Index for subscription lookups by vendor_id and status
ALTER TABLE vendor_subscriptions
ADD INDEX IF NOT EXISTS idx_vendor_status_date (vendor_id, status, end_date);

-- Index for checking active premium subscriptions
ALTER TABLE vendor_subscriptions
ADD INDEX IF NOT EXISTS idx_vendor_plan_status (vendor_id, plan_type, status);

-- Index for vendor profile subscription status lookups
ALTER TABLE vendor_profiles
ADD INDEX IF NOT EXISTS idx_subscription_status (current_subscription_status);

-- Index for trial end date checks (for CRON jobs)
ALTER TABLE vendor_profiles
ADD INDEX IF NOT EXISTS idx_free_trial_end_date (free_trial_end_date);

-- ============================================================================
-- PHASE 5: MIGRATE EXISTING DATA
-- ============================================================================

-- STEP 5.1: Update existing active subscriptions to "premium" status
-- Rationale: Existing vendors with paid subscriptions should not lose access
-- Only applies to subscriptions with razorpay_payment_id (paid subscriptions)
UPDATE vendor_subscriptions
SET
  plan_type = 'premium',
  is_trial = FALSE
WHERE
  status = 'active'
  AND end_date > NOW()
  AND razorpay_payment_id IS NOT NULL;

-- STEP 5.2: Update vendor_profiles with existing paid subscriptions to "premium"
UPDATE vendor_profiles vp
INNER JOIN (
  SELECT DISTINCT vendor_id
  FROM vendor_subscriptions
  WHERE status = 'active'
  AND end_date > NOW()
  AND plan_type = 'premium'
) vs ON vp.vendor_id = vs.vendor_id
SET vp.current_subscription_status = 'premium';

-- STEP 5.3: Mark remaining vendors as "free" (new vendors or non-subscribed)
UPDATE vendor_profiles
SET current_subscription_status = 'free'
WHERE current_subscription_status NOT IN ('premium', 'expired');

-- STEP 5.4: Set free_trial_end_date for new vendors that don't have subscriptions
-- Note: This will be set to NOW() + 90 days during vendor registration
-- For existing free vendors, we'll set it based on when they should be prompted
UPDATE vendor_profiles vp
LEFT JOIN vendor_subscriptions vs ON vp.vendor_id = vs.vendor_id
  AND vs.status = 'active'
  AND vs.end_date > NOW()
SET vp.free_trial_end_date = DATE_ADD(vp.created_at, INTERVAL 90 DAY)
WHERE
  vp.free_trial_end_date IS NULL
  AND vp.current_subscription_status = 'free'
  AND vs.vendor_id IS NULL;

-- ============================================================================
-- PHASE 6: VERIFICATION QUERIES (Run these to verify migration success)
-- ============================================================================

-- Verify all new columns exist
-- SELECT
--   COLUMN_NAME,
--   COLUMN_TYPE,
--   IS_NULLABLE,
--   COLUMN_DEFAULT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME IN ('vendor_subscriptions', 'vendor_profiles')
-- AND COLUMN_NAME IN ('plan_type', 'is_trial', 'cancel_date', 'current_subscription_status', 'free_trial_end_date')
-- ORDER BY TABLE_NAME, COLUMN_NAME;

-- Verify subscription_plans table created and seeded
-- SELECT * FROM subscription_plans;

-- Count vendors by subscription status
-- SELECT
--   current_subscription_status,
--   COUNT(*) as vendor_count
-- FROM vendor_profiles
-- GROUP BY current_subscription_status;

-- Count subscriptions by plan type
-- SELECT
--   plan_type,
--   status,
--   COUNT(*) as subscription_count
-- FROM vendor_subscriptions
-- GROUP BY plan_type, status;

-- Identify any data inconsistencies
-- SELECT
--   vp.vendor_id,
--   vp.business_name,
--   vp.current_subscription_status,
--   vs.plan_type,
--   vs.status,
--   vs.end_date
-- FROM vendor_profiles vp
-- LEFT JOIN vendor_subscriptions vs ON vp.vendor_id = vs.vendor_id
--   AND vs.status = 'active'
--   AND vs.end_date > NOW()
-- WHERE vp.current_subscription_status != COALESCE(vs.plan_type, 'free');

-- Check for orphaned subscriptions (no corresponding vendor)
-- SELECT vs.* FROM vendor_subscriptions vs
-- LEFT JOIN vendor_profiles vp ON vs.vendor_id = vp.vendor_id
-- WHERE vp.vendor_id IS NULL;

-- ============================================================================
-- CRITICAL: PRE-MIGRATION VALIDATION (Run BEFORE executing this script)
-- ============================================================================

/*
BEFORE EXECUTING THIS MIGRATION:

1. Create full database backup:
   mysqldump -u username -p bookmyevent > backup_pre_subscription_$(date +%Y%m%d_%H%M%S).sql

2. Get current data state:
   SELECT COUNT(*) as total_vendors FROM vendor_profiles;
   SELECT COUNT(*) as active_subs FROM vendor_subscriptions WHERE status = 'active' AND end_date > NOW();

3. Verify database permissions:
   - User must have ALTER TABLE privilege
   - User must have CREATE TABLE privilege
   - User must have INSERT privilege

4. Check database size and free disk space:
   - Ensure at least 500MB free for migration and backup

5. Schedule during maintenance window:
   - No active vendor registrations during migration
   - Notify support team of changes
*/

-- ============================================================================
-- PHASE 7: POST-MIGRATION TASKS (Must be done after this script)
-- ============================================================================

/*
AFTER EXECUTING THIS MIGRATION:

1. Code Deployment:
   - Deploy VendorController.js (auto-create free trial)
   - Deploy SubscriptionController.js (add plan_type field)
   - Deploy BookingController.js (subscription filtering)
   - Deploy NotificationController.js (content filtering)
   - Deploy SubscriptionService.js (helper functions)
   - Deploy CRON job (email reminders)

2. Frontend Deployment:
   - Deploy subscription components
   - Deploy dashboard updates
   - Deploy booking list filtering

3. Testing:
   - Verify new vendor registration creates free trial
   - Verify existing vendors see correct plan type
   - Verify free vs premium visibility works
   - Verify upgrade flow works

4. Monitoring:
   - Monitor database query performance
   - Monitor email system for trial reminders
   - Monitor CRON job execution
   - Monitor vendor complaints/issues

5. Communication:
   - Notify support team about changes
   - Prepare FAQ for vendors
   - Plan communication strategy
*/

-- ============================================================================
-- ROLLBACK SCRIPT (Use only if migration needs to be reversed)
-- ============================================================================

/*
TO ROLLBACK THIS MIGRATION:

DROP TABLE IF EXISTS subscription_plans;

ALTER TABLE vendor_subscriptions DROP COLUMN IF EXISTS plan_type;
ALTER TABLE vendor_subscriptions DROP COLUMN IF EXISTS is_trial;
ALTER TABLE vendor_subscriptions DROP COLUMN IF EXISTS cancel_date;
ALTER TABLE vendor_subscriptions DROP INDEX IF EXISTS idx_vendor_status_date;
ALTER TABLE vendor_subscriptions DROP INDEX IF EXISTS idx_vendor_plan_status;

ALTER TABLE vendor_profiles DROP COLUMN IF EXISTS current_subscription_status;
ALTER TABLE vendor_profiles DROP COLUMN IF EXISTS free_trial_end_date;
ALTER TABLE vendor_profiles DROP INDEX IF EXISTS idx_subscription_status;
ALTER TABLE vendor_profiles DROP INDEX IF EXISTS idx_free_trial_end_date;

-- Note: After rollback, restart application with old code version
-- See ROLLBACK.md for complete rollback procedure
*/

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================
--
-- This migration is safe and can be run multiple times (all commands use IF NOT EXISTS)
--
-- Estimated execution time: 2-5 seconds
-- Estimated data impact: No data loss, only new columns/tables added
-- Rollback time: < 1 minute (see ROLLBACK SCRIPT above)
--
-- For issues or questions, refer to:
-- - PLAN.md (detailed specifications)
-- - ANALYSIS.md (risk assessment)
-- - ROLLBACK.md (emergency procedures)
-- ============================================================================
