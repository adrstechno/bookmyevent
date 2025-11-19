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

  