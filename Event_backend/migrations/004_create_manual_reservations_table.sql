-- Migration: Create manual_reservations table
-- Description: Stores manual shift reservations made by admins or vendors to block shifts
-- Created: 2026-05-02

CREATE TABLE IF NOT EXISTS manual_reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    shift_id INT NOT NULL,
    event_date DATE NOT NULL,
    reason VARCHAR(500) NULL DEFAULT 'Manual reservation',
    reserved_by VARCHAR(255) NOT NULL,
    reserved_by_type ENUM('admin', 'vendor') NOT NULL,
    status ENUM('active', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_manual_res_vendor FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(vendor_id) ON DELETE CASCADE,
    CONSTRAINT fk_manual_res_shift FOREIGN KEY (shift_id) REFERENCES vendor_shifts(shift_id) ON DELETE CASCADE,
    CONSTRAINT fk_manual_res_reserved_by FOREIGN KEY (reserved_by) REFERENCES users(uuid) ON DELETE RESTRICT,
    
    -- Unique constraint: prevent duplicate active reservations for same shift/date
    UNIQUE KEY uk_vendor_shift_date (vendor_id, shift_id, event_date, status),
    
    -- Indexes for common queries
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_shift_id (shift_id),
    INDEX idx_event_date (event_date),
    INDEX idx_status (status),
    INDEX idx_reserved_by (reserved_by),
    INDEX idx_vendor_status_date (vendor_id, status, event_date)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add table comment
ALTER TABLE manual_reservations COMMENT = 'Manual shift reservations to block vendor availability without a customer booking';

-- Add column comments
ALTER TABLE manual_reservations MODIFY COLUMN reason VARCHAR(500) COMMENT 'Reason for the manual reservation (optional)';
ALTER TABLE manual_reservations MODIFY COLUMN reserved_by_type ENUM('admin', 'vendor') COMMENT 'Type of user who created the reservation';
ALTER TABLE manual_reservations MODIFY COLUMN status ENUM('active', 'cancelled') COMMENT 'Current status of the reservation';
