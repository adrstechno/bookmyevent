-- Create manual_reservations table for admin/vendor to reserve shifts
CREATE TABLE IF NOT EXISTS manual_reservations (
  reservation_id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  shift_id INT NOT NULL,
  event_date DATE NOT NULL,
  reason TEXT,
  reserved_by VARCHAR(255),
  reserved_by_type ENUM('admin', 'vendor') NOT NULL,
  status ENUM('active', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(vendor_id),
  FOREIGN KEY (shift_id) REFERENCES vendor_shifts(shift_id),
  INDEX idx_vendor_date (vendor_id, event_date),
  INDEX idx_status (status)
);
