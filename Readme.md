CREATE TABLE Event_Managment.vendor_packages (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    package_uuid CHAR(36) NOT NULL UNIQUE,
    vendor_id INT NOT NULL,
    package_desc TEXT,
    amount DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    removed_at TIMESTAMP NULL DEFAULT NULL)
  ;

  CREATE TABLE event_booking (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_uuid VARCHAR(100) NOT NULL UNIQUE,

    user_id INT NOT NULL,
    vendor_id INT NOT NULL,
    shift_id INT NOT NULL,
    package_id INT NOT NULL,

    event_address VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,

    special_requirement TEXT DEFAULT NULL,

    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    admin_approval ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    removed_at TIMESTAMP NULL DEFAULT NULL
);


CREATE TABLE review_and_rating (
    rating_id INT PRIMARY KEY AUTO_INCREMENT,
    rating_uuid VARCHAR(100) NOT NULL UNIQUE,

    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    vendor_id INT NOT NULL,

    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);