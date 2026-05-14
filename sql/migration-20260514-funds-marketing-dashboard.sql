USE chengyiwaimai;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketing_activity' AND COLUMN_NAME = 'deleted') = 0,
  'ALTER TABLE marketing_activity ADD COLUMN deleted TINYINT DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE marketing_activity
SET merchant_id = 0
WHERE merchant_id IS NULL;

UPDATE marketing_activity
SET name = CONCAT(LEFT(name, 80 - CHAR_LENGTH(CONCAT('__deleted_', id))), '__deleted_', id)
WHERE deleted <> 0 AND name NOT LIKE '%__deleted_%';

DELETE a1 FROM marketing_activity a1
JOIN marketing_activity a2
  ON a1.merchant_id = a2.merchant_id
 AND a1.name = a2.name
 AND a1.deleted = 0
 AND a2.deleted = 0
 AND a1.id > a2.id;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketing_activity' AND INDEX_NAME = 'uk_marketing_activity_name') > 0, 'ALTER TABLE marketing_activity DROP INDEX uk_marketing_activity_name', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketing_activity' AND INDEX_NAME = 'uk_marketing_merchant_name') > 0, 'ALTER TABLE marketing_activity DROP INDEX uk_marketing_merchant_name', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketing_activity' AND INDEX_NAME = 'uk_marketing_merchant_name') = 0, 'ALTER TABLE marketing_activity ADD UNIQUE KEY uk_marketing_merchant_name (merchant_id, name)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_order' AND INDEX_NAME = 'idx_delivery_order_status_create_time') = 0, 'ALTER TABLE delivery_order ADD KEY idx_delivery_order_status_create_time (status, create_time)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_order' AND INDEX_NAME = 'idx_delivery_order_merchant_status') = 0, 'ALTER TABLE delivery_order ADD KEY idx_delivery_order_merchant_status (merchant_id, status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_order' AND INDEX_NAME = 'idx_delivery_order_rider_status') = 0, 'ALTER TABLE delivery_order ADD KEY idx_delivery_order_rider_status (rider_id, status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
