USE chengyiwaimai;
SET NAMES utf8mb4;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'merchant' AND COLUMN_NAME = 'notice') = 0,
  'ALTER TABLE merchant ADD COLUMN notice VARCHAR(500) NULL AFTER address',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS merchant_application (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  merchant_name VARCHAR(80) NOT NULL,
  contact_name VARCHAR(50) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  license_url VARCHAR(500),
  food_license_url VARCHAR(500),
  audit_status VARCHAR(20) DEFAULT 'pending',
  reject_reason VARCHAR(500),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_merchant_application_user_status (user_id, audit_status),
  KEY idx_merchant_application_audit_status (audit_status)
);

CREATE TABLE IF NOT EXISTS rider_certification (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  real_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  id_card VARCHAR(32) NOT NULL,
  vehicle_type VARCHAR(30) NOT NULL,
  id_card_front_url VARCHAR(500),
  id_card_back_url VARCHAR(500),
  audit_status VARCHAR(20) DEFAULT 'pending',
  reject_reason VARCHAR(500),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_rider_certification_user_status (user_id, audit_status),
  KEY idx_rider_certification_audit_status (audit_status)
);

CREATE TABLE IF NOT EXISTS user_wallet (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  frozen_amount DECIMAL(10,2) DEFAULT 0.00,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_wallet_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS user_points (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  points INT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_points_user_id (user_id)
);

INSERT INTO user_wallet(user_id, balance, frozen_amount)
SELECT id, 128.50, 0.00
FROM sys_user
WHERE phone = '13800000001'
ON DUPLICATE KEY UPDATE user_id = user_id;

INSERT INTO user_points(user_id, points)
SELECT id, 3450
FROM sys_user
WHERE phone = '13800000001'
ON DUPLICATE KEY UPDATE user_id = user_id;
