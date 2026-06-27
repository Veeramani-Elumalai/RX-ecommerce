-- =============================================================================
-- TABLE: carts
-- =============================================================================
-- Represents a shopping cart session owned by a single user.
--
-- Design Decisions:
--   - A cart is a 1:1 relationship with a user in a simple model: each user
--     has at most one active cart at a time. This is enforced by the UNIQUE
--     KEY on `user_id`.
--   - Separating the cart header (this table) from cart line items (`cart_items`)
--     is a deliberate 3NF / normalization decision — cart-level metadata
--     (timestamps, session data) lives here; product-level data lives in
--     `cart_items`.
--   - `user_id` FK:
--       ON DELETE CASCADE  → when a user account is deleted, their cart and
--                            all cart items are automatically removed. This is
--                            safe because carts are transient, pre-order data.
--       ON UPDATE CASCADE  → PK renumber propagates automatically (defensive).
--
-- Normalization:
--   - All non-key columns (`user_id`, `created_at`, `updated_at`) depend only
--     on the PK `id`. Fully 3NF.
--
-- Indexes:
--   - PRIMARY KEY on `id`               → clustered index
--   - UNIQUE KEY on `user_id`           → enforces one-cart-per-user rule;
--                                         also serves as a covering index for
--                                         "fetch cart by user" queries.
--
-- Scalability Notes:
--   - To support guest/anonymous carts, add a nullable `session_token VARCHAR(128)`
--     column and allow `user_id` to be NULL. Merge guest cart into user cart on login.
--   - Add a `status ENUM('active','abandoned','converted')` column to support
--     cart-abandonment recovery workflows.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `carts` (
    `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `user_id`    INT UNSIGNED  NOT NULL,
    `created_at` TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_carts_user_id`  (`user_id`),

    CONSTRAINT `fk_carts_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Shopping cart header — one active cart per registered user';
