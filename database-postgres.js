// ═══════════════════════════════════════════════════════════════
// Postgres Database - Orders Module (using node-postgres)
// Compatible with Supabase, Vercel Postgres, and any PostgreSQL
// ═══════════════════════════════════════════════════════════════

const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ─── Insert Order ──────────────────────────────────────────────
async function insertOrder(orderData) {
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
    
    console.log(`✅ Order ${orderData.order_id} inserted into Postgres`);
    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Error inserting order:', error);
    throw error;
  }
}

// ─── Get All Orders ────────────────────────────────────────────
async function getAllOrders() {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return [];
  }
}

// ─── Get Order By ID ───────────────────────────────────────────
async function getOrderById(orderId) {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE order_id = $1 LIMIT 1', [orderId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    return null;
  }
}

// ─── Get Orders By Email ───────────────────────────────────────
async function getOrdersByEmail(email) {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE email = $1 ORDER BY created_at DESC',
      [email]
    );
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching orders by email:', error);
    return [];
  }
}

// ─── Update Order Payment Status ───────────────────────────────
async function updateOrderPaymentStatus(orderId, paymentStatus, paymentId = null) {
  try {
    await pool.query(
      'UPDATE orders SET payment_status = $1, payment_id = $2 WHERE order_id = $3',
      [paymentStatus, paymentId, orderId]
    );
    console.log(`✅ Order ${orderId} payment status updated to: ${paymentStatus}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating order payment status:', error);
    return false;
  }
}

module.exports = { 
  insertOrder, 
  getAllOrders, 
  getOrderById, 
  getOrdersByEmail,
  updateOrderPaymentStatus
};
