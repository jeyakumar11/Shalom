// ═══════════════════════════════════════════════════════════════
// Postgres Database - Products Module (using node-postgres)
// Compatible with Supabase, Vercel Postgres, and any PostgreSQL
// ═══════════════════════════════════════════════════════════════

const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ─── Initialize Products Database ──────────────────────────────
async function initializeProductsDB() {
  // Tables are created via SQL script (see: supabase-setup.sql)
  console.log('📁 Using Postgres for products');
}

// ─── Get All Products ──────────────────────────────────────────
async function getAllProducts() {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
}

// ─── Get Product By ID ─────────────────────────────────────────
async function getProductById(id) {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [parseInt(id)]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return null;
  }
}

// ─── Get Product By Barcode ────────────────────────────────────
async function getProductByBarcode(barcode) {
  try {
    const result = await pool.query('SELECT * FROM products WHERE barcode = $1 LIMIT 1', [barcode]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching product by barcode:', error);
    return null;
  }
}

// ─── Get Product By SKU ────────────────────────────────────────
async function getProductBySKU(sku) {
  try {
    const result = await pool.query('SELECT * FROM products WHERE sku = $1 LIMIT 1', [sku]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching product by SKU:', error);
    return null;
  }
}

// ─── Add Product ───────────────────────────────────────────────
async function addProduct(productData) {
  try {
    const result = await pool.query(
      `INSERT INTO products (
        name, category, price, stock, image, 
        sku, barcode, sizes, description, 
        fabric, occasion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        productData.name,
        productData.category,
        productData.price,
        productData.stock || 0,
        productData.image || null,
        productData.sku,
        productData.barcode || null,
        JSON.stringify(productData.sizes || []),
        productData.description || null,
        productData.fabric || null,
        productData.occasion || null
      ]
    );
    
    console.log(`✅ Product added: ${productData.name}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error adding product:', error);
    throw error;
  }
}

// ─── Update Product ────────────────────────────────────────────
async function updateProduct(productId, productData) {
  try {
    const result = await pool.query(
      `UPDATE products 
      SET name = $1, category = $2, price = $3, stock = $4, image = $5,
          sku = $6, barcode = $7, sizes = $8, description = $9,
          fabric = $10, occasion = $11, updated_at = NOW()
      WHERE id = $12
      RETURNING *`,
      [
        productData.name,
        productData.category,
        productData.price,
        productData.stock,
        productData.image || null,
        productData.sku,
        productData.barcode || null,
        JSON.stringify(productData.sizes || []),
        productData.description || null,
        productData.fabric || null,
        productData.occasion || null,
        parseInt(productId)
      ]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Product not found');
    }
    
    console.log(`✅ Product updated: ${productData.name}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error updating product:', error);
    throw error;
  }
}

// ─── Update Product Stock ──────────────────────────────────────
async function updateProductStock(productId, newStock, reason = 'manual_update') {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get current stock
    const productResult = await client.query('SELECT * FROM products WHERE id = $1', [parseInt(productId)]);
    const product = productResult.rows[0];
    if (!product) throw new Error('Product not found');
    
    const oldStock = product.stock;
    
    // Update stock
    const updateResult = await client.query(
      'UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [parseInt(newStock), parseInt(productId)]
    );
    
    // Add to stock history
    await client.query(
      `INSERT INTO stock_history (product_id, product_name, old_stock, new_stock, change_amount, change_reason)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [parseInt(productId), product.name, oldStock, parseInt(newStock), parseInt(newStock) - oldStock, reason]
    );
    
    await client.query('COMMIT');
    console.log(`✅ Stock updated for ${product.name}: ${oldStock} → ${newStock}`);
    return updateResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error updating stock:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ─── Reduce Stock (for orders) ─────────────────────────────────
async function reduceStock(productId, quantity, orderId = null) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const productResult = await client.query('SELECT * FROM products WHERE id = $1', [parseInt(productId)]);
    const product = productResult.rows[0];
    if (!product) throw new Error('Product not found');
    
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
    }
    
    const oldStock = product.stock;
    const newStock = oldStock - quantity;
    
    // Reduce stock
    const result = await client.query(
      'UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newStock, parseInt(productId)]
    );
    
    // Add to stock history
    await client.query(
      `INSERT INTO stock_history (product_id, product_name, old_stock, new_stock, change_amount, change_reason, order_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [parseInt(productId), product.name, oldStock, newStock, -quantity, orderId ? `order_${orderId}` : 'sale', orderId]
    );
    
    await client.query('COMMIT');
    console.log(`✅ Stock reduced for ${product.name}: ${oldStock} → ${newStock} (Order: ${orderId})`);
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error reducing stock:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ─── Delete Product ────────────────────────────────────────────
async function deleteProduct(productId) {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [parseInt(productId)]);
    console.log(`✅ Product deleted: ID ${productId}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    throw error;
  }
}

// ─── Get Stock History ─────────────────────────────────────────
async function getStockHistory(productId = null) {
  try {
    if (productId) {
      const result = await pool.query(
        'SELECT * FROM stock_history WHERE product_id = $1 ORDER BY created_at DESC',
        [parseInt(productId)]
      );
      return result.rows;
    } else {
      const result = await pool.query(
        'SELECT * FROM stock_history ORDER BY created_at DESC LIMIT 100'
      );
      return result.rows;
    }
  } catch (error) {
    console.error('❌ Error fetching stock history:', error);
    return [];
  }
}

// ─── Clear All Products (Admin) ────────────────────────────────
async function clearAllProducts() {
  try {
    await pool.query('DELETE FROM products');
    console.log('🗑️ All products cleared by admin');
    return true;
  } catch (error) {
    console.error('❌ Error clearing products:', error);
    return false;
  }
}

// ─── Get Database Statistics ───────────────────────────────────
async function getDatabaseStats() {
  try {
    const totalProducts = await pool.query('SELECT COUNT(*) as count FROM products');
    const totalStock = await pool.query('SELECT SUM(stock) as total FROM products');
    const totalValue = await pool.query('SELECT SUM(price * stock) as value FROM products');
    const categoryCounts = await pool.query(
      'SELECT category, COUNT(*) as count FROM products GROUP BY category'
    );
    const lastUpdated = await pool.query('SELECT MAX(updated_at) as last_update FROM products');
    
    const categoryMap = {};
    categoryCounts.rows.forEach(row => {
      categoryMap[row.category] = parseInt(row.count);
    });
    
    return {
      totalProducts: parseInt(totalProducts.rows[0].count),
      totalStock: parseInt(totalStock.rows[0].total || 0),
      totalValue: parseFloat(totalValue.rows[0].value || 0),
      categoryCounts: categoryMap,
      stockHistoryEntries: 0, // Could add if needed
      lastUpdated: lastUpdated.rows[0].last_update
    };
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    return null;
  }
}

// ─── Validate Product Data ─────────────────────────────────────
function validateProductData(productData) {
  const errors = [];
  
  if (!productData.name || productData.name.trim() === '') {
    errors.push('Product name is required');
  }
  
  if (!productData.category || !['indian', 'western', 'bridal', 'accessories'].includes(productData.category)) {
    errors.push('Valid category is required (indian, western, bridal, accessories)');
  }
  
  if (!productData.price || productData.price <= 0) {
    errors.push('Valid price is required');
  }
  
  if (productData.stock === undefined || productData.stock < 0) {
    errors.push('Valid stock quantity is required');
  }
  
  if (!productData.sku || productData.sku.trim() === '') {
    errors.push('SKU is required');
  }
  
  if (!productData.sizes || !Array.isArray(productData.sizes) || productData.sizes.length === 0) {
    errors.push('At least one size is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// ─── Add Product with Validation ───────────────────────────────
async function addProductSafe(productData) {
  const validation = validateProductData(productData);
  
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Check for duplicate SKU
  const existingSKU = await getProductBySKU(productData.sku);
  if (existingSKU) {
    throw new Error(`Product with SKU "${productData.sku}" already exists`);
  }
  
  return addProduct(productData);
}

module.exports = {
  initializeProductsDB,
  getAllProducts,
  getProductById,
  getProductByBarcode,
  getProductBySKU,
  addProduct,
  addProductSafe,
  updateProduct,
  updateProductStock,
  reduceStock,
  deleteProduct,
  getStockHistory,
  clearAllProducts,
  getDatabaseStats,
  validateProductData
};
