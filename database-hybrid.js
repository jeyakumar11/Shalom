// ═══════════════════════════════════════════════════════════════
// Hybrid Database - Auto-switches between Postgres and Local JSON
// Falls back to JSON files if Postgres connection fails
// ═══════════════════════════════════════════════════════════════

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Try Postgres first
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Local JSON fallback paths
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Check if we can connect to Postgres
let usePostgres = false;
let connectionCheckPromise = null;

async function checkPostgresConnection() {
  if (connectionCheckPromise) return connectionCheckPromise;
  
  connectionCheckPromise = (async () => {
    try {
      const result = await pool.query('SELECT NOW()');
      usePostgres = true;
      console.log('✅ Connected to Postgres database');
      return true;
    } catch (error) {
      usePostgres = false;
      console.log('⚠️ Postgres unavailable, using local JSON files');
      console.log('   Error:', error.message);
      
      // Initialize JSON file if it doesn't exist
      if (!fs.existsSync(ORDERS_FILE)) {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
      }
      return false;
    }
  })();
  
  return connectionCheckPromise;
}

// Initialize connection check
checkPostgresConnection();

// ─── JSON File Helpers ─────────────────────────────────────────
function readOrdersFromJSON() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error reading orders.json:', error);
    return [];
  }
}

function writeOrdersToJSON(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error writing orders.json:', error);
    return false;
  }
}

// ─── Insert Order (Hybrid) ─────────────────────────────────────
async function insertOrder(orderData) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    // Use Postgres
    try {
      const result = await pool.query(
        `INSERT INTO orders (
          order_id, customer_name, email, phone,
          address_street, address_city, address_state, address_pin,
          items, subtotal, gst, total,
          payment_method, payment_status, payment_id, order_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id`,
        [
          orderData.order_id,
          orderData.customer_name,
          orderData.email,
          orderData.phone,
          orderData.address_street,
          orderData.address_city,
          orderData.address_state,
          orderData.address_pin,
          orderData.items,
          orderData.subtotal,
          orderData.gst,
          orderData.total,
          orderData.payment_method,
          orderData.payment_status,
          orderData.payment_id || null,
          orderData.order_date
        ]
      );
      
      console.log(`✅ [POSTGRES] Order ${orderData.order_id} inserted`);
      return result.rows[0].id;
    } catch (error) {
      console.error('❌ Postgres insert failed, falling back to JSON:', error.message);
      usePostgres = false; // Switch to JSON for future calls
    }
  }
  
  // Use JSON fallback
  const orders = readOrdersFromJSON();
  const newOrder = {
    id: orders.length + 1,
    ...orderData,
    created_at: new Date().toISOString()
  };
  orders.push(newOrder);
  writeOrdersToJSON(orders);
  console.log(`✅ [JSON] Order ${orderData.order_id} saved locally`);
  return newOrder.id;
}

// ─── Get All Orders (Hybrid) ───────────────────────────────────
async function getAllOrders() {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      console.log(`✅ [POSTGRES] Fetched ${result.rows.length} orders`);
      return result.rows;
    } catch (error) {
      console.error('❌ Postgres fetch failed, falling back to JSON:', error.message);
      usePostgres = false;
    }
  }
  
  // Use JSON fallback
  const orders = readOrdersFromJSON();
  console.log(`✅ [JSON] Fetched ${orders.length} orders from local file`);
  return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// ─── Get Order By ID (Hybrid) ──────────────────────────────────
async function getOrderById(orderId) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const result = await pool.query('SELECT * FROM orders WHERE order_id = $1 LIMIT 1', [orderId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Postgres fetch failed, falling back to JSON:', error.message);
      usePostgres = false;
    }
  }
  
  // Use JSON fallback
  const orders = readOrdersFromJSON();
  return orders.find(o => o.order_id === orderId) || null;
}

// ─── Get Orders By Email (Hybrid) ──────────────────────────────
async function getOrdersByEmail(email) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const result = await pool.query(
        'SELECT * FROM orders WHERE email = $1 ORDER BY created_at DESC',
        [email]
      );
      return result.rows;
    } catch (error) {
      console.error('❌ Postgres fetch failed, falling back to JSON:', error.message);
      usePostgres = false;
    }
  }
  
  // Use JSON fallback
  const orders = readOrdersFromJSON();
  return orders
    .filter(o => o.email === email)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// ─── Update Order Payment Status (Hybrid) ──────────────────────
async function updateOrderPaymentStatus(orderId, paymentStatus, paymentId = null) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      await pool.query(
        'UPDATE orders SET payment_status = $1, payment_id = $2 WHERE order_id = $3',
        [paymentStatus, paymentId, orderId]
      );
      console.log(`✅ [POSTGRES] Order ${orderId} payment status: ${paymentStatus}`);
      return true;
    } catch (error) {
      console.error('❌ Postgres update failed, falling back to JSON:', error.message);
      usePostgres = false;
    }
  }
  
  // Use JSON fallback
  const orders = readOrdersFromJSON();
  const order = orders.find(o => o.order_id === orderId);
  if (order) {
    order.payment_status = paymentStatus;
    if (paymentId) order.payment_id = paymentId;
    writeOrdersToJSON(orders);
    console.log(`✅ [JSON] Order ${orderId} payment status: ${paymentStatus}`);
    return true;
  }
  return false;
}

// ─── Get Database Status ───────────────────────────────────────
async function getDatabaseStatus() {
  await checkPostgresConnection();
  return {
    mode: usePostgres ? 'postgres' : 'json',
    postgres_connected: usePostgres,
    message: usePostgres 
      ? 'Connected to Postgres database' 
      : 'Using local JSON files (Postgres unavailable)'
  };
}

module.exports = { 
  insertOrder, 
  getAllOrders, 
  getOrderById, 
  getOrdersByEmail,
  updateOrderPaymentStatus,
  getDatabaseStatus
};
