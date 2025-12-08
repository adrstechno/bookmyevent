-- ============================================
-- DATABASE SCHEMA FOR EVENT BOOKING SYSTEM
-- ============================================
-- 
-- NOTE: This file creates tables with IF NOT EXISTS
-- It will NOT drop or delete your existing data
-- Safe to run on existing databases
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    user_type ENUM('customer', 'vendor', 'admin') DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_uuid (uuid),
    INDEX idx_user_type (user_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. SERVICE CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS service_categories (
    service_category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_name (category_name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. VENDOR PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vendor_profiles (
    vendor_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    service_category_id INT NOT NULL,
    description TEXT,
    years_experience INT,
    contact VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_url VARCHAR(500),
    event_profiles_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (service_category_id) REFERENCES service_categories(service_category_id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_service_category (service_category_id),
    INDEX idx_city (city),
    INDEX idx_is_verified (is_verified),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. VENDOR SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vendor_subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    billing_cycle ENUM('monthly', 'quarterly', 'annual') DEFAULT 'monthly',
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(vendor_id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. EVENT IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS Event_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    imageUrl VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(vendor_id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. VENDOR SHIFTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vendor_shifts (
    shift_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    shift_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days_of_week JSON NOT NULL COMMENT 'Array of days: ["Monday", "Tuesday", etc.]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(vendor_id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. VENDOR PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vendor_packages (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    package_uuid VARCHAR(255) UNIQUE NOT NULL,
    vendor_id INT NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    package_desc TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    removed_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(vendor_id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_package_uuid (package_uuid),
    INDEX idx_removed_at (removed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. EVENT BOOKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_uuid VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    vendor_id INT NOT NULL,
    shift_id INT NOT NULL,
    package_id INT NOT NULL,
    event_address TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    special_requirement TEXT,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    admin_approval ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    removed_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(vendor_id) ON DELETE RESTRICT,
    FOREIGN KEY (shift_id) REFERENCES vendor_shifts(shift_id) ON DELETE RESTRICT,
    FOREIGN KEY (package_id) REFERENCES vendor_packages(package_id) ON DELETE RESTRICT,
    INDEX idx_booking_uuid (booking_uuid),
    INDEX idx_user_id (user_id),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_event_date (event_date),
    INDEX idx_status (status),
    INDEX idx_admin_approval (admin_approval)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. BOOKING OTP TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS booking_otp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id VARCHAR(255),
    vendor_id INT,
    otp VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    generated_by ENUM('user', 'vendor') DEFAULT 'user',
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES event_booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(vendor_id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_otp (otp),
    INDEX idx_is_used (is_used),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. NOTIFICATIONS TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA (OPTIONAL)
-- ============================================

-- Insert sample service categories
INSERT INTO service_categories (category_name, description, icon_url, is_active) VALUES
('Photography', 'Professional photography services for events', 'https://example.com/icons/photography.png', TRUE),
('Catering', 'Food and beverage services', 'https://example.com/icons/catering.png', TRUE),
('DJ & Music', 'Music and entertainment services', 'https://example.com/icons/music.png', TRUE),
('Decoration', 'Event decoration and setup', 'https://example.com/icons/decoration.png', TRUE),
('Venue', 'Event venue rental services', 'https://example.com/icons/venue.png', TRUE);

-- ============================================
-- END OF SCHEMA
-- ============================================
