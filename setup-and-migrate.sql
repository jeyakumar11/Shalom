-- ═══════════════════════════════════════════════════════════════
-- Shalom Fashion - Complete Database Setup + Migrate Existing Products
-- Run this ENTIRE script in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Products Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('indian', 'western', 'bridal', 'accessories')),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  image VARCHAR(500),
  sku VARCHAR(100) UNIQUE NOT NULL,
  barcode VARCHAR(100) UNIQUE,
  sizes JSONB DEFAULT '[]',
  description TEXT,
  fabric VARCHAR(100),
  occasion VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- ─── Orders Table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_street TEXT,
  address_city VARCHAR(100),
  address_state VARCHAR(100),
  address_pin VARCHAR(10),
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2),
  gst DECIMAL(10, 2),
  total DECIMAL(10, 2),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50),
  payment_id VARCHAR(100),
  order_date VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);

-- ─── Showcase Categories Table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS showcase_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  image VARCHAR(500),
  category VARCHAR(50),
  filter_tag VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── Stock History Table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255),
  old_stock INTEGER,
  new_stock INTEGER,
  change_amount INTEGER,
  change_reason VARCHAR(255),
  order_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- Insert Default Showcase Categories
-- ═══════════════════════════════════════════════════════════════

INSERT INTO showcase_categories (name, subtitle, image, category, filter_tag, sort_order) VALUES
('College Wear', '', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', 'indian', 'college', 1),
('Ethnic Sarees', '', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', 'indian', 'saree', 2),
('Elegant Designs', '', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600', 'indian', '', 3),
('Mens Wear', '', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600', 'western', 'mens', 4),
('Christian Bridal', 'bridal wear', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', 'bridal', 'christian', 5),
('Bridal Wear', '', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', 'bridal', '', 6),
('Skirts', 'Contemporary/Fusion', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600', 'western', 'skirt', 7),
('Contemporary/Fusion', 'Modern Styles', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', 'western', '', 8)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Migrate Existing Products from JSON
-- ═══════════════════════════════════════════════════════════════

-- Product 1: sasd
INSERT INTO products (name, description, category, price, stock, sku, barcode, fabric, occasion, sizes, image, created_at, updated_at) 
VALUES (
  'sasd',
  'ijug',
  'indian',
  23,
  23,
  'EAR-RED-001-A',
  '1234567897456-A',
  'Satin',
  'Casual, Party, Festive, Wedding',
  '["Free Size"]'::jsonb,
  'https://res.cloudinary.com/djn3eb2ht/image/upload/v1782879165/shalom-fashion/products/product-1782879162407-677727411.jpg',
  '2026-07-01 04:12:47',
  '2026-07-01 04:12:47'
) ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  image = EXCLUDED.image,
  updated_at = NOW();

-- Product 2: sasd (duplicate name, different SKU)
INSERT INTO products (name, description, category, price, stock, sku, barcode, fabric, occasion, sizes, image, created_at, updated_at) 
VALUES (
  'sasd',
  'frasdfa',
  'indian',
  23,
  23,
  'EAR-RED-001-B',
  '1234567897456-B',
  'Satin',
  'Casual, Party, Festive, Wedding',
  '["Free Size"]'::jsonb,
  'https://res.cloudinary.com/djn3eb2ht/image/upload/v1782897722/shalom-fashion/products/product-1782897717869-320251735.jpg',
  '2026-07-01 09:22:02',
  '2026-07-01 09:22:02'
) ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  image = EXCLUDED.image,
  updated_at = NOW();

-- Product 3: bridal christian
INSERT INTO products (name, description, category, price, stock, sku, barcode, fabric, occasion, sizes, image, created_at, updated_at) 
VALUES (
  'bridal christian',
  'bridal',
  'indian',
  23,
  23,
  'EAR-RED-001-C',
  '1234567897456-C',
  'Satin',
  'Casual, Party, Festive, Wedding',
  '["Free Size"]'::jsonb,
  'https://res.cloudinary.com/djn3eb2ht/image/upload/v1782898758/shalom-fashion/products/product-1782898754091-225758445.jpg',
  '2026-07-01 09:39:19',
  '2026-07-01 09:39:19'
) ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  image = EXCLUDED.image,
  updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════
-- Verify Setup
-- ═══════════════════════════════════════════════════════════════

-- Show all tables created
SELECT 
  'Tables Created' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'orders', 'showcase_categories', 'stock_history');

-- Show products migrated
SELECT 
  'Products Migrated' as status,
  COUNT(*) as product_count,
  STRING_AGG(name, ', ') as products
FROM products;

-- Show showcase categories
SELECT 
  'Showcase Categories' as status,
  COUNT(*) as category_count
FROM showcase_categories;

-- ═══════════════════════════════════════════════════════════════
-- DONE! Database setup complete with migrated products
-- ═══════════════════════════════════════════════════════════════
