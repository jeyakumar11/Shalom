const fs = require('fs');
const path = require('path');

const PRODUCTS_DB_PATH = path.join(__dirname, 'products.json');

// Initialize products database
function initializeProductsDB() {
  try {
    if (!fs.existsSync(PRODUCTS_DB_PATH)) {
      console.log('📁 Creating new products database...');
      const initialData = {
        products: [],
        stock_history: []
      };
      
      fs.writeFileSync(PRODUCTS_DB_PATH, JSON.stringify(initialData, null, 2));
      console.log('✅ Products database initialized (empty - ready for admin input)');
    } else {
      console.log('📁 Products database found - loading existing products');
      // Verify file integrity
      try {
        const data = fs.readFileSync(PRODUCTS_DB_PATH, 'utf8');
        const parsed = JSON.parse(data);
        if (!parsed.products || !Array.isArray(parsed.products)) {
          throw new Error('Invalid database structure');
        }
        console.log(`✅ Products database loaded successfully (${parsed.products.length} products)`);
      } catch (parseError) {
        console.error('❌ Database file corrupted, creating backup and new file');
        // Create backup of corrupted file
        const backupPath = path.join(__dirname, `products.backup.${Date.now()}.json`);
        fs.copyFileSync(PRODUCTS_DB_PATH, backupPath);
        console.log(`📄 Backup created: ${backupPath}`);
        
        // Create new empty database
        const freshData = { products: [], stock_history: [] };
        fs.writeFileSync(PRODUCTS_DB_PATH, JSON.stringify(freshData, null, 2));
        console.log('✅ New products database created');
      }
    }
  } catch (error) {
    console.error('❌ Error initializing products database:', error);
    // Fallback: create minimal working database
    const fallbackData = { products: [], stock_history: [] };
    fs.writeFileSync(PRODUCTS_DB_PATH, JSON.stringify(fallbackData, null, 2));
    console.log('✅ Fallback database created');
  }
}

// Read products
function readProducts() {
  try {
    initializeProductsDB();
    const data = fs.readFileSync(PRODUCTS_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products:', error);
    return { products: [], stock_history: [] };
  }
}

// Write products
function writeProducts(data) {
  try {
    fs.writeFileSync(PRODUCTS_DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing products:', error);
  }
}

// Get all products
function getAllProducts() {
  const db = readProducts();
  return db.products;
}

// Get product by ID
function getProductById(id) {
  const db = readProducts();
  return db.products.find(p => p.id === parseInt(id));
}

// Get product by barcode
function getProductByBarcode(barcode) {
  const db = readProducts();
  return db.products.find(p => p.barcode === barcode);
}

// Get product by SKU
function getProductBySKU(sku) {
  const db = readProducts();
  return db.products.find(p => p.sku === sku);
}

// Update product stock
function updateProductStock(productId, quantity, reason = 'manual_update') {
  const db = readProducts();
  const product = db.products.find(p => p.id === parseInt(productId));
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  const oldStock = product.stock;
  product.stock = quantity;
  product.updated_at = new Date().toISOString();
  
  // Add to stock history
  db.stock_history.push({
    id: db.stock_history.length + 1,
    product_id: productId,
    product_name: product.name,
    old_stock: oldStock,
    new_stock: quantity,
    change: quantity - oldStock,
    reason: reason,
    timestamp: new Date().toISOString()
  });
  
  writeProducts(db);
  return product;
}

// Reduce stock (for orders)
function reduceStock(productId, quantity, orderId = null) {
  const db = readProducts();
  const product = db.products.find(p => p.id === parseInt(productId));
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (product.stock < quantity) {
    throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
  }
  
  const oldStock = product.stock;
  product.stock -= quantity;
  product.updated_at = new Date().toISOString();
  
  // Add to stock history
  db.stock_history.push({
    id: db.stock_history.length + 1,
    product_id: productId,
    product_name: product.name,
    old_stock: oldStock,
    new_stock: product.stock,
    change: -quantity,
    reason: orderId ? `order_${orderId}` : 'sale',
    timestamp: new Date().toISOString()
  });
  
  writeProducts(db);
  return product;
}

// Add product
function addProduct(productData) {
  const db = readProducts();
  
  const newProduct = {
    id: db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1,
    ...productData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  db.products.push(newProduct);
  writeProducts(db);
  
  return newProduct;
}

// Update product
function updateProduct(productId, productData) {
  const db = readProducts();
  const index = db.products.findIndex(p => p.id === parseInt(productId));
  
  if (index === -1) {
    throw new Error('Product not found');
  }
  
  db.products[index] = {
    ...db.products[index],
    ...productData,
    id: parseInt(productId), // Ensure ID doesn't change
    updated_at: new Date().toISOString()
  };
  
  writeProducts(db);
  return db.products[index];
}

// Get stock history
function getStockHistory(productId = null) {
  const db = readProducts();
  
  if (productId) {
    return db.stock_history.filter(h => h.product_id === parseInt(productId));
  }
  
  return db.stock_history;
}

// Delete product
function deleteProduct(productId) {
  const db = readProducts();
  const index = db.products.findIndex(p => p.id === parseInt(productId));
  if (index === -1) throw new Error('Product not found');
  db.products.splice(index, 1);
  writeProducts(db);
}

module.exports = {
  initializeProductsDB,
  getAllProducts,
  getProductById,
  getProductByBarcode,
  getProductBySKU,
  updateProductStock,
  reduceStock,
  addProduct,
  updateProduct,
  deleteProduct,
  getStockHistory
};

// Clear all products (admin function)
function clearAllProducts() {
  const db = readProducts();
  db.products = [];
  db.stock_history.push({
    id: db.stock_history.length + 1,
    product_id: 'ALL',
    product_name: 'All Products',
    old_stock: 'varied',
    new_stock: 0,
    change: 'cleared',
    reason: 'admin_clear_all',
    timestamp: new Date().toISOString()
  });
  writeProducts(db);
  console.log('🗑️ All products cleared by admin');
  return true;
}

// Backup products database
function backupProducts() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(__dirname, `products-backup-${timestamp}.json`);
    fs.copyFileSync(PRODUCTS_DB_PATH, backupPath);
    console.log(`📄 Products backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    return null;
  }
}

// Import products from backup
function importFromBackup(backupPath) {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found');
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Validate backup data structure
    if (!backupData.products || !Array.isArray(backupData.products)) {
      throw new Error('Invalid backup file format');
    }
    
    // Create current backup before import
    backupProducts();
    
    // Import the backup
    writeProducts(backupData);
    console.log(`📥 Products imported from backup: ${backupPath}`);
    return true;
  } catch (error) {
    console.error('❌ Error importing from backup:', error);
    return false;
  }
}

// Get database statistics
function getDatabaseStats() {
  try {
    const db = readProducts();
    const stats = {
      totalProducts: db.products.length,
      categoryCounts: {},
      totalStock: 0,
      totalValue: 0,
      stockHistoryEntries: db.stock_history.length,
      lastUpdated: null
    };
    
    db.products.forEach(product => {
      // Category counts
      stats.categoryCounts[product.category] = (stats.categoryCounts[product.category] || 0) + 1;
      
      // Total stock and value
      stats.totalStock += product.stock;
      stats.totalValue += product.price * product.stock;
      
      // Last updated
      if (!stats.lastUpdated || product.updated_at > stats.lastUpdated) {
        stats.lastUpdated = product.updated_at;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    return null;
  }
}

// Validate product data before saving
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
  
  if (!productData.stock || productData.stock < 0) {
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

// Enhanced add product with validation
function addProductSafe(productData) {
  const validation = validateProductData(productData);
  
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Check for duplicate SKU
  const db = readProducts();
  const existingSKU = db.products.find(p => p.sku === productData.sku);
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
  updateProductStock,
  reduceStock,
  addProduct,
  addProductSafe,
  updateProduct,
  deleteProduct,
  getStockHistory,
  clearAllProducts,
  backupProducts,
  importFromBackup,
  getDatabaseStats,
  validateProductData
};