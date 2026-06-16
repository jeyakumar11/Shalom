const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'orders.json');

// Initialize database file if it doesn't exist
function initializeDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ orders: [] }, null, 2));
  }
}

// Read all orders from JSON file
function readOrders() {
  try {
    initializeDatabase();
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading orders:', error);
    return { orders: [] };
  }
}

// Write orders to JSON file
function writeOrders(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing orders:', error);
  }
}

function insertOrder(orderData) {
  const db = readOrders();
  
  // Add auto-increment ID and timestamp
  const newOrder = {
    id: db.orders.length + 1,
    ...orderData,
    created_at: new Date().toISOString()
  };
  
  db.orders.push(newOrder);
  writeOrders(db);
  
  return newOrder.id;
}

function getAllOrders() {
  const db = readOrders();
  // Sort by created_at descending (newest first)
  return db.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getOrderById(orderId) {
  const db = readOrders();
  return db.orders.find(order => order.order_id === orderId);
}

module.exports = { insertOrder, getAllOrders, getOrderById };
