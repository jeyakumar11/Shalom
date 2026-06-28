// ═══════════════════════════════════════════════════════════════
// Vercel Postgres Database - Orders Module
// Replaces: database.js (JSON-based)
// ═══════════════════════════════════════════════════════════════

const { sql } = require('@vercel/postgres');

// ─── Insert Order ──────────────────────────────────────────────
async function insertOrder(orderData) {
  try {
    const result = await sql`
      INSERT INTO orders (
        order_id, customer_name, email, phone,
        address_street, address_city, address_state, address_pin,
        items, subtotal, gst, total,
        payment_method, payment_status, payment_id, order_date
      ) VALUES (
        ${orderData.order_id},
        ${orderData.customer_name},
        ${orderData.email},
        ${orderData.phone},
        ${orderData.address_street},
        ${orderData.address_city},
        ${orderData.address_state},
        ${orderData.address_pin},
        ${orderData.items}::jsonb,
        ${orderData.subtotal},
        ${orderData.gst},
        ${orderData.total},
        ${orderData.payment_method},
        ${orderData.payment_status},
        ${orderData.payment_id || null},
        ${orderData.order_date}
      )
      RETURNING id
    `;
    
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
    const result = await sql`
      SELECT * FROM orders 
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return [];
  }
}

// ─── Get Order By ID ───────────────────────────────────────────
async function getOrderById(orderId) {
  try {
    const result = await sql`
      SELECT * FROM orders 
      WHERE order_id = ${orderId}
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    return null;
  }
}

// ─── Get Orders By Email ───────────────────────────────────────
async function getOrdersByEmail(email) {
  try {
    const result = await sql`
      SELECT * FROM orders 
      WHERE email = ${email}
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching orders by email:', error);
    return [];
  }
}

// ─── Update Order Payment Status ───────────────────────────────
async function updateOrderPaymentStatus(orderId, paymentStatus, paymentId = null) {
  try {
    await sql`
      UPDATE orders 
      SET payment_status = ${paymentStatus},
          payment_id = ${paymentId}
      WHERE order_id = ${orderId}
    `;
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
