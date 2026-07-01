// ═══════════════════════════════════════════════════════════════
// ADMIN SCRIPT - Complete Database Setup + Migration
// Run this to set up your Supabase database completely
// ═══════════════════════════════════════════════════════════════

const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000
});

async function setupDatabase() {
  console.log('\n🔧 TAKING ADMIN CONTROL - Setting up Supabase database...\n');
  
  let client;
  try {
    // Step 1: Connect
    console.log('📊 Step 1: Connecting to Supabase...');
    client = await pool.connect();
    console.log('✅ Connected successfully!\n');
    
    // Step 2: Drop existing tables if any (clean slate)
    console.log('📊 Step 2: Cleaning up old tables...');
    await client.query('DROP TABLE IF EXISTS stock_history CASCADE;');
    await client.query('DROP TABLE IF EXISTS products CASCADE;');
    await client.query('DROP TABLE IF EXISTS orders CASCADE;');
    await client.query('DROP TABLE IF EXISTS showcase_categories CASCADE;');
    console.log('✅ Old tables dropped\n');
    
    // Step 3: Create products table
    console.log('📊 Step 3: Creating products table...');
    await client.query(`
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
    `);
    console.log('✅ Products table created\n');
    
    // Step 4: Create orders table
    console.log('📊 Step 4: Creating orders table...');
    await client.query(`
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
    `);
    console.log('✅ Orders table created\n');
    
    // Step 5: Create showcase_categories table
    console.log('📊 Step 5: Creating showcase_categories table...');
    await client.query(`
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
    `);
    console.log('✅ Showcase categories table created\n');
    
    // Step 6: Create stock_history table
    console.log('📊 Step 6: Creating stock_history table...');
    await client.query(`
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
    `);
    console.log('✅ Stock history table created\n');
    
    // Step 7: Insert default showcase categories
    console.log('📊 Step 7: Adding default showcase categories...');
    await client.query(`
      INSERT INTO showcase_categories (name, subtitle, image, category, filter_tag, sort_order) VALUES
      ('College Wear', '', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', 'indian', 'college', 1),
      ('Ethnic Sarees', '', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', 'indian', 'saree', 2),
      ('Elegant Designs', '', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600', 'indian', '', 3),
      ('Mens Wear', '', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600', 'western', 'mens', 4),
      ('Christian Bridal', 'bridal wear', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', 'bridal', 'christian', 5),
      ('Bridal Wear', '', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', 'bridal', '', 6),
      ('Skirts', 'Contemporary/Fusion', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600', 'western', 'skirt', 7),
      ('Contemporary/Fusion', 'Modern Styles', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', 'western', '', 8);
    `);
    console.log('✅ 8 showcase categories added\n');
    
    // Step 8: Migrate existing products from JSON
    console.log('📊 Step 8: Migrating existing products from JSON...');
    const productsJSON = JSON.parse(fs.readFileSync('products.json', 'utf8'));
    
    for (let i = 0; i < productsJSON.length; i++) {
      const p = productsJSON[i];
      const uniqueSKU = `${p.sku}-${String.fromCharCode(65 + i)}`; // A, B, C
      const uniqueBarcode = `${p.barcode}-${String.fromCharCode(65 + i)}`;
      
      await client.query(`
        INSERT INTO products (name, description, category, price, stock, sku, barcode, fabric, occasion, sizes, image, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        p.name,
        p.description,
        p.category,
        p.price,
        p.stock,
        uniqueSKU,
        uniqueBarcode,
        p.fabric,
        p.occasion,
        JSON.stringify(p.sizes),
        p.image,
        p.created_at,
        p.updated_at
      ]);
      
      console.log(`   ✅ Migrated: ${p.name} (SKU: ${uniqueSKU})`);
    }
    console.log(`✅ ${productsJSON.length} products migrated\n`);
    
    // Step 9: Verify setup
    console.log('📊 Step 9: Verifying setup...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('products', 'orders', 'showcase_categories', 'stock_history')
      ORDER BY table_name;
    `);
    console.log(`✅ Tables created: ${tablesResult.rows.map(r => r.table_name).join(', ')}`);
    
    const productsResult = await client.query('SELECT COUNT(*) as count FROM products');
    console.log(`✅ Products in database: ${productsResult.rows[0].count}`);
    
    const showcaseResult = await client.query('SELECT COUNT(*) as count FROM showcase_categories');
    console.log(`✅ Showcase categories: ${showcaseResult.rows[0].count}`);
    
    console.log('\n🎉 DATABASE SETUP COMPLETE!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All tables created');
    console.log('✅ Products migrated from JSON');
    console.log('✅ Showcase categories added');
    console.log('✅ Database ready for production');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🚀 Next steps:');
    console.log('1. Run: vercel --prod');
    console.log('2. Test: curl https://shalom-six.vercel.app/api/debug/env');
    console.log('3. Should see: "mode": "postgres", "postgres_connected": true\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

// Run the setup
setupDatabase();
