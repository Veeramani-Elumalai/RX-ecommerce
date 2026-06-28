-- =============================================================================
-- RX-eCommerce — Seed Data
-- Run AFTER ecommerce.sql:  mysql -u root -p rx_ecommerce < database/seed.sql
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Default credentials:
--   Admin:    admin@rxecommerce.com    / admin123
--   Customer: customer@rxecommerce.com / customer123

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

SET FOREIGN_KEY_CHECKS = 1;
