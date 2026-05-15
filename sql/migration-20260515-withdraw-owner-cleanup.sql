USE chengyiwaimai;

SET @sql = IF(
  (SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'withdraw_record' AND COLUMN_NAME = 'rider_id') = 'NO',
  'ALTER TABLE withdraw_record MODIFY COLUMN rider_id BIGINT NULL COMMENT ''历史兼容字段，真实归属以 owner_type + owner_id 为准''',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE withdraw_record SET owner_type = 'rider' WHERE owner_type IS NULL OR owner_type = '';
UPDATE withdraw_record SET owner_id = rider_id WHERE owner_id IS NULL AND rider_id IS NOT NULL;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'withdraw_record' AND COLUMN_NAME = 'operator_user_id') = 0,
  'ALTER TABLE withdraw_record ADD COLUMN operator_user_id BIGINT NULL COMMENT ''提交提现的登录用户 ID'' AFTER owner_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE withdraw_record
SET operator_user_id = CASE
  WHEN owner_type = 'rider' THEN owner_id
  ELSE operator_user_id
END
WHERE operator_user_id IS NULL;

SET @sql = IF(
  (SELECT COUNT(*) FROM withdraw_record WHERE owner_id IS NULL) = 0,
  'ALTER TABLE withdraw_record MODIFY COLUMN owner_id BIGINT NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM withdraw_record WHERE owner_type IS NULL OR owner_type = '''') = 0,
  'ALTER TABLE withdraw_record MODIFY COLUMN owner_type VARCHAR(20) NOT NULL DEFAULT ''rider'' COMMENT ''rider,merchant''',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
