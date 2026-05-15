package com.chengyiwaimai.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(0)
public class DatabaseCompatibilityInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DatabaseCompatibilityInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseCompatibilityInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureMerchantColumns();
        ensureApplicationTables();
        ensureOrderColumns();
        ensureWithdrawColumns();
        ensureDemoFinanceRows();
    }

    private void ensureMerchantColumns() {
        addColumnIfMissing("merchant", "notice", "ALTER TABLE merchant ADD COLUMN notice VARCHAR(500) NULL AFTER address");
    }

    private void ensureApplicationTables() {
        execute("""
                CREATE TABLE IF NOT EXISTS merchant_application (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  user_id BIGINT NOT NULL,
                  merchant_name VARCHAR(80) NOT NULL,
                  contact_name VARCHAR(50) NOT NULL,
                  contact_phone VARCHAR(20) NOT NULL,
                  address VARCHAR(255) NOT NULL,
                  category VARCHAR(50),
                  license_url VARCHAR(500),
                  food_license_url VARCHAR(500),
                  audit_status VARCHAR(20) DEFAULT 'pending',
                  reject_reason VARCHAR(500),
                  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  KEY idx_merchant_application_user_status (user_id, audit_status),
                  KEY idx_merchant_application_audit_status (audit_status)
                )
                """);
        execute("""
                CREATE TABLE IF NOT EXISTS rider_certification (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  user_id BIGINT NOT NULL,
                  real_name VARCHAR(50) NOT NULL,
                  phone VARCHAR(20) NOT NULL,
                  id_card VARCHAR(512) NOT NULL,
                  vehicle_type VARCHAR(30) NOT NULL,
                  id_card_front_url VARCHAR(500),
                  id_card_back_url VARCHAR(500),
                  audit_status VARCHAR(20) DEFAULT 'pending',
                  reject_reason VARCHAR(500),
                  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  KEY idx_rider_certification_user_status (user_id, audit_status),
                  KEY idx_rider_certification_audit_status (audit_status)
                )
                """);
        execute("""
                CREATE TABLE IF NOT EXISTS user_wallet (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  user_id BIGINT NOT NULL,
                  balance DECIMAL(10,2) DEFAULT 0.00,
                  frozen_amount DECIMAL(10,2) DEFAULT 0.00,
                  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  UNIQUE KEY uk_user_wallet_user_id (user_id)
                )
                """);
        execute("""
                CREATE TABLE IF NOT EXISTS user_points (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  user_id BIGINT NOT NULL,
                  points INT DEFAULT 0,
                  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  UNIQUE KEY uk_user_points_user_id (user_id)
                )
                """);
        if (varcharLength("rider_certification", "id_card") < 512) {
            execute("ALTER TABLE rider_certification MODIFY COLUMN id_card VARCHAR(512) NOT NULL");
        }
    }

    private void ensureOrderColumns() {
        addColumnIfMissing("delivery_order", "pay_status",
                "ALTER TABLE delivery_order ADD COLUMN pay_status VARCHAR(20) DEFAULT 'unpaid' AFTER pay_method");
        addColumnIfMissing("delivery_order", "refund_status",
                "ALTER TABLE delivery_order ADD COLUMN refund_status VARCHAR(20) DEFAULT 'none' AFTER pay_status");
        execute("""
                UPDATE delivery_order
                SET pay_status = CASE
                    WHEN pay_status IS NOT NULL THEN pay_status
                    WHEN pay_method IS NOT NULL AND pay_method <> '' THEN 'paid'
                    ELSE 'unpaid'
                  END,
                  refund_status = COALESCE(refund_status, 'none')
                WHERE pay_status IS NULL OR refund_status IS NULL
                """);
    }

    private void ensureWithdrawColumns() {
        addColumnIfMissing("withdraw_record", "owner_type",
                "ALTER TABLE withdraw_record ADD COLUMN owner_type VARCHAR(20) DEFAULT 'rider' AFTER rider_id");
        addColumnIfMissing("withdraw_record", "owner_id",
                "ALTER TABLE withdraw_record ADD COLUMN owner_id BIGINT NULL AFTER owner_type");
        addColumnIfMissing("withdraw_record", "operator_user_id",
                "ALTER TABLE withdraw_record ADD COLUMN operator_user_id BIGINT NULL AFTER owner_id");
        if (!isNullable("withdraw_record", "rider_id")) {
            execute("ALTER TABLE withdraw_record MODIFY COLUMN rider_id BIGINT NULL");
        }
        execute("UPDATE withdraw_record SET owner_type = 'rider' WHERE owner_type IS NULL OR owner_type = ''");
        execute("UPDATE withdraw_record SET owner_id = rider_id WHERE owner_id IS NULL AND rider_id IS NOT NULL");
        execute("""
                UPDATE withdraw_record
                SET operator_user_id = CASE WHEN owner_type = 'rider' THEN owner_id ELSE operator_user_id END
                WHERE operator_user_id IS NULL
                """);
        if (!hasNullValues("withdraw_record", "owner_id")) {
            execute("ALTER TABLE withdraw_record MODIFY COLUMN owner_id BIGINT NOT NULL");
        }
        if (!hasNullValues("withdraw_record", "owner_type") && !hasBlankValues("withdraw_record", "owner_type")) {
            execute("ALTER TABLE withdraw_record MODIFY COLUMN owner_type VARCHAR(20) NOT NULL DEFAULT 'rider'");
        }
    }

    private void ensureDemoFinanceRows() {
        execute("""
                INSERT INTO user_wallet(user_id, balance, frozen_amount)
                SELECT id, 128.50, 0.00
                FROM sys_user
                WHERE phone = '13800000001'
                ON DUPLICATE KEY UPDATE user_id = user_id
                """);
        execute("""
                INSERT INTO user_points(user_id, points)
                SELECT id, 3450
                FROM sys_user
                WHERE phone = '13800000001'
                ON DUPLICATE KEY UPDATE user_id = user_id
                """);
    }

    private void addColumnIfMissing(String tableName, String columnName, String ddl) {
        if (!columnExists(tableName, columnName)) {
            execute(ddl);
        }
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND COLUMN_NAME = ?
                """, Integer.class, tableName, columnName);
        return count != null && count > 0;
    }

    private boolean isNullable(String tableName, String columnName) {
        String nullable = jdbcTemplate.queryForObject("""
                SELECT IS_NULLABLE
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND COLUMN_NAME = ?
                """, String.class, tableName, columnName);
        return "YES".equalsIgnoreCase(nullable);
    }

    private int varcharLength(String tableName, String columnName) {
        Integer length = jdbcTemplate.queryForObject("""
                SELECT COALESCE(CHARACTER_MAXIMUM_LENGTH, 0)
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND COLUMN_NAME = ?
                """, Integer.class, tableName, columnName);
        return length == null ? 0 : length;
    }

    private boolean hasNullValues(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM " + tableName + " WHERE " + columnName + " IS NULL",
                Integer.class
        );
        return count != null && count > 0;
    }

    private boolean hasBlankValues(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM " + tableName + " WHERE " + columnName + " = ''",
                Integer.class
        );
        return count != null && count > 0;
    }

    private void execute(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (RuntimeException ex) {
            log.warn("Database compatibility SQL skipped: {}", singleLine(sql), ex);
        }
    }

    private String singleLine(String sql) {
        return sql.replaceAll("\\s+", " ").trim();
    }
}
