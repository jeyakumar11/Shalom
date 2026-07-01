// ═══════════════════════════════════════════════════════════════
// Direct Database Initializer - Run this locally to create tables
// Usage: node init-database.js
// ═══════════════════════════════════════════════════════════════

const { Pool } = require('pg');
require('dotenv').config();

// Hardcoded connection string (using direct connection, not pooler)
const POSTGRES_URL = 'postgresql://postgres:Jai@03@2002@db.uyisndbhhzinsxpbxfgy.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString: POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

async function initDatabase() {
  console.log('🚀 Starting database initialization...\n');
  console.log('📍 Connection:', POSTGRES_URL.replace(/:[^:@]+@/, ':****@'));
  
  try {
    // Test connection
    console.log('\n1️⃣ Testing connection...');
    const testResult = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connected to Postgres');
    console.log('   Time:', testResult.rows[0].current_time);
    console.log('   Version:', testResult.rows[0].pg_version.split(' ')[0] + ' ' + testResult.rows[0].pg_version.split(' ')[1]);
    
    // Drop existing tables (clean slate)
    console.log('\n2️⃣ Dropping existing tables (if any)...');
    await pool.query('DROP TABLE IF EXISTS stock_history CASCADE');
    await pool.query('DROP TABLE IF EXISTS products CASCADE');
    await pool.query('DROP TABLE IF EXISTS orders CASCADE');
    await pool.query('DROP TABLE IF EXISTS showcase_categories CASCADE');
    console.log('✅ Old tables removed');
    
    // Create Products Table
    console.log('\n3️⃣ Creating products table...');
    await pool.query(`
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
      )
    `);
    await pool.query('CREATE INDEX idx_products_category ON products(category)');
    await pool.query('CREATE INDEX idx_products_sku ON products(sku)');
    console.log('✅ Products table created');
    
    // Create Orders Table
    console.log('\n4️⃣ Creating orders table...');
    await pool.query(`
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
      )
    `);
    await pool.query('CREATE INDEX idx_orders_email ON orders(email)');
    await pool.query('CREATE INDEX idx_orders_order_id ON orders(order_id)');
    console.log('✅ Orders table created');
    
    // Create Showcase Categories Table
    console.log('\n5️⃣ Creating showcase_categories table...');
    await pool.query(`
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
      )
    `);
    console.log('✅ Showcase categories table created');
    
    // Create Stock History Table
    console.log('\n6️⃣ Creating stock_history table...');
    await pool.query(`
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
      )
    `);
    await pool.query('CREATE INDEX idx_stock_history_product ON stock_history(product_id, created_at DESC)');
    console.log('✅ Stock history table created');
    
    // Insert default showcase categories
    console.log('\n7️⃣ Inserting default showcase categories...');
    await pool.query(`
      INSERT INTO showcase_categories (name, subtitle, image, category, filter_tag, sort_order) VALUES
      ('College Wear', '', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', 'indian', 'college', 1),
      ('Ethnic Sarees', '', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', 'indian', 'saree', 2),
      ('Elegant Designs', '', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600', 'indian', '', 3),
      ('Mens Wear', '', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600', 'western', 'mens', 4),
      ('Christian Bridal', 'bridal wear', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', 'bridal', 'christian', 5),
      ('Bridal Wear', '', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', 'bridal', '', 6),
      ('Skirts', 'Contemporary/Fusion', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600', 'western', 'skirt', 7),
      ('Contemporary/Fusion', 'Modern Styles', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', 'western', '', 8)
    `);
    console.log('✅ 8 showcase categories inserted');
    
    // Migrate existing products from products.json
    console.log('\n8️⃣ Migrating products from products.json...');
    const fs = require('fs');
    const path = require('path');
    const productsFile = path.join(__dirname, 'products.json');
    
    if (fs.existsSync(productsFile)) {
      const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      
      if (products.length > 0) {
        for (const product of products) {
          await pool.query(
            `INSERT INTO products (name, category, price, stock, image, sku, barcode, sizes, description, fabric, occasion, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              product.name,
              product.category,
              product.price,
              product.stock,
              product.image,
              product.sku,
              product.barcode,
              JSON.stringify(product.sizes),
              product.description,
              product.fabric,
              product.occasion,
              product.created_at || new Date().toISOString(),
              product.updated_at || new Date().toISOString()
            ]
          );
          console.log(`   ✓ Migrated: ${product.name}`);
        }
        console.log(`✅ ${products.length} products migrated from JSON`);
      } else {
        console.log('⚠️  No products found in products.json');
      }
    } else {
      console.log('⚠️  products.json not found');
    }
    
    // Verify setup
    console.log('\n9️⃣ Verifying database setup...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('✅ Tables created:', tablesResult.rows.map(r => r.table_name).join(', '));
    
    const productsCount = await pool.query('SELECT COUNT(*) as count FROM products');
    const categoriesCount = await pool.query('SELECT COUNT(*) as count FROM showcase_categories');
    
    console.log(`✅ Products: ${productsCount.rows[0].count}`);
    console.log(`✅ Showcase categories: ${categoriesCount.rows[0].count}`);
    
    console.log('\n🎉 DATABASE INITIALIZATION COMPLETE!');
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Deploy to Vercel: vercel --prod');
    console.log('   2. Test adding a product from admin panel');
    console.log('   3. Products will now persist in Supabase forever!\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
