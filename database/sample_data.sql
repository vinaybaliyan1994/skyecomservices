-- SkyEcomServices Sample Data
-- Run schema.sql first before running this file

USE skyecomservices;

-- Admin User (password: Admin@123)
INSERT INTO admin_users (name, email, password, role, is_active, created_at, updated_at) VALUES
('Super Admin', 'admin@skyecom.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 1, NOW(), NOW());

-- Categories
INSERT INTO categories (name, slug, description, is_active, sort_order, created_at, updated_at) VALUES
('Furniture', 'furniture', 'Home and office furniture', 1, 1, NOW(), NOW()),
('Electronics', 'electronics', 'Gadgets and electronics', 1, 2, NOW(), NOW()),
('Home Decor', 'home-decor', 'Decorative items for your home', 1, 3, NOW(), NOW()),
('Kitchen', 'kitchen', 'Kitchen appliances and accessories', 1, 4, NOW(), NOW()),
('Lighting', 'lighting', 'Indoor and outdoor lighting', 1, 5, NOW(), NOW()),
('Bedding', 'bedding', 'Bed sheets, pillows and more', 1, 6, NOW(), NOW());

-- Sub-categories
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order, created_at, updated_at) VALUES
('Sofas', 'sofas', 'Living room sofas and couches', 1, 1, 1, NOW(), NOW()),
('Beds', 'beds', 'Single, double and king size beds', 1, 1, 2, NOW(), NOW()),
('TV & Audio', 'tv-audio', 'Televisions and audio systems', 2, 1, 1, NOW(), NOW()),
('Laptops', 'laptops', 'Laptops and notebooks', 2, 1, 2, NOW(), NOW());

-- Products
INSERT INTO products (name, slug, description, specifications, price, sale_price, discount_percentage, category_id, brand, sku, is_active, is_featured, rating, review_count, created_at, updated_at) VALUES
('Luxe 3-Seater Sofa', 'luxe-3-seater-sofa', 'Premium fabric sofa with wooden legs and comfortable cushioning. Perfect for living rooms.', 'Dimensions: 220x85x90cm\nMaterial: Premium Fabric\nColor: Grey\nLegs: Solid Wood\nWarranty: 2 Years', 35999.00, 28999.00, 19.45, 1, 'FurniturePlus', 'FP-SOFA-001', 1, 1, 4.50, 24, NOW(), NOW()),
('Modern Study Desk', 'modern-study-desk', 'Minimalist study desk with storage drawers. Ideal for home office and study rooms.', 'Dimensions: 120x60x75cm\nMaterial: Engineered Wood\nFinish: Walnut\nDrawers: 2\nWarranty: 1 Year', 12999.00, 9999.00, 23.08, 1, 'WorkSpace', 'WS-DESK-001', 1, 1, 4.20, 15, NOW(), NOW()),
('Samsung 55" 4K Smart TV', 'samsung-55-4k-smart-tv', 'Crystal clear 4K display with Smart TV features, built-in apps and voice control.', 'Display: 55 inch 4K UHD\nResolution: 3840x2160\nHDR: HDR10+\nSmart TV: Yes\nOS: Tizen\nWarranty: 1 Year', 54999.00, 44999.00, 18.18, 9, 'Samsung', 'SAM-TV-55-4K', 1, 1, 4.70, 89, NOW(), NOW()),
('Bosch Cordless Drill', 'bosch-cordless-drill', 'Professional cordless drill for home improvement and construction projects.', 'Power: 18V\nSpeed: 0-450/1500 RPM\nTorque: 30Nm\nChuck: 13mm\nBattery: Li-Ion\nWarranty: 2 Years', 7999.00, NULL, 0, 2, 'Bosch', 'BOSCH-DRILL-18V', 1, 0, 4.30, 42, NOW(), NOW()),
('Himalaya Ortho Mattress', 'himalaya-ortho-mattress', 'Orthopedic memory foam mattress for superior back support and comfort.', 'Size: Queen (60x78 inches)\nThickness: 6 inches\nMaterial: Memory Foam + Coir\nCover: Removable & Washable\nWarranty: 5 Years', 18999.00, 14999.00, 21.05, 8, 'SleepWell', 'SW-MATTRESS-Q6', 1, 1, 4.60, 156, NOW(), NOW()),
('Artisan Wall Clock', 'artisan-wall-clock', 'Handcrafted wooden wall clock with silent movement. A statement piece for any wall.', 'Diameter: 40cm\nMaterial: Teak Wood\nMovement: Silent Quartz\nBattery: AA x1\nWarranty: 6 months', 2499.00, 1999.00, 20.01, 3, 'ArtHome', 'AH-CLOCK-40', 1, 0, 4.10, 32, NOW(), NOW()),
('Prestige Induction Cooktop', 'prestige-induction-cooktop', '2200W induction cooktop with 8 power levels and automatic shut-off for safety.', 'Power: 2200W\nVoltage: 230V\nPower Levels: 8\nTimer: 3 Hours\nWeight: 1.5kg\nWarranty: 1 Year', 3499.00, 2799.00, 20.01, 4, 'Prestige', 'PRE-IC-2200', 1, 1, 4.40, 67, NOW(), NOW()),
('Philips LED Floor Lamp', 'philips-led-floor-lamp', 'Energy-efficient LED floor lamp with adjustable brightness and color temperature.', 'Power: 24W\nBrightness: 2000 lm\nCCT: 2700K-6500K\nDimmable: Yes\nHeight: 150cm\nWarranty: 2 Years', 4999.00, NULL, 0, 5, 'Philips', 'PHL-LAMP-FL24', 1, 0, 4.20, 28, NOW(), NOW());

-- Product Images (placeholder URLs)
INSERT INTO product_images (product_id, image_path, alt_text, is_primary, sort_order, created_at, updated_at) VALUES
(1, 'https://via.placeholder.com/600x500?text=Luxe+Sofa', 'Luxe 3-Seater Sofa', 1, 1, NOW(), NOW()),
(2, 'https://via.placeholder.com/600x500?text=Study+Desk', 'Modern Study Desk', 1, 1, NOW(), NOW()),
(3, 'https://via.placeholder.com/600x500?text=Samsung+4K+TV', 'Samsung 55 4K TV', 1, 1, NOW(), NOW()),
(4, 'https://via.placeholder.com/600x500?text=Bosch+Drill', 'Bosch Cordless Drill', 1, 1, NOW(), NOW()),
(5, 'https://via.placeholder.com/600x500?text=Ortho+Mattress', 'Himalaya Ortho Mattress', 1, 1, NOW(), NOW()),
(6, 'https://via.placeholder.com/600x500?text=Wall+Clock', 'Artisan Wall Clock', 1, 1, NOW(), NOW()),
(7, 'https://via.placeholder.com/600x500?text=Induction+Cooktop', 'Prestige Induction Cooktop', 1, 1, NOW(), NOW()),
(8, 'https://via.placeholder.com/600x500?text=Floor+Lamp', 'Philips LED Floor Lamp', 1, 1, NOW(), NOW());

-- Inventory
INSERT INTO inventory (product_id, quantity, reserved_quantity, low_stock_threshold, created_at, updated_at) VALUES
(1, 50, 0, 5, NOW(), NOW()),
(2, 75, 0, 10, NOW(), NOW()),
(3, 30, 0, 5, NOW(), NOW()),
(4, 100, 0, 15, NOW(), NOW()),
(5, 45, 0, 5, NOW(), NOW()),
(6, 200, 0, 20, NOW(), NOW()),
(7, 80, 0, 10, NOW(), NOW()),
(8, 60, 0, 10, NOW(), NOW());
