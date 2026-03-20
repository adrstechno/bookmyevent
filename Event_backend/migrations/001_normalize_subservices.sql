-- ============================================================================
-- MIGRATION: Normalize Subservices Structure
-- Purpose: Remove duplicate subservices and create normalized structure
-- Date: 2026-03-20
-- Author: Senior Backend Developer
-- ============================================================================

-- STEP 1: Create subservices_master table (normalized unique subservices)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subservices_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subservice_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subservice_name (subservice_name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STEP 2: Create service_subservice_map (mapping table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_subservice_map (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_category_id INT NOT NULL,
    subservice_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_mapping (service_category_id, subservice_id),
    INDEX idx_service_category (service_category_id),
    INDEX idx_subservice (subservice_id),
    FOREIGN KEY (service_category_id) REFERENCES service_categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (subservice_id) REFERENCES subservices_master(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STEP 3: Migrate data from old subservices table to new structure
-- ============================================================================

-- 3.1: Insert unique subservices into subservices_master
INSERT INTO subservices_master (subservice_name, description, icon_url, is_active)
SELECT DISTINCT 
    subservice_name,
    description,
    icon_url,
    is_active
FROM subservices
WHERE subservice_name IS NOT NULL
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    icon_url = VALUES(icon_url),
    is_active = VALUES(is_active);

-- 3.2: Populate service_subservice_map with mappings
INSERT INTO service_subservice_map (service_category_id, subservice_id)
SELECT DISTINCT 
    s.service_category_id,
    sm.id
FROM subservices s
INNER JOIN subservices_master sm ON s.subservice_name = sm.subservice_name
WHERE s.service_category_id IS NOT NULL
ON DUPLICATE KEY UPDATE service_category_id = service_category_id;

-- STEP 4: Update vendor_profiles to use new subservice_id from subservices_master
-- ============================================================================

-- 4.1: Add temporary column to store new subservice_id
ALTER TABLE vendor_profiles 
ADD COLUMN new_subservice_id INT NULL AFTER subservice_id;

-- 4.2: Update vendor_profiles with correct subservice_id from subservices_master
UPDATE vendor_profiles vp
INNER JOIN subservices old_s ON vp.subservice_id = old_s.subservice_id
INNER JOIN subservices_master sm ON old_s.subservice_name = sm.subservice_name
SET vp.new_subservice_id = sm.id
WHERE vp.subservice_id IS NOT NULL;

-- 4.3: Drop old subservice_id column and rename new one
ALTER TABLE vendor_profiles DROP COLUMN subservice_id;
ALTER TABLE vendor_profiles CHANGE COLUMN new_subservice_id subservice_id INT NULL;

-- 4.4: Add foreign key constraint
ALTER TABLE vendor_profiles 
ADD CONSTRAINT fk_vendor_subservice 
FOREIGN KEY (subservice_id) REFERENCES subservices_master(id) ON DELETE SET NULL;

-- 4.5: Add index for performance
ALTER TABLE vendor_profiles ADD INDEX idx_subservice_id (subservice_id);

-- STEP 5: Rename old subservices table for backup (DO NOT DROP YET!)
-- ============================================================================
RENAME TABLE subservices TO subservices_backup_old;

-- STEP 6: Create view for backward compatibility (optional)
-- ============================================================================
CREATE OR REPLACE VIEW subservices AS
SELECT 
    ssm.id as subservice_id,
    ssm.service_category_id,
    sm.subservice_name,
    sm.description,
    sm.icon_url,
    sm.is_active,
    sm.created_at,
    sm.updated_at
FROM service_subservice_map ssm
INNER JOIN subservices_master sm ON ssm.subservice_id = sm.id;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify migration)
-- ============================================================================

-- Check unique subservices count
-- SELECT COUNT(*) as unique_subservices FROM subservices_master;

-- Check mappings count
-- SELECT COUNT(*) as total_mappings FROM service_subservice_map;

-- Check vendor profiles updated
-- SELECT COUNT(*) as vendors_with_subservice FROM vendor_profiles WHERE subservice_id IS NOT NULL;

-- Find any duplicates (should return 0)
-- SELECT subservice_name, COUNT(*) as count 
-- FROM subservices_master 
-- GROUP BY subservice_name 
-- HAVING count > 1;

-- ============================================================================
-- ROLLBACK SCRIPT (Use only if needed)
-- ============================================================================

/*
-- Restore old structure
DROP VIEW IF EXISTS subservices;
RENAME TABLE subservices_backup_old TO subservices;

-- Remove new tables
DROP TABLE IF EXISTS service_subservice_map;
DROP TABLE IF EXISTS subservices_master;

-- Restore vendor_profiles
ALTER TABLE vendor_profiles DROP FOREIGN KEY IF EXISTS fk_vendor_subservice;
ALTER TABLE vendor_profiles DROP COLUMN IF EXISTS subservice_id;
ALTER TABLE vendor_profiles ADD COLUMN subservice_id INT NULL;
-- Note: You'll need to restore the old subservice_id values from backup
*/
