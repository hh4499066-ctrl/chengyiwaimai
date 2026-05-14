USE chengyiwaimai;
SET NAMES utf8mb4;

INSERT INTO sys_user(phone, password, nickname, role, status, deleted) VALUES
('13800000001', 'pbkdf2_sha256$120000$Y2hlbmd5aS1kZW1vLTIwMjY=$gV+4C7T9/gmzrWclngb6rqprJR8e7V1wCpNxT8apZ/I=', '张同学', 'customer', 1, 0),
('13800000002', 'pbkdf2_sha256$120000$Y2hlbmd5aS1kZW1vLTIwMjY=$gV+4C7T9/gmzrWclngb6rqprJR8e7V1wCpNxT8apZ/I=', '王师傅', 'rider', 1, 0),
('13800000003', 'pbkdf2_sha256$120000$Y2hlbmd5aS1kZW1vLTIwMjY=$gV+4C7T9/gmzrWclngb6rqprJR8e7V1wCpNxT8apZ/I=', '老刘商家', 'merchant', 1, 0),
('13800000004', 'pbkdf2_sha256$120000$Y2hlbmd5aS1kZW1vLTIwMjY=$gV+4C7T9/gmzrWclngb6rqprJR8e7V1wCpNxT8apZ/I=', '平台管理员', 'admin', 1, 0)
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  nickname = VALUES(nickname),
  role = VALUES(role),
  status = 1,
  deleted = 0;

INSERT INTO merchant(id, user_id, name, category, phone, address, audit_status, business_status, rating) VALUES
(1, (SELECT id FROM sys_user WHERE phone = '13800000003' LIMIT 1), '老刘家招牌牛肉面', '面食简餐', '020-88886666', '学校东门美食街 12 号', 'approved', 'open', 4.8),
(2, NULL, '橙意轻食研究所', '轻食沙拉', '020-88887777', '校园商业中心 2 楼', 'approved', 'open', 4.9)
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  name = VALUES(name),
  category = VALUES(category),
  phone = VALUES(phone),
  address = VALUES(address),
  audit_status = VALUES(audit_status),
  business_status = VALUES(business_status),
  rating = VALUES(rating),
  deleted = 0;

INSERT INTO dish(id, merchant_id, category_name, name, description, price, stock, status, deleted) VALUES
(101, 1, '招牌推荐', '招牌红烧牛肉面', '慢炖牛腱肉，搭配手工拉面和秘制红油。', 28.50, 99, 'on_sale', 0),
(102, 1, '热销单品', '番茄肥牛拌面', '酸甜番茄汤底，肥牛鲜嫩，适合晚餐。', 26.00, 99, 'on_sale', 0),
(103, 1, '饮品', '冰柠檬茶', '清爽解腻，少冰少糖可选。', 9.00, 200, 'on_sale', 0)
ON DUPLICATE KEY UPDATE
  merchant_id = VALUES(merchant_id),
  category_name = VALUES(category_name),
  name = VALUES(name),
  description = VALUES(description),
  price = VALUES(price),
  stock = VALUES(stock),
  status = VALUES(status),
  deleted = 0;

INSERT INTO dish_category(merchant_id, name, sort, deleted) VALUES
(1, '招牌推荐', 1, 0),
(1, '热销单品', 2, 0),
(1, '饮品', 3, 0)
ON DUPLICATE KEY UPDATE sort = VALUES(sort), deleted = 0;

INSERT INTO user_address(user_id, receiver, phone, detail, is_default)
SELECT id, '张同学', '13800000001', '学校东门 3 号宿舍楼 502', 1
FROM sys_user
WHERE phone = '13800000001'
  AND NOT EXISTS (
    SELECT 1 FROM user_address WHERE user_id = sys_user.id AND detail = '学校东门 3 号宿舍楼 502'
  );

INSERT INTO coupon(name, threshold_amount, discount_amount, status, deleted) VALUES
('新人首单立减券', 20.00, 8.00, 'enabled', 0),
('校园夜宵满减券', 35.00, 6.00, 'enabled', 0)
ON DUPLICATE KEY UPDATE
  threshold_amount = VALUES(threshold_amount),
  discount_amount = VALUES(discount_amount),
  status = VALUES(status),
  deleted = 0;

INSERT INTO user_coupon(user_id, coupon_id, merchant_id, status, valid_start, valid_end)
SELECT u.id, c.id, 0, 'claimed', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)
FROM sys_user u
JOIN coupon c ON c.status = 'enabled' AND c.deleted = 0
WHERE u.phone = '13800000001'
  AND NOT EXISTS (
    SELECT 1 FROM user_coupon uc
    WHERE uc.user_id = u.id AND uc.coupon_id = c.id AND uc.status = 'claimed'
  );

INSERT INTO marketing_activity(merchant_id, name, type, start_time, end_time, status, deleted) VALUES
(0, '新客首单立减', 'coupon', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'enabled', 0),
(0, '午餐高峰免配送费', 'delivery_fee', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'enabled', 0)
ON DUPLICATE KEY UPDATE
  type = VALUES(type),
  start_time = VALUES(start_time),
  end_time = VALUES(end_time),
  status = VALUES(status),
  deleted = 0;
