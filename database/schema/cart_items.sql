-- =============================================================================
-- TABLE: cart_items
-- =============================================================================
-- Stores individual product line items within a shopping cart.
--
-- Design Decisions:
--   - `cart_id` FK:
--       ON DELETE CASCADE  → when a cart is deleted, all its line items are
--                            removed automatically. Cart items have no meaning
--                            without their parent cart.
--       ON UPDATE CASCADE  → defensive; PK renumber propagates.
--   - `product_id` FK:
--       ON DELETE RESTRICT → we do NOT want to cascade-delete cart items when
--                            a product is removed. Instead, restrict the delete
--                            so admins are forced to handle orphaned cart items
--                            first (e.g., remove from carts, then delete product).
--       ON UPDATE CASCADE  → PK renumber propagates.
--   - UNIQUE KEY on (`cart_id`, `product_id`) ensures that the same product
--     cannot appear twice in the same cart — the application must UPDATE
--     `quantity` rather than INSERT a duplicate row. This keeps cart totals
--     accurate and avoids double-counting.
--   - `quantity` is SMALLINT UNSIGNED: quantities are always positive and
--     unlikely to exceed 65,535 per line item (vs. INT saves 2 bytes per row).
--     A CHECK constraint enforces quantity ≥ 1.
--
-- NOTE: We intentionally do NOT store `unit_price` here. The cart is a
--       transient object; price is always read from `products.price` at
--       checkout time. Historical prices are captured in `order_items`.
--
-- Normalization:
--   - 3NF: every non-key attribute (`quantity`, `created_at`, `updated_at`)
--     depends only on the composite candidate key (cart_id, product_id)
--     and on the surrogate PK `id`.
--
-- Indexes:
--   - PRIMARY KEY on `id`
--   - UNIQUE KEY on (`cart_id`, `product_id`)  → uniqueness + fast item lookup
--   - INDEX on `product_id`                    → FK index; product delete checks
-- =============================================================================

CREATE TABLE IF NOT EXISTS `cart_items` (
    `id`         INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    `cart_id`    INT UNSIGNED   NOT NULL,
    `product_id` INT UNSIGNED   NOT NULL,
    `quantity`   SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_cart_items_cart_product`  (`cart_id`, `product_id`),
    INDEX `idx_cart_items_product_id`        (`product_id`),

    CONSTRAINT `chk_cart_items_quantity`
        CHECK (`quantity` >= 1),

    CONSTRAINT `fk_cart_items_cart`
        FOREIGN KEY (`cart_id`)
        REFERENCES `carts` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT `fk_cart_items_product`
        FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Line items within a shopping cart — one row per product per cart';
