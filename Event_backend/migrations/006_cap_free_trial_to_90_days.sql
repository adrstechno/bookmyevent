-- ============================================================================
-- MIGRATION: Cap Free Trials at 90 Days
-- Purpose: Repair free-trial rows that were accidentally created with annual dates.
-- ============================================================================

UPDATE vendor_subscriptions
SET end_date = DATE_ADD(start_date, INTERVAL 90 DAY)
WHERE plan_type = 'free'
  AND DATE(end_date) > DATE(DATE_ADD(start_date, INTERVAL 90 DAY));

UPDATE vendor_profiles vp
JOIN (
  SELECT vendor_id, MAX(DATE_ADD(start_date, INTERVAL 90 DAY)) AS trial_end_date
  FROM vendor_subscriptions
  WHERE plan_type = 'free'
  GROUP BY vendor_id
) trial ON trial.vendor_id = vp.vendor_id
SET vp.free_trial_end_date = trial.trial_end_date
WHERE vp.current_subscription_status = 'free'
  AND (
    vp.free_trial_end_date IS NULL
    OR DATE(vp.free_trial_end_date) > DATE(trial.trial_end_date)
  );

UPDATE vendor_subscriptions
SET status = 'expired'
WHERE plan_type = 'free'
  AND status = 'active'
  AND DATE_ADD(start_date, INTERVAL 90 DAY) <= NOW();

UPDATE vendor_profiles vp
JOIN (
  SELECT vendor_id
  FROM vendor_subscriptions
  WHERE plan_type = 'free'
    AND status = 'expired'
  GROUP BY vendor_id
) expired_trial ON expired_trial.vendor_id = vp.vendor_id
LEFT JOIN vendor_subscriptions premium ON premium.vendor_id = vp.vendor_id
  AND premium.plan_type = 'premium'
  AND premium.status = 'active'
  AND premium.end_date > NOW()
SET vp.current_subscription_status = 'expired',
    vp.is_active = 0
WHERE premium.vendor_id IS NULL;
