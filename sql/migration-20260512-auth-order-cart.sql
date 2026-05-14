USE chengyiwaimai;

DELETE u1 FROM sys_user u1
JOIN sys_user u2 ON u1.phone = u2.phone AND u1.id > u2.id;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_user' AND INDEX_NAME = 'uk_sys_user_phone') = 0,
  'ALTER TABLE sys_user ADD UNIQUE KEY uk_sys_user_phone (phone)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'merchant' AND COLUMN_NAME = 'user_id') = 0,
  'ALTER TABLE merchant ADD COLUMN user_id BIGINT NULL AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE merchant
SET user_id = (SELECT id FROM sys_user WHERE phone = '13800000003' LIMIT 1)
WHERE id = 1 AND user_id IS NULL;

CREATE TABLE IF NOT EXISTS cart_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  dish_id BIGINT NOT NULL,
  dish_name VARCHAR(80) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'merchant' AND INDEX_NAME = 'idx_merchant_user_id') = 0, 'ALTER TABLE merchant ADD KEY idx_merchant_user_id (user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dish' AND INDEX_NAME = 'idx_dish_merchant_id') = 0, 'ALTER TABLE dish ADD KEY idx_dish_merchant_id (merchant_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_order' AND INDEX_NAME = 'idx_delivery_order_user_id') = 0, 'ALTER TABLE delivery_order ADD KEY idx_delivery_order_user_id (user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_order' AND INDEX_NAME = 'idx_delivery_order_merchant_id') = 0, 'ALTER TABLE delivery_order ADD KEY idx_delivery_order_merchant_id (merchant_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_order' AND INDEX_NAME = 'idx_delivery_order_rider_id') = 0, 'ALTER TABLE delivery_order ADD KEY idx_delivery_order_rider_id (rider_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_order' AND INDEX_NAME = 'idx_delivery_order_status') = 0, 'ALTER TABLE delivery_order ADD KEY idx_delivery_order_status (status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_order' AND INDEX_NAME = 'idx_delivery_order_create_time') = 0, 'ALTER TABLE delivery_order ADD KEY idx_delivery_order_create_time (create_time)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_item' AND INDEX_NAME = 'idx_order_item_order_id') = 0, 'ALTER TABLE order_item ADD KEY idx_order_item_order_id (order_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cart_item' AND INDEX_NAME = 'uk_cart_user_dish') = 0, 'ALTER TABLE cart_item ADD UNIQUE KEY uk_cart_user_dish (user_id, dish_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cart_item' AND INDEX_NAME = 'idx_cart_item_user_id') = 0, 'ALTER TABLE cart_item ADD KEY idx_cart_item_user_id (user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS user_address (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  receiver VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  detail VARCHAR(255) NOT NULL,
  is_default TINYINT DEFAULT 0,
  deleted TINYINT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_address' AND INDEX_NAME = 'idx_user_address_user_id') = 0, 'ALTER TABLE user_address ADD KEY idx_user_address_user_id (user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS review (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(36) NOT NULL,
  user_id BIGINT NOT NULL,
  merchant_id BIGINT,
  rating INT NOT NULL,
  content VARCHAR(500),
  reply VARCHAR(500),
  deleted TINYINT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'review' AND INDEX_NAME = 'uk_review_order_id') = 0, 'ALTER TABLE review ADD UNIQUE KEY uk_review_order_id (order_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'review' AND INDEX_NAME = 'idx_review_user_id') = 0, 'ALTER TABLE review ADD KEY idx_review_user_id (user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'review' AND INDEX_NAME = 'idx_review_merchant_id') = 0, 'ALTER TABLE review ADD KEY idx_review_merchant_id (merchant_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

DELETE c1 FROM coupon c1
JOIN coupon c2 ON c1.name = c2.name AND c1.id > c2.id;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'coupon' AND INDEX_NAME = 'uk_coupon_name') = 0, 'ALTER TABLE coupon ADD UNIQUE KEY uk_coupon_name (name)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketing_activity' AND COLUMN_NAME = 'merchant_id') = 0,
  'ALTER TABLE marketing_activity ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 0 AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE marketing_activity SET merchant_id = 0 WHERE merchant_id IS NULL;

DELETE a1 FROM marketing_activity a1
JOIN marketing_activity a2 ON a1.merchant_id = a2.merchant_id AND a1.name = a2.name AND a1.id > a2.id;

ALTER TABLE marketing_activity MODIFY COLUMN merchant_id BIGINT NOT NULL DEFAULT 0;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketing_activity' AND INDEX_NAME = 'uk_marketing_activity_name') > 0, 'ALTER TABLE marketing_activity DROP INDEX uk_marketing_activity_name', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketing_activity' AND INDEX_NAME = 'uk_marketing_merchant_name') = 0, 'ALTER TABLE marketing_activity ADD UNIQUE KEY uk_marketing_merchant_name (merchant_id, name)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
