-- =============================================================================
-- TABLE: categories
-- =============================================================================
-- Stores product categories for browse/filter navigation.
--
-- Design Decisions:
--   - `slug` is a URL-friendly, lowercase, hyphenated version of `name`
--     (e.g. "Pain Relief" → "pain-relief"). It carries a UNIQUE constraint
--     so it can be used as a canonical URL segment without an extra lookup.
--   - `image` stores a relative path or CDN URL to the category banner image.
--     Storing image metadata in a separate table would be over-engineered for
--     this use case; a VARCHAR URL is sufficient.
--   - `is_active` supports soft-disable of entire categories (which effectively
--     hides all child products in that category from the storefront).
--   - `description` is TEXT (nullable) because not every category needs one.
--
-- Normalization:
--   - 3NF is satisfied — every non-key column depends solely on `id`.
--   - A self-referencing `parent_id` column could be added later for hierarchical
--     (nested) categories without restructuring this table.
--
-- Indexes:
--   - PRIMARY KEY on `id`           → clustered index
--   - UNIQUE KEY on `slug`          → enforces uniqueness + fast URL routing
--   - INDEX on `is_active`          → storefront queries filter by active only
--
-- Scalability Note:
--   Add `parent_id INT UNSIGNED NULL` + a self-FK to support sub-categories
--   (e.g. "Vitamins" → "Vitamin C"). Use a nested-set or closure-table pattern
--   for deep hierarchies.
-- =============================================================================

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
