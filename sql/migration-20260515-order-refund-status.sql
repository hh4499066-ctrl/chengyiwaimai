USE chengyiwaimai;
SET NAMES utf8mb4;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_order' AND COLUMN_NAME = 'pay_status') = 0,
  'ALTER TABLE delivery_order ADD COLUMN pay_status VARCHAR(20) DEFAULT ''unpaid'' AFTER pay_method',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_order' AND COLUMN_NAME = 'refund_status') = 0,
  'ALTER TABLE delivery_order ADD COLUMN refund_status VARCHAR(20) DEFAULT ''none'' AFTER pay_status',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE delivery_order
SET pay_status = CASE
    WHEN status = '待支付' THEN 'unpaid'
    WHEN pay_method IS NOT NULL AND pay_method <> '' THEN 'paid'
    ELSE COALESCE(pay_status, 'unpaid')
  END,
  refund_status = COALESCE(refund_status, 'none')
WHERE pay_status IS NULL OR refund_status IS NULL;

SET @sql = IF((SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rider_certification' AND COLUMN_NAME = 'id_card') < 512,
  'ALTER TABLE rider_certification MODIFY COLUMN id_card VARCHAR(512) NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
