// Add this to server.js as an admin endpoint to setup database remotely

const setupDatabaseEndpoint = async (req, res) => {
  // Security: Only allow with admin token
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  let client;
  const logs = [];
  
  try {
    logs.push('🔧 Connecting to database...');
    client = await pool.connect();
    logs.push('✅ Connected!');

    // Drop old tables
    logs.push('📊 Cleaning old tables...');
    await client.query('DROP TABLE IF EXISTS stock_history CASCADE');
    await client.query('DROP TABLE IF EXISTS products CASCADE');
    await client.query('DROP TABLE IF EXISTS orders CASCADE');
    await client.query('DROP TABLE IF EXISTS showcase_categories CASCADE');
    logs.push('✅ Cleaned');

    // Create products table
    logs.push('📊 Creating products table...');
    await client.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER DEFAULT 0,
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
    `);
    logs.push('✅ Products table created');

    // Create orders table
    logs.push('📊 Creating orders table...');
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
    `);
    logs.push('✅ Orders table created');

    // Create showcase_categories table
    logs.push('📊 Creating showcase_categories table...');
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
    logs.push('✅ Showcase categories table created');

    // Create stock_history table
    logs.push('📊 Creating stock_history table...');
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
    `);
    logs.push('✅ Stock history table created');

    // Insert default showcase categories
    logs.push('📊 Adding showcase categories...');
    await client.query(`
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
    logs.push('✅ 8 showcase categories added');

    logs.push('🎉 DATABASE SETUP COMPLETE!');
    
    client.release();
    await pool.end();

    res.json({ success: true, logs, message: 'Database setup complete!' });
    
  } catch (error) {
    logs.push(`❌ ERROR: ${error.message}`);
    if (client) client.release();
    await pool.end();
    res.status(500).json({ success: false, error: error.message, logs });
  }
};

// Export or add to server.js:
// app.post('/api/admin/setup-database', setupDatabaseEndpoint);
