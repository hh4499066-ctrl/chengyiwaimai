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

ALTER TABLE marketing_activity ADD COLUMN IF NOT EXISTS merchant_id BIGINT;

CREATE TABLE IF NOT EXISTS withdraw_record (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rider_id BIGINT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  account_no VARCHAR(80) NOT NULL,
  status VARCHAR(20) DEFAULT 'submitted',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_withdraw_record_rider_id (rider_id)
);
