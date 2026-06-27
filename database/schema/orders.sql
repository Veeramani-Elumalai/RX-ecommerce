-- =============================================================================
-- TABLE: orders
-- =============================================================================
-- Represents a confirmed purchase transaction placed by a user.
--
-- Design Decisions:
--   - `user_id` FK:
--       ON DELETE RESTRICT  → we must NEVER silently delete order history when
--                             a user account is removed. Orders are financial
--                             records. Force admins to handle this explicitly
--                             (e.g., anonymise the user rather than hard-delete).
--       ON UPDATE CASCADE   → PK renumber propagates automatically.
--   - `status` uses ENUM for the order fulfilment lifecycle. The values are
--     well-known and bounded. ENUM stores as a 1-2 byte integer internally.
--       pending    → order placed, awaiting confirmation
--       confirmed  → payment verified, ready to fulfil
--       processing → being picked/packed
--       shipped    → dispatched to courier
--       delivered  → received by customer
--       cancelled  → cancelled before dispatch
--       refunded   → payment returned after delivery
--   - `payment_status` uses ENUM for the payment lifecycle, separate from
--     order fulfilment status (they evolve independently):
--       unpaid     → awaiting payment
--       paid       → payment captured
--       failed     → payment attempt failed
--       refunded   → payment reversed
--   - `total_amount` DECIMAL(12,2) — slightly wider than product price to
--     accommodate order totals (sum of items + shipping + taxes).
--   - `shipping_address` is stored as JSON, capturing the full address snapshot
--     at order time. This is deliberate: if a user later changes their address,
--     the historical order must retain the original shipping destination.
--     JSON also avoids a complex address normalisation table for this scope.
--
-- Normalization:
--   - 3NF: all non-key columns depend solely on `id`.
--   - `total_amount` is technically derivable from `order_items`, but it is
--     stored here as a denormalized cache for performance and as an audit
--     anchor (it captures the charged amount at transaction time, which may
--     differ if discounts/coupons are applied).
--
-- Indexes:
--   - PRIMARY KEY on `id`
--   - INDEX on `user_id`            → "my orders" page — fetch all orders by user
--   - INDEX on `status`             → admin order management filtered by status
--   - INDEX on `payment_status`     → payment reconciliation queries
--   - INDEX on `created_at`         → date-range reporting / sorting
--
-- Scalability Notes:
--   - Add `coupon_id INT UNSIGNED NULL` FK to a `coupons` table for discount tracking.
--   - Add `shipping_cost DECIMAL(10,2)` and `tax_amount DECIMAL(10,2)` columns
--     for itemised totals breakdown.
--   - Add `tracking_number VARCHAR(100)` for courier integration.
--   - For high-volume stores, partition this table by `created_at` (RANGE partitioning
--     by year/month) to keep hot data in the latest partition.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `orders` (
    `id`               INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    `user_id`          INT UNSIGNED   NOT NULL,
    `total_amount`     DECIMAL(12, 2) NOT NULL,
    `status`           ENUM(
                           'pending',
                           'confirmed',
                           'processing',
                           'shipped',
                           'delivered',
                           'cancelled',
                           'refunded'
                       ) NOT NULL DEFAULT 'pending',
    `payment_status`   ENUM(
                           'unpaid',
                           'paid',
                           'failed',
                           'refunded'
                       ) NOT NULL DEFAULT 'unpaid',
    `shipping_address` JSON           NOT NULL,
    `created_at`       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `idx_orders_user_id`        (`user_id`),
    INDEX `idx_orders_status`         (`status`),
    INDEX `idx_orders_payment_status` (`payment_status`),
    INDEX `idx_orders_created_at`     (`created_at`),

    CONSTRAINT `fk_orders_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Confirmed customer orders — one row per purchase transaction';
