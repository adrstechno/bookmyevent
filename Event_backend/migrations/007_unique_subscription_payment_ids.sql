-- ============================================================================
-- MIGRATION: Prevent Duplicate Premium Activations For The Same Razorpay Payment
-- Purpose: Make payment verification/webhook retries idempotent at the database layer.
-- ============================================================================

ALTER TABLE vendor_subscriptions
ADD UNIQUE INDEX IF NOT EXISTS idx_unique_razorpay_payment_id (razorpay_payment_id);
