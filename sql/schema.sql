CREATE DATABASE IF NOT EXISTS chengyiwaimai DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chengyiwaimai;

CREATE TABLE IF NOT EXISTS sys_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255),
  nickname VARCHAR(50),
  role VARCHAR(20) NOT NULL COMMENT 'customer,rider,merchant,admin',
  status TINYINT DEFAULT 1,
  deleted TINYINT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_sys_user_phone (phone)
);

CREATE TABLE IF NOT EXISTS merchant (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  name VARCHAR(80) NOT NULL,
  category VARCHAR(50),
  phone VARCHAR(20),
  address VARCHAR(255),
  audit_status VARCHAR(20) DEFAULT 'pending',
  business_status VARCHAR(20) DEFAULT 'open',
  rating DECIMAL(3,1) DEFAULT 5.0,
  deleted TINYINT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_merchant_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS dish (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  merchant_id BIGINT NOT NULL,
  category_name VARCHAR(50),
  name VARCHAR(80) NOT NULL,
  description VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 999,
  status VARCHAR(20) DEFAULT 'on_sale',
  deleted TINYINT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_dish_merchant_id (merchant_id)
);

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

CREATE TABLE IF NOT EXISTS delivery_order (
  id VARCHAR(36) PRIMARY KEY,
  user_id BIGINT,
  merchant_id BIGINT,
  rider_id BIGINT,
  total_amount DECIMAL(10,2) NOT NULL,
  address VARCHAR(255),
  status VARCHAR(30) NOT NULL,
  remark VARCHAR(255),
  pay_method VARCHAR(30),
  coupon_id BIGINT,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  deleted TINYINT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_delivery_order_user_id (user_id),
  KEY idx_delivery_order_merchant_id (merchant_id),
  KEY idx_delivery_order_rider_id (rider_id),
  KEY idx_delivery_order_status (status),
  KEY idx_delivery_order_create_time (create_time),
  KEY idx_delivery_order_status_create_time (status, create_time),
  KEY idx_delivery_order_merchant_status (merchant_id, status),
  KEY idx_delivery_order_rider_status (rider_id, status)
);

CREATE TABLE IF NOT EXISTS order_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(36) NOT NULL,
  dish_id BIGINT NOT NULL,
  dish_name VARCHAR(80) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  KEY idx_order_item_order_id (order_id)
);

CREATE TABLE IF NOT EXISTS cart_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  dish_id BIGINT NOT NULL,
  dish_name VARCHAR(80) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_cart_user_dish (user_id, dish_id),
  KEY idx_cart_item_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS user_address (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  receiver VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  detail VARCHAR(255) NOT NULL,
  is_default TINYINT DEFAULT 0,
  deleted TINYINT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_user_address_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS coupon (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  threshold_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'enabled',
  deleted TINYINT DEFAULT 0,
  UNIQUE KEY uk_coupon_name (name)
);

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
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_user_coupon_user_status (user_id, status),
  KEY idx_user_coupon_coupon_id (coupon_id),
  KEY idx_user_coupon_status (status),
  KEY idx_user_coupon_order_id (used_order_id)
);

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
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_review_order_id (order_id),
  KEY idx_review_user_id (user_id),
  KEY idx_review_merchant_id (merchant_id),
  CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT chk_review_content_not_blank CHECK (content IS NOT NULL AND CHAR_LENGTH(TRIM(content)) > 0)
);

CREATE TABLE IF NOT EXISTS marketing_activity (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  merchant_id BIGINT NOT NULL DEFAULT 0,
  name VARCHAR(80) NOT NULL,
  type VARCHAR(30) NOT NULL,
  start_time DATETIME,
  end_time DATETIME,
  status VARCHAR(20) DEFAULT 'enabled',
  deleted TINYINT DEFAULT 0,
  UNIQUE KEY uk_marketing_merchant_name (merchant_id, name),
  KEY idx_marketing_activity_merchant_id (merchant_id)
);

CREATE TABLE IF NOT EXISTS withdraw_record (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rider_id BIGINT COMMENT '历史兼容字段，真实归属以 owner_type + owner_id 为准',
  owner_type VARCHAR(20) NOT NULL DEFAULT 'rider' COMMENT 'rider,merchant',
  owner_id BIGINT NOT NULL,
  operator_user_id BIGINT COMMENT '提交提现的登录用户 ID',
  amount DECIMAL(10,2) NOT NULL,
  account_no VARCHAR(512) NOT NULL,
  status VARCHAR(20) DEFAULT 'submitted',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_withdraw_record_rider_id (rider_id),
  KEY idx_withdraw_record_owner (owner_type, owner_id)
);
