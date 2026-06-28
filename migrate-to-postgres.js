// ═══════════════════════════════════════════════════════════════
// Migration Script: JSON → Vercel Postgres
// Run this ONCE after setting up Vercel Postgres to transfer data
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sql } = require('@vercel/postgres');

const PRODUCTS_JSON = path.join(__dirname, 'products.json');
const ORDERS_JSON = path.join(__dirname, 'orders.json');
const SHOWCASE_JSON = path.join(__dirname, 'showcase-categories.json');

// ═══════════════════════════════════════════════════════════════
// Main Migration Function
// ═══════════════════════════════════════════════════════════════

async function migrate() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   Shalom Fashion - Database Migration to Postgres        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // Check environment variables
    if (!process.env.POSTGRES_URL) {
      throw new Error('❌ POSTGRES_URL environment variable not set!\nAdd it from Vercel Dashboard → Storage → Postgres');
    }

    console.log('✅ Connected to Vercel Postgres');
    console.log('📍 Database:', process.env.POSTGRES_URL.split('@')[1].split('/')[0], '\n');

    // Migrate products
    await migrateProducts();

    // Migrate orders
    await migrateOrders();

    // Migrate showcase categories
    await migrateShowcase();

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ Migration Complete!                                  ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log('Next steps:');
    console.log('1. Update server.js to use new database modules');
    console.log('2. Deploy to Vercel: vercel --prod');
    console.log('3. Test all features on production\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('- Ensure POSTGRES_URL is set in .env or Vercel dashboard');
    console.error('- Run the database-schema.sql in Vercel Postgres dashboard first');
    console.error('- Check that JSON files exist and are valid\n');
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════
// Migrate Products
// ═══════════════════════════════════════════════════════════════

async function migrateProducts() {
  console.log('═══ Migrating Products ═══');

  if (!fs.existsSync(PRODUCTS_JSON)) {
    console.log('⚠️  No products.json found - skipping products migration');
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
    const products = data.products || [];

    if (products.length === 0) {
      console.log('⚠️  No products to migrate');
      return;
    }

    console.log(`📦 Found ${products.length} products to migrate...`);

    let successCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Check if product already exists (by SKU)
        const existing = await sql`
          SELECT id FROM products WHERE sku = ${product.sku}
        `;

        if (existing.rows.length > 0) {
          console.log(`⏭️  Product "${product.name}" already exists (SKU: ${product.sku})`);
          continue;
        }

        // Insert product
        await sql`
          INSERT INTO products (
            name, category, price, stock, image,
            sku, barcode, sizes, description, fabric, occasion,
            created_at, updated_at
          ) VALUES (
            ${product.name},
            ${product.category},
            ${product.price},
            ${product.stock || 0},
            ${product.image || null},
            ${product.sku},
            ${product.barcode || null},
            ${JSON.stringify(product.sizes || [])}::jsonb,
            ${product.description || null},
            ${product.fabric || null},
            ${product.occasion || null},
            ${product.created_at || new Date().toISOString()},
            ${product.updated_at || new Date().toISOString()}
          )
        `;

        successCount++;
        console.log(`✅ Migrated: ${product.name} (${product.category})`);

      } catch (err) {
        errorCount++;
        console.error(`❌ Failed to migrate "${product.name}":`, err.message);
      }
    }

    console.log(`\n📊 Products Migration Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error reading products.json:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// Migrate Orders
// ═══════════════════════════════════════════════════════════════

async function migrateOrders() {
  console.log('═══ Migrating Orders ═══');

  if (!fs.existsSync(ORDERS_JSON)) {
    console.log('⚠️  No orders.json found - skipping orders migration');
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(ORDERS_JSON, 'utf8'));
    const orders = data.orders || [];

    if (orders.length === 0) {
      console.log('⚠️  No orders to migrate');
      return;
    }

    console.log(`📦 Found ${orders.length} orders to migrate...`);

    let successCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      try {
        // Check if order already exists
        const existing = await sql`
          SELECT id FROM orders WHERE order_id = ${order.order_id}
        `;

        if (existing.rows.length > 0) {
          console.log(`⏭️  Order "${order.order_id}" already exists`);
          continue;
        }

        // Insert order
        await sql`
          INSERT INTO orders (
            order_id, customer_name, email, phone,
            address_street, address_city, address_state, address_pin,
            items, subtotal, gst, total,
            payment_method, payment_status, payment_id, order_date,
            created_at
          ) VALUES (
            ${order.order_id},
            ${order.customer_name},
            ${order.email},
            ${order.phone},
            ${order.address_street},
            ${order.address_city},
            ${order.address_state},
            ${order.address_pin},
            ${order.items}::jsonb,
            ${order.subtotal},
            ${order.gst},
            ${order.total},
            ${order.payment_method},
            ${order.payment_status},
            ${order.payment_id || null},
            ${order.order_date},
            ${order.created_at || new Date().toISOString()}
          )
        `;

        successCount++;
        console.log(`✅ Migrated: ${order.order_id} (${order.customer_name})`);

      } catch (err) {
        errorCount++;
        console.error(`❌ Failed to migrate order "${order.order_id}":`, err.message);
      }
    }

    console.log(`\n📊 Orders Migration Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error reading orders.json:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// Migrate Showcase Categories
// ═══════════════════════════════════════════════════════════════

async function migrateShowcase() {
  console.log('═══ Migrating Showcase Categories ═══');

  if (!fs.existsSync(SHOWCASE_JSON)) {
    console.log('⚠️  No showcase-categories.json found - using defaults from schema');
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(SHOWCASE_JSON, 'utf8'));
    const categories = data.categories || [];

    if (categories.length === 0) {
      console.log('⚠️  No showcase categories to migrate - using defaults');
      return;
    }

    console.log(`📦 Found ${categories.length} showcase categories to migrate...`);

    let successCount = 0;
    let errorCount = 0;

    for (const cat of categories) {
      try {
        // Check if category already exists
        const existing = await sql`
          SELECT id FROM showcase_categories WHERE name = ${cat.name}
        `;

        if (existing.rows.length > 0) {
          console.log(`⏭️  Category "${cat.name}" already exists`);
          continue;
        }

        // Insert category
        await sql`
          INSERT INTO showcase_categories (
            name, subtitle, image, category,
            filter_tag, active, sort_order, created_at
          ) VALUES (
            ${cat.name},
            ${cat.subtitle || ''},
            ${cat.image || ''},
            ${cat.category || 'indian'},
            ${cat.filterTag || cat.filter_tag || ''},
            ${cat.active !== false},
            ${cat.sort_order || cat.id || 0},
            ${cat.created_at || new Date().toISOString()}
          )
        `;

        successCount++;
        console.log(`✅ Migrated: ${cat.name} (${cat.category})`);

      } catch (err) {
        errorCount++;
        console.error(`❌ Failed to migrate category "${cat.name}":`, err.message);
      }
    }

    console.log(`\n📊 Showcase Categories Migration Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error reading showcase-categories.json:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// Run Migration
// ═══════════════════════════════════════════════════════════════

migrate().catch(console.error);
