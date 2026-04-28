-- Migration: Extend notifications table for typed notifications
-- Description: Adds notification type and related booking linkage to support richer notification panels
-- Created: 2026-04-09

ALTER TABLE notifications
    ADD COLUMN type VARCHAR(80) NULL AFTER message;

ALTER TABLE notifications
    ADD COLUMN related_booking_id VARCHAR(255) NULL AFTER type;

CREATE INDEX idx_notifications_user_is_read_created
ON notifications (user_id, is_read, created_at);

CREATE INDEX idx_notifications_type
ON notifications (type);

CREATE INDEX idx_notifications_related_booking_id
ON notifications (related_booking_id);

-- Optional backfill for existing rows
UPDATE notifications
SET type = COALESCE(type, 'general')
WHERE type IS NULL;

-- Verification
-- SELECT id, user_id, title, message, type, related_booking_id, is_read, created_at FROM notifications ORDER BY created_at DESC LIMIT 10;

/*
Rollback:
ALTER TABLE notifications DROP INDEX idx_notifications_related_booking_id;
ALTER TABLE notifications DROP INDEX idx_notifications_type;
ALTER TABLE notifications DROP INDEX idx_notifications_user_is_read_created;
ALTER TABLE notifications DROP COLUMN related_booking_id;
ALTER TABLE notifications DROP COLUMN type;
*/
