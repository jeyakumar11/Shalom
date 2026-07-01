-- ═══════════════════════════════════════════════════════════════
-- SHALOM FASHION - COMPLETE DATABASE SETUP
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard/project/uyisndbhhzinsxpbxfgy/editor
-- ═══════════════════════════════════════════════════════════════

-- Clean slate (remove old tables if any)
DROP TABLE IF EXISTS stock_history CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS showcase_categories CASCADE;

-- ─── Products Table ────────────────────────────────────────────
CREATE TABLE products (
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

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);

-- ─── Orders Table ──────────────────────────────────────────────
CREATE TABLE orders (
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

CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_order_id ON orders(order_id);

-- ─── Showcase Categories Table ─────────────────────────────────
CREATE TABLE showcase_categories (
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
CREATE TABLE stock_history (
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

CREATE INDEX idx_stock_history_product ON stock_history(product_id, created_at DESC);

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
('Contemporary/Fusion', 'Modern Styles', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', 'western', '', 8);

-- ═══════════════════════════════════════════════════════════════
-- Verify Setup
-- ═══════════════════════════════════════════════════════════════

SELECT 'Database setup complete!' as message,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as tables_created,
       (SELECT COUNT(*) FROM showcase_categories) as showcase_categories;

-- ═══════════════════════════════════════════════════════════════
-- DONE! After running this:
-- 1. You should see: "Database setup complete!" message
-- 2. Tables created: 4
-- 3. Showcase categories: 8
-- 4. Run: vercel --prod (in your terminal)
-- 5. Products will now persist forever!
-- ═══════════════════════════════════════════════════════════════
