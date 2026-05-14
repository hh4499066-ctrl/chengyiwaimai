USE chengyiwaimai;

ALTER TABLE delivery_order ADD COLUMN IF NOT EXISTS pay_method VARCHAR(30);
ALTER TABLE delivery_order ADD COLUMN IF NOT EXISTS coupon_id BIGINT;
ALTER TABLE delivery_order ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

CREATE TABLE IF NOT EXISTS dish_category (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  merchant_id BIGINT NOT NULL,
  name VARCHAR(50) NOT NULL,
  sort INT DEFAULT 1,
  deleted TINYINT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_dish_category_merchant_name (merchant_id, name),
  KEY idx_dish_category_merchant_id (merchant_id)
);

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketing_activity' AND COLUMN_NAME = 'merchant_id') = 0,
  'ALTER TABLE marketing_activity ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 0 AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE marketing_activity SET merchant_id = 0 WHERE merchant_id IS NULL;

DELETE a1 FROM marketing_activity a1
JOIN marketing_activity a2 ON a1.merchant_id = a2.merchant_id AND a1.name = a2.name AND a1.deleted = 0 AND a2.deleted = 0 AND a1.id > a2.id;

UPDATE marketing_activity
SET name = CONCAT(LEFT(name, 80 - CHAR_LENGTH(CONCAT('__deleted_', id))), '__deleted_', id)
WHERE deleted <> 0 AND name NOT LIKE '%__deleted_%';

ALTER TABLE marketing_activity MODIFY COLUMN merchant_id BIGINT NOT NULL DEFAULT 0;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketing_activity' AND INDEX_NAME = 'uk_marketing_activity_name') > 0, 'ALTER TABLE marketing_activity DROP INDEX uk_marketing_activity_name', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketing_activity' AND INDEX_NAME = 'uk_marketing_merchant_name') > 0, 'ALTER TABLE marketing_activity DROP INDEX uk_marketing_merchant_name', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketing_activity' AND INDEX_NAME = 'uk_marketing_merchant_name') = 0, 'ALTER TABLE marketing_activity ADD UNIQUE KEY uk_marketing_merchant_name (merchant_id, name, deleted)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS withdraw_record (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rider_id BIGINT NOT NULL,
  owner_type VARCHAR(20) DEFAULT 'rider',
  owner_id BIGINT,
  amount DECIMAL(10,2) NOT NULL,
  account_no VARCHAR(80) NOT NULL,
  status VARCHAR(20) DEFAULT 'submitted',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_withdraw_record_rider_id (rider_id),
  KEY idx_withdraw_record_owner (owner_type, owner_id)
);

ALTER TABLE withdraw_record ADD COLUMN IF NOT EXISTS owner_type VARCHAR(20) DEFAULT 'rider' AFTER rider_id;
ALTER TABLE withdraw_record ADD COLUMN IF NOT EXISTS owner_id BIGINT AFTER owner_type;
UPDATE withdraw_record SET owner_type = 'rider' WHERE owner_type IS NULL;
UPDATE withdraw_record SET owner_id = rider_id WHERE owner_id IS NULL;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'withdraw_record' AND INDEX_NAME = 'idx_withdraw_record_owner') = 0, 'ALTER TABLE withdraw_record ADD KEY idx_withdraw_record_owner (owner_type, owner_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
