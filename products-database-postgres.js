// ═══════════════════════════════════════════════════════════════
// Vercel Postgres Database - Products Module
// Replaces: products-database.js (JSON-based)
// ═══════════════════════════════════════════════════════════════

const { sql } = require('@vercel/postgres');

// ─── Initialize Products Database ──────────────────────────────
async function initializeProductsDB() {
  // Tables are created via SQL script (see: database-schema.sql)
  console.log('📁 Using Vercel Postgres for products');
}

// ─── Get All Products ──────────────────────────────────────────
async function getAllProducts() {
  try {
    const result = await sql`
      SELECT * FROM products 
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
}

// ─── Get Product By ID ─────────────────────────────────────────
async function getProductById(id) {
  try {
    const result = await sql`
      SELECT * FROM products 
      WHERE id = ${parseInt(id)}
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return null;
  }
}

// ─── Get Product By Barcode ────────────────────────────────────
async function getProductByBarcode(barcode) {
  try {
    const result = await sql`
      SELECT * FROM products 
      WHERE barcode = ${barcode}
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching product by barcode:', error);
    return null;
  }
}

// ─── Get Product By SKU ────────────────────────────────────────
async function getProductBySKU(sku) {
  try {
    const result = await sql`
      SELECT * FROM products 
      WHERE sku = ${sku}
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching product by SKU:', error);
    return null;
  }
}

// ─── Add Product ───────────────────────────────────────────────
async function addProduct(productData) {
  try {
    const result = await sql`
      INSERT INTO products (
        name, category, price, stock, image, 
        sku, barcode, sizes, description, 
        fabric, occasion
      ) VALUES (
        ${productData.name},
        ${productData.category},
        ${productData.price},
        ${productData.stock || 0},
        ${productData.image || null},
        ${productData.sku},
        ${productData.barcode || null},
        ${JSON.stringify(productData.sizes || [])}::jsonb,
        ${productData.description || null},
        ${productData.fabric || null},
        ${productData.occasion || null}
      )
      RETURNING *
    `;
    
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
    const result = await sql`
      UPDATE products 
      SET 
        name = ${productData.name},
        category = ${productData.category},
        price = ${productData.price},
        stock = ${productData.stock},
        image = ${productData.image || null},
        sku = ${productData.sku},
        barcode = ${productData.barcode || null},
        sizes = ${JSON.stringify(productData.sizes || [])}::jsonb,
        description = ${productData.description || null},
        fabric = ${productData.fabric || null},
        occasion = ${productData.occasion || null},
        updated_at = NOW()
      WHERE id = ${parseInt(productId)}
      RETURNING *
    `;
    
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
  try {
    // Get current stock first
    const product = await getProductById(productId);
    if (!product) throw new Error('Product not found');
    
    const oldStock = product.stock;
    
    // Update stock
    const result = await sql`
      UPDATE products 
      SET stock = ${parseInt(newStock)},
          updated_at = NOW()
      WHERE id = ${parseInt(productId)}
      RETURNING *
    `;
    
    // Add to stock history
    await sql`
      INSERT INTO stock_history (
        product_id, product_name, old_stock, new_stock, 
        change_amount, change_reason
      ) VALUES (
        ${parseInt(productId)},
        ${product.name},
        ${oldStock},
        ${parseInt(newStock)},
        ${parseInt(newStock) - oldStock},
        ${reason}
      )
    `;
    
    console.log(`✅ Stock updated for ${product.name}: ${oldStock} → ${newStock}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error updating stock:', error);
    throw error;
  }
}

// ─── Reduce Stock (for orders) ─────────────────────────────────
async function reduceStock(productId, quantity, orderId = null) {
  try {
    const product = await getProductById(productId);
    if (!product) throw new Error('Product not found');
    
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
    }
    
    const oldStock = product.stock;
    const newStock = oldStock - quantity;
    
    // Reduce stock
    const result = await sql`
      UPDATE products 
      SET stock = ${newStock},
          updated_at = NOW()
      WHERE id = ${parseInt(productId)}
      RETURNING *
    `;
    
    // Add to stock history
    await sql`
      INSERT INTO stock_history (
        product_id, product_name, old_stock, new_stock, 
        change_amount, change_reason, order_id
      ) VALUES (
        ${parseInt(productId)},
        ${product.name},
        ${oldStock},
        ${newStock},
        ${-quantity},
        ${orderId ? `order_${orderId}` : 'sale'},
        ${orderId}
      )
    `;
    
    console.log(`✅ Stock reduced for ${product.name}: ${oldStock} → ${newStock} (Order: ${orderId})`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error reducing stock:', error);
    throw error;
  }
}

// ─── Delete Product ────────────────────────────────────────────
async function deleteProduct(productId) {
  try {
    await sql`
      DELETE FROM products 
      WHERE id = ${parseInt(productId)}
    `;
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
      const result = await sql`
        SELECT * FROM stock_history 
        WHERE product_id = ${parseInt(productId)}
        ORDER BY created_at DESC
      `;
      return result.rows;
    } else {
      const result = await sql`
        SELECT * FROM stock_history 
        ORDER BY created_at DESC
        LIMIT 100
      `;
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
    await sql`DELETE FROM products`;
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
    const totalProducts = await sql`SELECT COUNT(*) as count FROM products`;
    const totalStock = await sql`SELECT SUM(stock) as total FROM products`;
    const totalValue = await sql`SELECT SUM(price * stock) as value FROM products`;
    const categoryCounts = await sql`
      SELECT category, COUNT(*) as count 
      FROM products 
      GROUP BY category
    `;
    const lastUpdated = await sql`
      SELECT MAX(updated_at) as last_update FROM products
    `;
    
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
