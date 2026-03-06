-- Update vendor_subscriptions table to include payment details
ALTER TABLE vendor_subscriptions 
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) NULL,
ADD INDEX idx_razorpay_payment (razorpay_payment_id),
ADD INDEX idx_status_end_date (status, end_date);

-- Update existing subscriptions to set proper dates if needed
UPDATE vendor_subscriptions 
SET billing_cycle = 'annual' 
WHERE billing_cycle IS NULL OR billing_cycle = '';

-- Add constraint to ensure end_date is after start_date
ALTER TABLE vendor_subscriptions 
ADD CONSTRAINT chk_subscription_dates 
CHECK (end_date > start_date);