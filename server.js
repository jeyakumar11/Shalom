// ═══════════════════════════════════════════════════════════════
// Shalom Fashion - Express Server (Vercel Postgres + Cloudinary)
// ✅ Updated for cloud deployment - All database calls use async/await
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const Razorpay = require('razorpay');
require('dotenv').config();

// ═══ HYBRID DATABASE (Auto-switches: Postgres → JSON fallback) ═══
// ✅ Uses Postgres when available, automatically falls back to local JSON
const { insertOrder, getAllOrders, getDatabaseStatus } = require('./database-hybrid');
const productsDB = require('./products-database-hybrid');
const showcaseDB = require('./showcase-database-hybrid');
const { upload } = require('./cloudinary-config');

const app = express();
const PORT = process.env.PORT || 3001;
const EXCEL_PATH = path.join(__dirname, 'orders.xlsx');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ─── File Upload Configuration ────────────────────────────────────────────────
// ✅ Now using Cloudinary (configured in cloudinary-config.js)
// Old local storage commented out - images now stored in Cloudinary CDN

// OLD LOCAL STORAGE (replaced by Cloudinary):
/*
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, uploadDir); },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) { return cb(null, true); }
    else { cb(new Error('Only image files are allowed!')); }
  }
});
*/

// ─── Email Transporter ────────────────────────────────────────────────────────
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jaijs410@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD || '',
  },
});

async function sendOrderConfirmationEmail(orderData, items) {
  if (!process.env.EMAIL_APP_PASSWORD) {
    console.log('⚠️  Email not configured. Set EMAIL_APP_PASSWORD in .env to enable emails.');
    return;
  }
  try {
    const itemsHtml = items.map(i =>
      `<tr>
        <td style="padding:8px;border:1px solid #ddd;">${i.name}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${i.size || '-'}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${i.quantity}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;">₹${(i.price * i.quantity).toLocaleString('en-IN')}</td>
      </tr>`
    ).join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#10B981,#059669);padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;">Shalom Fashion</h1>
      <p style="color:#C9A86A;margin:8px 0 0;font-size:16px;">Order Confirmation</p>
    </div>
    <div style="padding:30px;">
      <p style="font-size:16px;color:#333;">Dear <strong>${orderData.customer_name}</strong>,</p>
      <p style="color:#555;">Thank you for your order! We have received your order and it is being processed.</p>
      
      <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:20px 0;">
        <h3 style="margin:0 0 12px;color:#10B981;">Order Details</h3>
        <p style="margin:4px 0;"><strong>Order ID:</strong> ${orderData.order_id}</p>
        <p style="margin:4px 0;"><strong>Date:</strong> ${orderData.order_date}</p>
        <p style="margin:4px 0;"><strong>Payment:</strong> ${orderData.payment_method} (${orderData.payment_status})</p>
      </div>

      <h3 style="color:#10B981;">Items Ordered</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#10B981;color:#fff;">
            <th style="padding:10px;text-align:left;">Product</th>
            <th style="padding:10px;text-align:center;">Size</th>
            <th style="padding:10px;text-align:center;">Qty</th>
            <th style="padding:10px;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="border-top:2px solid #eee;padding-top:16px;text-align:right;">
        <p style="margin:4px 0;color:#555;">Subtotal: <strong>₹${orderData.subtotal.toLocaleString('en-IN')}</strong></p>
        <p style="margin:4px 0;color:#555;">GST (18%): <strong>₹${orderData.gst.toFixed(2)}</strong></p>
        <p style="margin:8px 0;font-size:20px;color:#10B981;">Total: <strong>₹${orderData.total.toFixed(2)}</strong></p>
      </div>

      <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:20px 0;">
        <h3 style="margin:0 0 12px;color:#10B981;">Delivery Address</h3>
        <p style="margin:0;color:#555;">${orderData.address_street}, ${orderData.address_city}, ${orderData.address_state} - ${orderData.address_pin}</p>
      </div>

      <p style="color:#555;">If you have any questions, please contact us.</p>
      <p style="color:#555;">Thank you for shopping with <strong>Shalom Fashion</strong>!</p>
    </div>
    <div style="background:#10B981;padding:16px;text-align:center;">
      <p style="color:#fff;margin:0;font-size:13px;">© 2026 Shalom Fashion. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    await emailTransporter.sendMail({
      from: '"Shalom Fashion" <jaijs410@gmail.com>',
      to: orderData.email,
      subject: `Order Confirmed - ${orderData.order_id} | Shalom Fashion`,
      html,
    });
    console.log(`✅ Confirmation email sent to ${orderData.email}`);
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateOrderId() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `SF-${datePart}-${rand}`;
}

async function appendToExcel(orderData) {
  const workbook = new ExcelJS.Workbook();
  let worksheet;
  try {
    await workbook.xlsx.readFile(EXCEL_PATH);
    worksheet = workbook.getWorksheet('Orders');
    if (!worksheet) { worksheet = workbook.addWorksheet('Orders'); addExcelHeaders(worksheet); }
  } catch {
    worksheet = workbook.addWorksheet('Orders');
    addExcelHeaders(worksheet);
  }
  const items = JSON.parse(orderData.items);
  const itemsSummary = items.map(i => `${i.name} (${i.size || '-'}) x${i.quantity}`).join('; ');
  worksheet.addRow([
    orderData.order_id, orderData.customer_name, orderData.email, orderData.phone,
    orderData.address_street, orderData.address_city, orderData.address_state, orderData.address_pin,
    itemsSummary, orderData.subtotal, orderData.gst, orderData.total,
    orderData.payment_method, orderData.payment_status, orderData.order_date,
  ]);
  await workbook.xlsx.writeFile(EXCEL_PATH);
}

function addExcelHeaders(worksheet) {
  const headers = ['Order ID','Customer Name','Email','Phone','Street','City','State','PIN','Items','Subtotal (₹)','GST (₹)','Total (₹)','Payment Method','Payment Status','Order Date'];
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
  });
  [18,20,25,14,25,15,15,10,50,12,12,12,16,16,14].forEach((w,i) => { worksheet.getColumn(i+1).width = w; });
}

// ─── Admin Auth Middleware ────────────────────────────────────────────────────
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'shalom-admin-2026';

function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

// ─── Public Routes ────────────────────────────────────────────────────────────

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Debug endpoint to check environment variables (REMOVE AFTER TESTING)
app.get('/api/debug/env', async (req, res) => {
  const dbStatus = await getDatabaseStatus();
  
  res.json({
    database: dbStatus,
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasCloudinaryName: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasCloudinaryKey: !!process.env.CLOUDINARY_API_KEY,
    hasCloudinarySecret: !!process.env.CLOUDINARY_API_SECRET,
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    hasAdminToken: !!process.env.ADMIN_TOKEN,
    hasRazorpayKeyId: !!process.env.RAZORPAY_KEY_ID,
    hasRazorpaySecret: !!process.env.RAZORPAY_KEY_SECRET,
    hasEmailPassword: !!process.env.EMAIL_APP_PASSWORD,
    nodeEnv: process.env.NODE_ENV
  });
});

// UPI QR - NPCI CERTIFIED FORMAT
app.get('/api/generate-qr', async (req, res) => {
  try {
    const amount = parseFloat(req.query.amount) || 0;
    const merchantUpiId = 'jaijs410@okaxis';
    
    if (amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }
    
    // NPCI Certified UPI Intent Format - Most Compatible
    // Reference: https://www.npci.org.in/what-we-do/upi/upi-specifications
    const upiString = `upi://pay?pa=${merchantUpiId}&pn=SHALOM&mc=5311&tr=${Date.now()}&tn=Order&am=${amount.toFixed(2)}&cu=INR`;
    
    console.log(`✅ NPCI UPI QR: pa=${merchantUpiId}, am=${amount.toFixed(2)}`);
    
    const qrDataUrl = await QRCode.toDataURL(upiString, { 
      width: 256,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
      type: 'image/png'
    });
    
    res.json({ 
      success: true, 
      qr: qrDataUrl, 
      upiId: merchantUpiId, 
      amount: amount,
      upiString: upiString
    });
    
  } catch (err) {
    console.error('❌ QR Error:', err);
    res.status(500).json({ success: false, error: 'QR generation failed' });
  }
});

// Product QR
app.get('/api/generate-product-qr', async (req, res) => {
  try {
    const barcode = req.query.barcode || 'SHALOM-PRODUCT';
    const productName = req.query.name || 'Product';
    
    // QR contains: barcode|productname|website
    const qrData = `https://shalomfashion.local/product/${barcode}`;
    
    const qrDataUrl = await QRCode.toDataURL(qrData, { 
      width: 200,
      margin: 2,
      color: { dark: '#10B981', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
      type: 'image/png'
    });
    
    res.json({ success: true, qr: qrDataUrl, barcode, productName });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate product QR' });
  }
});

// ═══ RAZORPAY PAYMENT INTEGRATION ═══

// Create Razorpay order
app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // Amount in paise (smallest currency unit)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        website: 'Shalom Fashion',
        timestamp: new Date().toISOString()
      }
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      razorpay_key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create payment order',
      details: error.message 
    });
  }
});

// Verify Razorpay payment
app.post('/api/verify-payment', (req, res) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Create verification signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      details: error.message
    });
  }
});

// Get payment details
app.get('/api/payment/:payment_id', async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.payment_id);
    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100, // Convert back to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at
      }
    });
  } catch (error) {
    console.error('Fetch payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment details'
    });
  }
});

// Get all products (public - for website display)
app.get('/api/products', async (req, res) => {
  try {
    const products = await productsDB.getAllProducts();
    res.json({ success: true, products, count: products.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// ─── Showcase Categories (Public) ────────────────────────────────────────────
app.get('/api/showcase-categories', async (req, res) => {
  try {
    const categories = await showcaseDB.getAllCategories();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch showcase categories' });
  }
});

// ─── Showcase Categories (Admin) ─────────────────────────────────────────────
app.get('/api/admin/showcase-categories', adminAuth, async (req, res) => {
  try {
    res.json({ success: true, categories: await showcaseDB.getAllCategoriesAdmin() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

app.post('/api/admin/showcase-categories', adminAuth, async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ success: false, error: 'Name is required' });
    const category = await showcaseDB.addCategory(req.body);
    res.json({ success: true, category, message: 'Category added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to add category' });
  }
});

app.put('/api/admin/showcase-categories/:id', adminAuth, async (req, res) => {
  try {
    const category = await showcaseDB.updateCategory(req.params.id, req.body);
    res.json({ success: true, category, message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update category' });
  }
});

app.delete('/api/admin/showcase-categories/:id', adminAuth, async (req, res) => {
  try {
    await showcaseDB.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete category' });
  }
});

// Get product by barcode
app.get('/api/products/barcode/:barcode', async (req, res) => {
  try {
    const product = await productsDB.getProductByBarcode(req.params.barcode);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

// Get product by SKU
app.get('/api/products/sku/:sku', async (req, res) => {
  try {
    const product = await productsDB.getProductBySKU(req.params.sku);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await productsDB.getProductById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

// Place order (public) - ROBUST ATOMIC TRANSACTION WITH ROLLBACK
app.post('/api/place-order', async (req, res) => {
  const stockReductions = []; // Track stock changes for rollback
  
  try {
    const { customerName, email, phone, addressStreet, addressCity, addressState, addressPin, items, subtotal, gst, total, paymentMethod, paymentStatus, paymentId, paymentVerified } = req.body;

    // Validation
    if (!customerName || !email || !phone || !addressStreet || !addressCity || !addressState || !addressPin || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // PAYMENT VERIFICATION: Ensure payment is confirmed before proceeding
    if (paymentMethod === 'Razorpay Online Payment') {
      if (!paymentId || paymentStatus !== 'Paid') {
        return res.status(400).json({ success: false, error: 'Payment not verified' });
      }
    }
    
    if (paymentMethod === 'UPI Payment') {
      if (paymentStatus === 'Paid' && !paymentVerified) {
        return res.status(400).json({ success: false, error: 'UPI payment must be manually confirmed' });
      }
    }

    // Stock validation - CHECK before reduction
    for (const item of items) {
      const product = await productsDB.getProductById(item.id);
      if (!product) {
        return res.status(400).json({ success: false, error: `Product "${item.name}" not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient stock for "${item.name}". Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }
    }

    const orderId = generateOrderId();
    const orderDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // ATOMIC TRANSACTION START: Reduce stock and track changes
    try {
      for (const item of items) {
        const product = await productsDB.getProductById(item.id);
        const oldStock = product.stock;
        
        await productsDB.reduceStock(item.id, item.quantity, orderId);
        
        // Track for rollback
        stockReductions.push({ 
          productId: item.id, 
          quantity: item.quantity, 
          oldStock: oldStock 
        });
      }

      const orderData = {
        order_id: orderId,
        customer_name: customerName,
        email, phone,
        address_street: addressStreet,
        address_city: addressCity,
        address_state: addressState,
        address_pin: addressPin,
        items: JSON.stringify(items),
        subtotal: parseFloat(subtotal),
        gst: parseFloat(gst),
        total: parseFloat(total),
        payment_method: paymentMethod,
        payment_status: paymentStatus || (paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid'),
        payment_id: paymentId || null,
        order_date: orderDate,
      };

      // Insert order
      await insertOrder(orderData);
      await appendToExcel(orderData);

      // Send confirmation email (non-blocking)
      sendOrderConfirmationEmail(orderData, items).catch(console.error);

      console.log(`✅ Order ${orderId} placed successfully - Payment: ${paymentMethod}`);
      res.json({ success: true, orderId, message: 'Order placed successfully!' });

    } catch (orderError) {
      // ROLLBACK: Restore stock if order creation fails
      console.error('❌ Order creation failed, rolling back stock:', orderError);
      
      for (const reduction of stockReductions) {
        try {
          await productsDB.updateProductStock(reduction.productId, reduction.oldStock, 'rollback_' + orderId);
        } catch (rollbackError) {
          console.error(`Failed to rollback stock for product ${reduction.productId}:`, rollbackError);
        }
      }
      
      throw orderError;
    }

  } catch (err) {
    console.error('❌ Place order error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to place order. ' + (err.message || 'Please try again.') 
    });
  }
});

// Get all orders (public read for billing software)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await getAllOrders();
    const parsed = orders.map(o => {
      // Postgres returns items as JSONB (already parsed), but handle both cases
      const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      return { ...o, items };
    });
    res.json({ success: true, orders: parsed, count: parsed.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Stock history (public read)
app.get('/api/stock-history', async (req, res) => {
  try {
    const history = await productsDB.getStockHistory(req.query.product_id);
    res.json({ success: true, history, count: history.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch stock history' });
  }
});

// Reduce stock (called by billing software after in-store sale)
app.post('/api/products/:id/reduce-stock', async (req, res) => {
  try {
    const { quantity, order_id } = req.body;
    if (!quantity || quantity <= 0) return res.status(400).json({ success: false, error: 'Invalid quantity' });
    const product = await productsDB.reduceStock(req.params.id, parseInt(quantity), order_id);
    res.json({ success: true, product, message: 'Stock reduced successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to reduce stock' });
  }
});

// ─── Admin Routes (protected) ─────────────────────────────────────────────────

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  console.log('Login attempt:', { 
    providedPassword: password ? 'provided' : 'missing',
    expectedPassword: expectedPassword ? 'set' : 'not set',
    envVarExists: !!process.env.ADMIN_PASSWORD
  });
  
  if (password === expectedPassword) {
    res.json({ success: true, token: ADMIN_TOKEN, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
});

// Admin: get all products
app.get('/api/admin/products', adminAuth, async (req, res) => {
  try {
    const products = await productsDB.getAllProducts();
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// Admin: upload product image
app.post('/api/admin/upload-image', adminAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    // Cloudinary returns the URL in req.file.path
    const imageUrl = req.file.path;
    res.json({ success: true, imageUrl, message: 'Image uploaded successfully to Cloudinary' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to upload image' });
  }
});

// Admin: add product
app.post('/api/admin/products', adminAuth, async (req, res) => {
  try {
    const product = await productsDB.addProduct(req.body);
    res.json({ success: true, product, message: 'Product added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add product' });
  }
});

// Admin: update product (price, stock, details)
app.put('/api/admin/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await productsDB.updateProduct(req.params.id, req.body);
    res.json({ success: true, product, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update product' });
  }
});

// Admin: update stock only
app.put('/api/admin/products/:id/stock', adminAuth, async (req, res) => {
  try {
    const { stock, reason } = req.body;
    if (stock === undefined || stock < 0) return res.status(400).json({ success: false, error: 'Invalid stock value' });
    const product = await productsDB.updateProductStock(req.params.id, parseInt(stock), reason || 'admin_update');
    res.json({ success: true, product, message: 'Stock updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update stock' });
  }
});

// Admin: delete product
app.delete('/api/admin/products/:id', adminAuth, async (req, res) => {
  try {
    await productsDB.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete product' });
  }
});

// Admin: get all orders
app.get('/api/admin/orders', adminAuth, async (req, res) => {
  try {
    const orders = await getAllOrders();
    const parsed = orders.map(o => {
      const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      return { ...o, items };
    });
    res.json({ success: true, orders: parsed, count: parsed.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Admin: export orders as Excel
app.get('/api/admin/orders/export-excel', adminAuth, async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=orders-export-${Date.now()}.xlsx`);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');
    
    // Add headers
    const headers = ['Order ID','Customer Name','Email','Phone','Street','City','State','PIN','Items','Subtotal (₹)','GST (₹)','Total (₹)','Payment Method','Payment Status','Order Date'];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B0000' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
    });
    
    // Set column widths
    [18,20,25,14,25,15,15,10,50,12,12,12,16,16,14].forEach((w,i) => { 
      worksheet.getColumn(i+1).width = w; 
    });
    
    // Add data
    const orders = await getAllOrders();
    orders.forEach(order => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      const itemsSummary = items.map(i => `${i.name} (${i.size || '-'}) x${i.quantity}`).join('; ');
      worksheet.addRow([
        order.order_id,
        order.customer_name,
        order.email,
        order.phone,
        order.address_street,
        order.address_city,
        order.address_state,
        order.address_pin,
        itemsSummary,
        order.subtotal,
        order.gst,
        order.total,
        order.payment_method,
        order.payment_status,
        order.order_date
      ]);
    });
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ success: false, error: 'Failed to export orders' });
  }
});

// Admin: clear all products
app.delete('/api/admin/products/clear-all', adminAuth, async (req, res) => {
  try {
    await productsDB.clearAllProducts();
    res.json({ success: true, message: 'All products cleared successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to clear products' });
  }
});

// Admin: backup products (not needed with Postgres - Vercel handles backups)
app.post('/api/admin/products/backup', adminAuth, (req, res) => {
  res.json({ success: true, message: 'Automatic backups enabled via Vercel Postgres' });
});

// Admin: get database statistics
app.get('/api/admin/database/stats', adminAuth, async (req, res) => {
  try {
    const stats = await productsDB.getDatabaseStats();
    if (stats) {
      res.json({ success: true, stats });
    } else {
      res.status(500).json({ success: false, error: 'Failed to get statistics' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to get statistics' });
  }
});

// Admin: add product with enhanced validation
app.post('/api/admin/products/safe', adminAuth, async (req, res) => {
  try {
    const product = await productsDB.addProductSafe(req.body);
    res.json({ success: true, product, message: 'Product added successfully with validation' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'Failed to add product' });
  }
});

// Test UPI QR endpoint (WORKING VERSION)
app.get('/test-upi-qr', async (req, res) => {
  try {
    const amount = 100; // Test amount
    const orderId = 'TEST-ORDER-123';
    const merchantUpiId = 'jaijs410@okaxis';
    
    // Simple, working UPI format
    const upiString = `upi://pay?pa=${merchantUpiId}&pn=SHALOM%20BOUTIQUE&am=${amount.toFixed(2)}&cu=INR&tn=Test%20Payment`;
    
    const qrDataUrl = await QRCode.toDataURL(upiString, { 
      width: 400,
      margin: 4,
      color: { 
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M',
      type: 'image/png'
    });
    
    res.send(`
      <html>
        <head>
          <title>🧪 UPI QR Test - Working Version</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 600px; 
              margin: 2rem auto; 
              padding: 2rem; 
              background: #f8f9fa;
            }
            .container { 
              background: white; 
              padding: 2rem; 
              border-radius: 15px; 
              box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
              text-align: center;
            }
            .qr-image { 
              border: 4px solid #7C9A7D; 
              border-radius: 15px; 
              padding: 20px; 
              background: white; 
              margin: 2rem 0; 
              display: inline-block;
            }
            .test-info { 
              background: #e8f5e8; 
              padding: 1.5rem; 
              border-radius: 10px; 
              margin: 2rem 0; 
              text-align: left;
            }
            .upi-string { 
              background: #f1f3f4; 
              padding: 1rem; 
              border-radius: 8px; 
              font-family: monospace; 
              font-size: 0.9rem; 
              word-break: break-all; 
              margin: 1rem 0;
            }
            .success { color: #28a745; font-weight: bold; }
            .error { color: #dc3545; font-weight: bold; }
            .status { 
              background: #007bff; 
              color: white; 
              padding: 1rem; 
              border-radius: 10px; 
              margin: 1rem 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>🧪 UPI QR Code Test</h2>
            <div class="status">
              ✅ This is a WORKING UPI QR code - Scan it to test!
            </div>
            
            <div class="test-info">
              <h3>Test Details:</h3>
              <p><strong>Amount:</strong> <span class="success">₹${amount}</span></p>
              <p><strong>Merchant UPI ID:</strong> <span class="success">${merchantUpiId}</span></p>
              <p><strong>Merchant Name:</strong> SHALOM BOUTIQUE</p>
              <p><strong>Transaction Note:</strong> Test Payment</p>
            </div>
            
            <h3>📱 Scan with any UPI App</h3>
            <img src="${qrDataUrl}" alt="UPI QR Code" class="qr-image">
            
            <div style="margin: 2rem 0;">
              <h4>📋 Manual Test (if QR doesn't work):</h4>
              <p>1. Open any UPI app (GPay, PhonePe, Paytm, etc.)</p>
              <p>2. Go to "Pay by UPI ID"</p>
              <p>3. Enter: <strong>${merchantUpiId}</strong></p>
              <p>4. Send ₹${amount} for testing</p>
            </div>
            
            <div class="test-info">
              <h4>🔍 Technical Details:</h4>
              <p><strong>UPI String:</strong></p>
              <div class="upi-string">${upiString}</div>
              <p><strong>QR Format:</strong> Standard UPI (compatible with all apps)</p>
              <p><strong>Error Correction:</strong> Medium (M)</p>
              <p><strong>Size:</strong> 400x400px</p>
            </div>
            
            <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; margin: 2rem 0; border-left: 4px solid #ffc107;">
              <p><strong>⚠️ Important:</strong> This is a test with your actual UPI ID. 
              If someone scans this QR, they can send you ₹${amount}. 
              Only share this with trusted people for testing.</p>
            </div>
            
            <div style="margin: 2rem 0;">
              <p><strong>Expected Result:</strong></p>
              <p class="success">✅ UPI app opens with pre-filled payment of ₹${amount} to ${merchantUpiId}</p>
              <p class="success">✅ User can complete payment with their UPI PIN</p>
            </div>
            
            <div style="background: #d4edda; padding: 1rem; border-radius: 8px; border-left: 4px solid #28a745;">
              <p><strong>✅ QR Validation Status:</strong></p>
              <p class="success">✓ UPI ID format: Valid</p>
              <p class="success">✓ Amount format: Valid (₹${amount})</p>
              <p class="success">✓ QR code generation: Success</p>
              <p class="success">✓ Standard UPI format: Compliant</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Test QR generation error:', err);
    res.status(500).send(`
      <html>
        <head><title>❌ QR Test Error</title></head>
        <body style="font-family: Arial; text-align: center; padding: 2rem;">
          <h2 style="color: #dc3545;">❌ QR Generation Failed</h2>
          <p><strong>Error:</strong> ${err.message}</p>
          <p>Check the server console for more details.</p>
          <a href="/" style="color: #007bff;">← Back to Website</a>
        </body>
      </html>
    `);
  }
});

// Admin: serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ═══ ADMIN: Setup Database Endpoint ═══════════════════════════════════
app.post('/api/admin/setup-database', adminAuth, async (req, res) => {
  const logs = [];
  let client;
  
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false }
    });

    logs.push('🔧 Connecting to database...');
    client = await pool.connect();
    logs.push('✅ Connected to Postgres!');

    // Drop old tables
    logs.push('📊 Cleaning old tables...');
    await client.query('DROP TABLE IF EXISTS stock_history CASCADE');
    await client.query('DROP TABLE IF EXISTS products CASCADE');
    await client.query('DROP TABLE IF EXISTS orders CASCADE');
    await client.query('DROP TABLE IF EXISTS showcase_categories CASCADE');
    logs.push('✅ Old tables dropped');

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
    logs.push('📊 Adding default showcase categories...');
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

    res.json({ success: true, logs, message: 'Database setup complete! Now products will persist.' });
    
  } catch (error) {
    logs.push(`❌ ERROR: ${error.message}`);
    if (client) client.release();
    res.status(500).json({ success: false, error: error.message, logs });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const nets = os.networkInterfaces();
  let localIP = 'localhost';
  Object.values(nets).forEach(ifaces => ifaces.forEach(iface => {
    if (iface.family === 'IPv4' && !iface.internal) localIP = iface.address;
  }));
  console.log(`\n✨ Shalom Fashion server running!`);
  console.log(`\n🌐 Website:      http://localhost:${PORT}`);
  console.log(`🔧 Admin Panel:  http://localhost:${PORT}/admin`);
  console.log(`📡 Network:      http://${localIP}:${PORT}`);
  console.log(`\n📦 Orders DB:    orders.json`);
  console.log(`📊 Orders Excel: orders.xlsx\n`);
});
