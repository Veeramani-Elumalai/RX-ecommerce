-- =============================================================================
-- TABLE: products
-- =============================================================================
-- Stores all sellable products in the catalogue.
--
-- Design Decisions:
--   - `category_id` is a FK to `categories.id`.
--       ON DELETE RESTRICT  → prevents accidental deletion of a category that
--                             still has products; the category must be emptied
--                             first. This is safer than CASCADE for products.
--       ON UPDATE CASCADE   → if the category PK is renumbered (rare), product
--                             rows follow automatically.
--   - `sku` (Stock Keeping Unit) is a unique alphanumeric code used by
--     warehouses and ERP systems. UNIQUE ensures no duplicate SKUs exist.
--   - `price` uses DECIMAL(10,2): up to 99,999,999.99 — never use FLOAT for
--     money because of IEEE-754 rounding errors.
--   - `stock` is INT UNSIGNED — stock can never be negative at the DB level.
--   - `slug` is unique and URL-safe, enabling SEO-friendly product pages.
--   - `image` stores a relative path or CDN URL (same reasoning as categories).
--   - `is_active` allows soft-deletion / draft state without losing order history.
--   - `description` is TEXT (nullable) for long-form product copy.
--
-- Normalization (3NF):
--   - All non-key attributes depend solely on `id`.
--   - `category_id` is a FK — no category data (name, slug) is duplicated here.
--
-- Indexes:
--   - PRIMARY KEY on `id`                   → clustered index
--   - UNIQUE KEY on `slug`                  → fast URL routing + uniqueness
--   - UNIQUE KEY on `sku`                   → stock / ERP uniqueness
--   - INDEX on `category_id`                → FK index; join products ↔ categories
--   - INDEX on `is_active`                  → storefront filters active products
--   - INDEX on `price`                      → price-range filter / sort queries
--   - INDEX on `stock`                      → low-stock admin dashboard queries
--
-- Scalability Notes:
--   - Add a FULLTEXT index on (`name`, `description`) for keyword search
--     (or migrate to Elasticsearch / MeiliSearch for production search).
--   - Add `discount_price DECIMAL(10,2)` and `discount_start` / `discount_end`
--     TIMESTAMP columns for promotional pricing without a separate table.
--   - For multi-image support, extract `image` to a `product_images` child table.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `products` (
    `id`          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    `category_id` INT UNSIGNED      NOT NULL,
    `name`        VARCHAR(250)      NOT NULL,
    `slug`        VARCHAR(270)      NOT NULL,
    `description` TEXT              NULL DEFAULT NULL,
    `sku`         VARCHAR(100)      NOT NULL,
    `price`       DECIMAL(10, 2)    NOT NULL,
    `stock`       INT UNSIGNED      NOT NULL DEFAULT 0,
    `image`       VARCHAR(500)      NULL DEFAULT NULL,
    `is_active`   TINYINT(1)        NOT NULL DEFAULT 1,
    `created_at`  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
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
