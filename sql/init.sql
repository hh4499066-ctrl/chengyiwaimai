USE chengyiwaimai;

INSERT INTO sys_user(phone, nickname, role) VALUES
('13800000001', '张同学', 'customer'),
('13800000002', '王师傅', 'rider'),
('13800000003', '老刘商家', 'merchant'),
('13800000004', '平台管理员', 'admin');

INSERT INTO merchant(name, category, phone, address, audit_status, business_status, rating) VALUES
('老刘家招牌牛肉面', '面食简餐', '020-88886666', '学校东门美食街 12 号', 'approved', 'open', 4.8),
('橙意轻食研究所', '轻食沙拉', '020-88887777', '校园商业中心 2 楼', 'approved', 'open', 4.9);

INSERT INTO dish(merchant_id, category_name, name, description, price, stock, status) VALUES
(1, '招牌推荐', '招牌红烧牛肉面', '慢炖牛腱肉，搭配手工拉面和秘制红油。', 28.50, 99, 'on_sale'),
(1, '热销单品', '番茄肥牛拌面', '酸甜番茄汤底，肥牛鲜嫩。', 26.00, 99, 'on_sale'),
(1, '饮品', '冰柠檬茶', '清爽解腻，少冰少糖可选。', 9.00, 200, 'on_sale');

INSERT INTO coupon(name, threshold_amount, discount_amount, status) VALUES
('新人首单立减券', 20.00, 8.00, 'enabled'),
('校园夜宵满减券', 35.00, 6.00, 'enabled');

INSERT INTO marketing_activity(name, type, start_time, end_time, status) VALUES
('新客首单立减', 'coupon', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'enabled'),
('午餐高峰免配送费', 'delivery_fee', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'enabled');
