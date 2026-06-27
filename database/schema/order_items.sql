-- =============================================================================
-- TABLE: order_items
-- =============================================================================
-- Stores the individual product line items that make up an order.
-- This is the most critical table for financial correctness.
--
-- Design Decisions:
--   - `order_id` FK:
--       ON DELETE CASCADE  → if an order is deleted (e.g., admin purge), its
--                            line items are meaningless and should be removed.
--                            In practice, orders should rarely be hard-deleted;
--                            use `status = 'cancelled'` instead.
--       ON UPDATE CASCADE  → PK renumber propagates.
--   - `product_id` FK:
--       ON DELETE RESTRICT → a product with existing order history must NOT be
--                            hard-deleted. Use `is_active = 0` on the product
--                            instead. This protects financial audit trails.
--       ON UPDATE CASCADE  → PK renumber propagates.
--   - `unit_price` DECIMAL(10,2): the price of the product AT THE TIME OF ORDER.
--     This is the most important design choice in this table. Product prices
--     change over time; storing `unit_price` here creates an immutable snapshot
--     of the price the customer actually paid. Never derive historical price
--     from `products.price`.
--   - `subtotal` DECIMAL(12,2): stored as `quantity × unit_price`, denormalized
--     for read performance and to preserve the exact charged amount (in case
--     rounding rules differ at calculation time vs. retrieval time).
--   - UNIQUE KEY on (`order_id`, `product_id`) ensures no duplicate product
--     rows within the same order (same reasoning as `cart_items`).
--   - `quantity` SMALLINT UNSIGNED with CHECK >= 1 for same reasons as cart_items.
--
-- Normalization Note:
--   - `subtotal` is technically derivable (quantity * unit_price). It is stored
--     as an intentional, justified denormalization — a performance optimization
--     and financial audit anchor. This is a common and accepted pattern in
--     transactional eCommerce databases (it mirrors how invoicing systems work).
--
-- Indexes:
--   - PRIMARY KEY on `id`
--   - UNIQUE KEY on (`order_id`, `product_id`)   → uniqueness + fast item lookup
--   - INDEX on `product_id`                      → FK index; product sales reports
--   - INDEX on `order_id`                        → fetch all items for an order
--
-- Scalability Notes:
--   - Add `discount_amount DECIMAL(10,2) DEFAULT 0.00` to track per-line
--     coupon/promotional discounts.
--   - Add `returned_quantity SMALLINT UNSIGNED DEFAULT 0` for partial returns /
--     RMA (Return Merchandise Authorization) workflows.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `order_items` (
    `id`         INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    `order_id`   INT UNSIGNED      NOT NULL,
    `product_id` INT UNSIGNED      NOT NULL,
    `quantity`   SMALLINT UNSIGNED NOT NULL,
    `unit_price` DECIMAL(10, 2)    NOT NULL,
    `subtotal`   DECIMAL(12, 2)    NOT NULL,
    `created_at` TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_order_items_order_product`  (`order_id`, `product_id`),
    INDEX `idx_order_items_order_id`           (`order_id`),
    INDEX `idx_order_items_product_id`         (`product_id`),

    CONSTRAINT `chk_order_items_quantity`
        CHECK (`quantity` >= 1),

    CONSTRAINT `chk_order_items_unit_price`
        CHECK (`unit_price` >= 0),

    CONSTRAINT `chk_order_items_subtotal`
        CHECK (`subtotal` >= 0),

    CONSTRAINT `fk_order_items_order`
        FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT `fk_order_items_product`
        FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Line items for each order — price snapshot at time of purchase';
