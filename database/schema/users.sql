-- =============================================================================
-- TABLE: users
-- =============================================================================
-- Stores all application users: both customers and administrators.
--
-- Design Decisions:
--   - `role` uses ENUM('admin','customer') because the set of roles is small,
--     well-known, and unlikely to change. ENUM is stored efficiently as a 1-byte
--     integer internally by MySQL.
--   - `email` carries a UNIQUE constraint because it is the login identifier
--     and must be globally unique per user.
--   - `password` stores a bcrypt/argon2 hash (VARCHAR 255 is sufficient for any
--     modern hash output).
--   - `phone` is nullable — not every storefront requires a phone number at
--     registration time.
--   - `is_active` allows soft-disabling accounts without deleting rows, which
--     preserves referential integrity for orders/carts that reference a user.
--   - `updated_at` uses ON UPDATE CURRENT_TIMESTAMP so MySQL automatically
--     refreshes it on any row change.
--
-- Indexes:
--   - PRIMARY KEY on `id`           → clustered index, fast PK lookups
--   - UNIQUE KEY on `email`         → enforces uniqueness + speeds up login queries
--   - INDEX on `role`               → admin dashboards often filter users by role
--   - INDEX on `is_active`          → listing active/inactive users efficiently
-- =============================================================================

CREATE TABLE IF NOT EXISTS `users` (
    `id`         INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(100)      NOT NULL,
    `last_name`  VARCHAR(100)      NOT NULL,
    `email`      VARCHAR(255)      NOT NULL,
    `password`   VARCHAR(255)      NOT NULL,
    `phone`      VARCHAR(20)       NULL DEFAULT NULL,
    `role`       ENUM('admin','customer') NOT NULL DEFAULT 'customer',
    `is_active`  TINYINT(1)        NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_email`     (`email`),
    INDEX `idx_users_role`          (`role`),
    INDEX `idx_users_is_active`     (`is_active`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Application users — both customers and administrators';
