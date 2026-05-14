USE chengyiwaimai;

ALTER TABLE sys_user MODIFY COLUMN password VARCHAR(255);
ALTER TABLE withdraw_record MODIFY COLUMN account_no VARCHAR(512) NOT NULL;

UPDATE sys_user
SET password = 'pbkdf2_sha256$120000$Y2hlbmd5aS1kZW1vLTIwMjY=$gV+4C7T9/gmzrWclngb6rqprJR8e7V1wCpNxT8apZ/I='
WHERE password IS NULL OR password = '';

CREATE TABLE IF NOT EXISTS user_coupon (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  coupon_id BIGINT NOT NULL,
  merchant_id BIGINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'claimed',
  valid_start DATETIME,
  valid_end DATETIME,
  used_order_id VARCHAR(36),
  used_time DATETIME,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_coupon' AND INDEX_NAME = 'idx_user_coupon_user_status') = 0, 'ALTER TABLE user_coupon ADD KEY idx_user_coupon_user_status (user_id, status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_coupon' AND INDEX_NAME = 'idx_user_coupon_coupon_id') = 0, 'ALTER TABLE user_coupon ADD KEY idx_user_coupon_coupon_id (coupon_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_coupon' AND INDEX_NAME = 'idx_user_coupon_status') = 0, 'ALTER TABLE user_coupon ADD KEY idx_user_coupon_status (status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_coupon' AND INDEX_NAME = 'idx_user_coupon_order_id') = 0, 'ALTER TABLE user_coupon ADD KEY idx_user_coupon_order_id (used_order_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO user_coupon(user_id, coupon_id, merchant_id, status, valid_start, valid_end)
SELECT u.id, c.id, 0, 'claimed', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)
FROM sys_user u
JOIN coupon c ON c.status = 'enabled' AND c.deleted = 0
WHERE u.phone = '13800000001'
  AND NOT EXISTS (
    SELECT 1 FROM user_coupon uc
    WHERE uc.user_id = u.id AND uc.coupon_id = c.id AND uc.status = 'claimed'
  );

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'review' AND CONSTRAINT_NAME = 'chk_review_rating') = 0, 'ALTER TABLE review ADD CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'review' AND CONSTRAINT_NAME = 'chk_review_content_not_blank') = 0, 'ALTER TABLE review ADD CONSTRAINT chk_review_content_not_blank CHECK (content IS NOT NULL AND CHAR_LENGTH(TRIM(content)) > 0)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
