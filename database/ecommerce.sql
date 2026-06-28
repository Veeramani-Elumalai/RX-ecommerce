-- =============================================================================
-- RX-eCommerce — Complete Database Schema
-- =============================================================================
-- File    : database/ecommerce.sql
-- Engine  : MySQL 8.0+  (InnoDB, utf8mb4)
-- Created : 2026
-- Author  : RX-eCommerce Engineering
--
-- CREATION ORDER (respects foreign key dependencies):
--   1. users          — no dependencies
--   2. categories     — no dependencies
--   3. products       — depends on categories
--   4. carts          — depends on users
--   5. cart_items     — depends on carts, products
--   6. orders         — depends on users
--   7. order_items    — depends on orders, products
--
-- RELATIONSHIP SUMMARY:
--   users        1 ──< carts         (one user has one active cart)
--   carts        1 ──< cart_items    (one cart has many items)
--   products     1 ──< cart_items    (one product appears in many carts)
--   categories   1 ──< products      (one category has many products)
--   users        1 ──< orders        (one user places many orders)
--   orders       1 ──< order_items   (one order has many line items)
--   products     1 ──< order_items   (one product appears in many orders)
--
-- FOREIGN KEY STRATEGY:
--   FK                        ON DELETE       ON UPDATE   Rationale
--   products.category_id      RESTRICT        CASCADE     Protect orphaned products
--   carts.user_id             CASCADE         CASCADE     Cart is transient; purge with user
--   cart_items.cart_id        CASCADE         CASCADE     Items meaningless without cart
--   cart_items.product_id     RESTRICT        CASCADE     Prevent losing active cart data
--   orders.user_id            RESTRICT        CASCADE     Financial records must be preserved
--   order_items.order_id      CASCADE         CASCADE     Items meaningless without order
--   order_items.product_id    RESTRICT        CASCADE     Financial audit trail protection
--
-- INDEXING STRATEGY:
--   - All FK columns are indexed (InnoDB requires it; improves join performance).
--   - UNIQUE indexes enforce business rules (one cart per user, unique SKU/slug).
--   - Additional indexes on high-cardinality filter columns: status, price, stock.
--   - created_at indexed on orders for date-range reporting.
--
-- NORMALIZATION:
--   - All tables are in 3NF: every non-key attribute depends solely on the PK.
--   - Two intentional, justified denormalizations:
--       1. orders.total_amount    — cached aggregate + financial audit anchor
--       2. order_items.subtotal   — quantity × unit_price snapshot for billing
--
-- MONETARY VALUES:
--   - All prices/amounts use DECIMAL, never FLOAT/DOUBLE, to avoid IEEE-754
--     floating-point rounding errors in financial calculations.
--
-- SCALABILITY NOTES (future improvements):
--   - Add `parent_id` self-FK on categories for hierarchical category trees.
--   - Add product_images table for multi-image support.
--   - Add FULLTEXT index on products(name, description) for keyword search.
--   - Add coupons / promotions tables for discount management.
--   - Add addresses table (normalised) as users build address books.
--   - Partition orders by created_at (RANGE) for high-volume stores.
--   - Add a product_reviews table (user_id, product_id, rating, body).
--   - Add soft-delete support (`deleted_at TIMESTAMP NULL`) where appropriate.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Safe setup
-- ---------------------------------------------------------------------------
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ---------------------------------------------------------------------------
-- 1. users
-- ---------------------------------------------------------------------------
-- Central identity table. Both customers and admins are stored here and
-- differentiated by the `role` ENUM column.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id`         INT UNSIGNED           NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(100)           NOT NULL,
    `last_name`  VARCHAR(100)           NOT NULL,
    `email`      VARCHAR(255)           NOT NULL,
    `password`   VARCHAR(255)           NOT NULL   COMMENT 'bcrypt / argon2 hash',
    `phone`      VARCHAR(20)            NULL DEFAULT NULL,
    `role`       ENUM('admin','customer') NOT NULL DEFAULT 'customer',
    `is_active`  TINYINT(1)             NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP              NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_email`     (`email`),
    INDEX `idx_users_role`          (`role`),
    INDEX `idx_users_is_active`     (`is_active`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Application users — both customers and administrators';


-- ---------------------------------------------------------------------------
-- 2. categories
-- ---------------------------------------------------------------------------
-- Product categories used for storefront navigation and filtering.
-- A slug column provides URL-safe routing (e.g., /category/pain-relief).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
    `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(150)  NOT NULL,
    `slug`        VARCHAR(160)  NOT NULL,
    `description` TEXT          NULL DEFAULT NULL,
    `image`       VARCHAR(500)  NULL DEFAULT NULL,
    `is_active`   TINYINT(1)    NOT NULL DEFAULT 1,
    `created_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_categories_slug`   (`slug`),
    INDEX `idx_categories_is_active`  (`is_active`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Product categories for storefront browsing and filtering';


-- ---------------------------------------------------------------------------
-- 3. products
-- ---------------------------------------------------------------------------
-- The product catalogue. Each product belongs to exactly one category.
-- FK: products.category_id → categories.id  (RESTRICT delete, CASCADE update)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
    `id`          INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    `category_id` INT UNSIGNED   NOT NULL,
    `name`        VARCHAR(250)   NOT NULL,
    `slug`        VARCHAR(270)   NOT NULL,
    `description` TEXT           NULL DEFAULT NULL,
    `sku`         VARCHAR(100)   NOT NULL,
    `price`       DECIMAL(10, 2) NOT NULL,
    `stock`       INT UNSIGNED   NOT NULL DEFAULT 0,
    `image`       VARCHAR(500)   NULL DEFAULT NULL,
    `is_active`   TINYINT(1)     NOT NULL DEFAULT 1,
    `created_at`  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_products_slug`        (`slug`),
    UNIQUE KEY `uq_products_sku`         (`sku`),
    INDEX `idx_products_category_id`     (`category_id`),
    INDEX `idx_products_is_active`       (`is_active`),
    INDEX `idx_products_price`           (`price`),
    INDEX `idx_products_stock`           (`stock`),

    CONSTRAINT `fk_products_category`
        FOREIGN KEY (`category_id`)
        REFERENCES `categories` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Product catalogue — each row is a unique sellable item';


-- ---------------------------------------------------------------------------
-- 4. carts
-- ---------------------------------------------------------------------------
-- Shopping cart header. One active cart per user (enforced by UNIQUE on user_id).
-- FK: carts.user_id → users.id  (CASCADE delete — cart is transient data)
-- ---------------------------------------------------------------------------
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


-- ---------------------------------------------------------------------------
-- 5. cart_items
-- ---------------------------------------------------------------------------
-- Line items within a shopping cart. Each (cart_id, product_id) pair is unique.
-- FK: cart_items.cart_id    → carts.id    (CASCADE delete)
-- FK: cart_items.product_id → products.id (RESTRICT delete — protect active carts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cart_items` (
    `id`         INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    `cart_id`    INT UNSIGNED      NOT NULL,
    `product_id` INT UNSIGNED      NOT NULL,
    `quantity`   SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
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


-- ---------------------------------------------------------------------------
-- 6. orders
-- ---------------------------------------------------------------------------
-- A confirmed purchase transaction. Shipping address is stored as a JSON
-- snapshot to preserve the exact delivery location at time of order.
-- FK: orders.user_id → users.id  (RESTRICT delete — financial records)
-- ---------------------------------------------------------------------------
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
    `shipping_address` JSON           NOT NULL
                           COMMENT 'Address snapshot: {name, line1, line2, city, state, zip, country}',
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


-- ---------------------------------------------------------------------------
-- 7. order_items
-- ---------------------------------------------------------------------------
-- Line items for a confirmed order. `unit_price` and `subtotal` are immutable
-- snapshots of the price at time of purchase — never derive from products.price.
-- FK: order_items.order_id   → orders.id   (CASCADE delete)
-- FK: order_items.product_id → products.id (RESTRICT delete — audit trail)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
    `id`         INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    `order_id`   INT UNSIGNED      NOT NULL,
    `product_id` INT UNSIGNED      NOT NULL,
    `quantity`   SMALLINT UNSIGNED NOT NULL,
    `unit_price` DECIMAL(10, 2)    NOT NULL
                     COMMENT 'Price per unit at time of order — immutable snapshot',
    `subtotal`   DECIMAL(12, 2)    NOT NULL
                     COMMENT 'quantity × unit_price — stored for billing accuracy',
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


-- ---------------------------------------------------------------------------
-- Re-enable FK checks
-- ---------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- SEED DATA (default login credentials)
-- Admin:    admin@rxecommerce.com    / admin123
-- Customer: customer@rxecommerce.com / customer123
-- =============================================================================

INSERT INTO `users` (`first_name`, `last_name`, `email`, `password`, `phone`, `role`, `is_active`) VALUES
('Admin', 'User', 'admin@rxecommerce.com', '$2b$10$hxMqggG2iFaLn6JkkFInq.tp/RIW9u3OrktuEDhlEo/rUn7.RCZHy', '+1-555-0100', 'admin', 1),
('Jane', 'Customer', 'customer@rxecommerce.com', '$2b$10$VXLUNNZYuhFxpycyd6gyUuuVyJAxVW2laf6svFjnqH487Um/r5uLm', '+1-555-0101', 'customer', 1);

INSERT INTO `categories` (`name`, `slug`, `description`, `is_active`) VALUES
('Electronics', 'electronics', 'Latest gadgets and tech accessories', 1),
('Fashion', 'fashion', 'Clothing, footwear, and accessories', 1),
('Home & Living', 'home-living', 'Furniture, decor, and kitchen essentials', 1),
('Health & Beauty', 'health-beauty', 'Skincare, wellness, and personal care', 1);

INSERT INTO `products` (`category_id`, `name`, `slug`, `description`, `sku`, `price`, `stock`, `image`, `is_active`) VALUES
(1, 'Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.', 'RX-ELEC-001', 79.99, 45, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', 1),
(1, 'Smart Watch Pro', 'smart-watch-pro', 'Fitness tracking, heart rate monitor, and smartphone notifications in a sleek design.', 'RX-ELEC-002', 149.99, 32, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop', 1),
(1, 'Portable Power Bank 20000mAh', 'portable-power-bank', 'Fast-charging power bank with dual USB ports and LED indicator.', 'RX-ELEC-003', 34.99, 120, 'https://images.unsplash.com/photo-1609091839311-9f2944b5e2c7?w=600&h=600&fit=crop', 1),
(2, 'Classic Denim Jacket', 'classic-denim-jacket', 'Timeless medium-wash denim jacket with a relaxed fit.', 'RX-FASH-001', 59.99, 28, 'https://images.unsplash.com/photo-1576995853123-5a10305d93b0?w=600&h=600&fit=crop', 1),
(2, 'Running Sneakers', 'running-sneakers', 'Lightweight breathable sneakers designed for daily runs and casual wear.', 'RX-FASH-002', 89.99, 55, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', 1),
(3, 'Ceramic Coffee Mug Set', 'ceramic-coffee-mug-set', 'Set of 4 handcrafted ceramic mugs in earthy tones.', 'RX-HOME-001', 24.99, 80, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca0d?w=600&h=600&fit=crop', 1),
(3, 'Minimalist Desk Lamp', 'minimalist-desk-lamp', 'Adjustable LED desk lamp with warm and cool light modes.', 'RX-HOME-002', 42.99, 38, 'https://images.unsplash.com/photo-1507473885765-e6ed92342304?w=600&h=600&fit=crop', 1),
(4, 'Organic Face Moisturizer', 'organic-face-moisturizer', 'Hydrating daily moisturizer with natural ingredients for all skin types.', 'RX-HB-001', 28.99, 65, 'https://images.unsplash.com/photo-1556228578-0d53b1c0c0b0?w=600&h=600&fit=crop', 1),
(4, 'Vitamin C Serum', 'vitamin-c-serum', 'Brightening serum with 20% vitamin C for radiant, even-toned skin.', 'RX-HB-002', 36.99, 50, 'https://images.unsplash.com/photo-1620916566395-611a2f4d6b0a?w=600&h=600&fit=crop', 1),
(1, 'USB-C Hub Adapter', 'usb-c-hub-adapter', '7-in-1 USB-C hub with HDMI, SD card reader, and fast data transfer.', 'RX-ELEC-004', 45.99, 8, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&h=600&fit=crop', 1);
