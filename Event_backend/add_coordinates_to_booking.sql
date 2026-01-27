-- Add latitude and longitude columns to event_booking table
ALTER TABLE event_booking 
ADD COLUMN event_latitude DECIMAL(10, 8) NULL COMMENT 'Event location latitude',
ADD COLUMN event_longitude DECIMAL(11, 8) NULL COMMENT 'Event location longitude';

-- Add index for location-based queries
CREATE INDEX idx_event_location ON event_booking(event_latitude, event_longitude);