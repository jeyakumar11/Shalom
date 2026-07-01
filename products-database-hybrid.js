// ═══════════════════════════════════════════════════════════════
// Hybrid Products Database - Auto-switches between Postgres and JSON
// ═══════════════════════════════════════════════════════════════

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const STOCK_HISTORY_FILE = path.join(__dirname, 'stock-history.json');

let usePostgres = false;
let connectionCheckPromise = null;

async function checkPostgresConnection() {
  if (connectionCheckPromise) return connectionCheckPromise;
  
  connectionCheckPromise = (async () => {
    try {
      await pool.query('SELECT NOW()');
      usePostgres = true;
      console.log('✅ [PRODUCTS] Connected to Postgres');
      return true;
    } catch (error) {
      usePostgres = false;
      console.log('⚠️ [PRODUCTS] Using local JSON files');
      
      if (!fs.existsSync(PRODUCTS_FILE)) {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
      }
      if (!fs.existsSync(STOCK_HISTORY_FILE)) {
        fs.writeFileSync(STOCK_HISTORY_FILE, JSON.stringify([], null, 2));
      }
      return false;
    }
  })();
  
  return connectionCheckPromise;
}

checkPostgresConnection();

// ─── JSON Helpers ──────────────────────────────────────────────
function readJSON(filepath) {
  try {
    if (!fs.existsSync(filepath)) return [];
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (error) {
    console.error(`❌ Error reading ${filepath}:`, error);
    return [];
  }
}

function writeJSON(filepath, data) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`❌ Error writing ${filepath}:`, error);
    return false;
  }
}

// ─── Get All Products ──────────────────────────────────────────
async function getAllProducts() {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error('❌ Postgres failed, using JSON:', error.message);
      usePostgres = false;
    }
  }
  
  return readJSON(PRODUCTS_FILE);
}

// ─── Get Product By ID ─────────────────────────────────────────
async function getProductById(id) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      usePostgres = false;
    }
  }
  
  const products = readJSON(PRODUCTS_FILE);
  return products.find(p => p.id === parseInt(id)) || null;
}

// ─── Get Product By SKU ────────────────────────────────────────
async function getProductBySku(sku) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE sku = $1', [sku]);
      return result.rows[0] || null;
    } catch (error) {
      usePostgres = false;
    }
  }
  
  const products = readJSON(PRODUCTS_FILE);
  return products.find(p => p.sku === sku) || null;
}

// ─── Add Product ───────────────────────────────────────────────
async function addProduct(productData) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const result = await pool.query(
        `INSERT INTO products (name, category, price, stock, image, sku, barcode, sizes, description, fabric, occasion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          productData.name, productData.category, productData.price,
          productData.stock, productData.image, productData.sku,
          productData.barcode, productData.sizes, productData.description,
          productData.fabric, productData.occasion
        ]
      );
      console.log(`✅ [POSTGRES] Product added: ${productData.name}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Postgres failed:', error.message);
      usePostgres = false;
    }
  }
  
  const products = readJSON(PRODUCTS_FILE);
  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    ...productData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  products.push(newProduct);
  writeJSON(PRODUCTS_FILE, products);
  console.log(`✅ [JSON] Product added: ${productData.name}`);
  return newProduct;
}

// ─── Update Product ────────────────────────────────────────────
async function updateProduct(id, updates) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const setClauses = [];
      const values = [];
      let paramIndex = 1;
      
      Object.entries(updates).forEach(([key, value]) => {
        setClauses.push(`${key} = $${paramIndex++}`);
        values.push(value);
      });
      
      values.push(id);
      const result = await pool.query(
        `UPDATE products SET ${setClauses.join(', ')}, updated_at = NOW() 
         WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      
      console.log(`✅ [POSTGRES] Product ${id} updated`);
      return result.rows[0];
    } catch (error) {
      usePostgres = false;
    }
  }
  
  const products = readJSON(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === parseInt(id));
  if (index === -1) return null;
  
  products[index] = { 
    ...products[index], 
    ...updates, 
    updated_at: new Date().toISOString() 
  };
  writeJSON(PRODUCTS_FILE, products);
  console.log(`✅ [JSON] Product ${id} updated`);
  return products[index];
}

// ─── Delete Product ────────────────────────────────────────────
async function deleteProduct(id) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      console.log(`✅ [POSTGRES] Product ${id} deleted`);
      return true;
    } catch (error) {
      usePostgres = false;
    }
  }
  
  let products = readJSON(PRODUCTS_FILE);
  const originalLength = products.length;
  products = products.filter(p => p.id !== parseInt(id));
  if (products.length < originalLength) {
    writeJSON(PRODUCTS_FILE, products);
    console.log(`✅ [JSON] Product ${id} deleted`);
    return true;
  }
  return false;
}

// ─── Update Stock ──────────────────────────────────────────────
async function updateStock(id, newStock, reason = 'Manual adjustment', orderId = null) {
  await checkPostgresConnection();
  
  const product = await getProductById(id);
  if (!product) return false;
  
  const oldStock = product.stock;
  const changeAmount = newStock - oldStock;
  
  if (usePostgres) {
    try {
      await pool.query('UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2', [newStock, id]);
      await pool.query(
        `INSERT INTO stock_history (product_id, product_name, old_stock, new_stock, change_amount, change_reason, order_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, product.name, oldStock, newStock, changeAmount, reason, orderId]
      );
      console.log(`✅ [POSTGRES] Stock updated: ${product.name} (${oldStock} → ${newStock})`);
      return true;
    } catch (error) {
      usePostgres = false;
    }
  }
  
  // JSON fallback
  const products = readJSON(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === parseInt(id));
  if (index !== -1) {
    products[index].stock = newStock;
    products[index].updated_at = new Date().toISOString();
    writeJSON(PRODUCTS_FILE, products);
    
    const history = readJSON(STOCK_HISTORY_FILE);
    history.push({
      id: history.length + 1,
      product_id: id,
      product_name: product.name,
      old_stock: oldStock,
      new_stock: newStock,
      change_amount: changeAmount,
      change_reason: reason,
      order_id: orderId,
      created_at: new Date().toISOString()
    });
    writeJSON(STOCK_HISTORY_FILE, history);
    
    console.log(`✅ [JSON] Stock updated: ${product.name} (${oldStock} → ${newStock})`);
    return true;
  }
  return false;
}

// ─── Get Stock History ─────────────────────────────────────────
async function getStockHistory(limit = 50) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const result = await pool.query(
        'SELECT * FROM stock_history ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
      return result.rows;
    } catch (error) {
      usePostgres = false;
    }
  }
  
  const history = readJSON(STOCK_HISTORY_FILE);
  return history
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

// ─── Get Products By Category ──────────────────────────────────
async function getProductsByCategory(category) {
  const allProducts = await getAllProducts();
  return allProducts.filter(p => p.category === category);
}

module.exports = {
  getAllProducts,
  getProductById,
  getProductBySku,
  addProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getStockHistory,
  getProductsByCategory
};
