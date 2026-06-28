# 🚀 Vercel Deployment Guide for Shalom Fashion

## ⚠️ IMPORTANT: Current Limitations

Your application currently uses **local file storage** which **WILL NOT WORK** on Vercel's serverless platform because:

1. **JSON file writes** (`products.json`, `orders.json`, `showcase-categories.json`) - Vercel's filesystem is **read-only** and **ephemeral**
2. **Image uploads** (`/public/uploads/`) - Local file storage is **lost** after each function invocation
3. **Excel file writes** (`orders.xlsx`) - Cannot persist on serverless

## ✅ Quick Deploy (Read-Only Mode - FOR TESTING ONLY)

You can deploy the current version to test the UI, but **data will NOT persist**:

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Set Environment Variables

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add these variables:

```
RAZORPAY_KEY_ID=rzp_test_T3oq9gSrBCfB3T
RAZORPAY_KEY_SECRET=snCqYA9JvFUUT7aqPNM7nCdg
EMAIL_APP_PASSWORD=tvrp vivx nxrt ilho
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=shalom-admin-2026
PORT=3001
```

**Option B: Via CLI**
```bash
vercel env add RAZORPAY_KEY_ID
# Enter: rzp_test_T3oq9gSrBCfB3T

vercel env add RAZORPAY_KEY_SECRET
# Enter: snCqYA9JvFUUT7aqPNM7nCdg

vercel env add EMAIL_APP_PASSWORD
# Enter: tvrp vivx nxrt ilho

vercel env add ADMIN_PASSWORD
# Enter: admin123

vercel env add ADMIN_TOKEN
# Enter: shalom-admin-2026
```

### Step 4: Deploy
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Link to existing project?** → No (first time) or Yes (if you already created one)
- **Project name?** → shalom-fashion (or your choice)
- **Directory?** → ./ (current directory)
- **Override settings?** → No

### Step 5: Deploy to Production
```bash
vercel --prod
```

---

## 🔥 PRODUCTION DEPLOYMENT (REQUIRED FOR REAL USE)

For a **fully functional production deployment**, you need to migrate from file-based storage to cloud services:

### Required Migrations

#### 1. **Database Migration** (Choose ONE)

**Option A: Vercel Postgres (Recommended)**
- Free tier: 256 MB storage
- Native Vercel integration
- [Setup Guide](https://vercel.com/docs/storage/vercel-postgres)

**Option B: MongoDB Atlas**
- Free tier: 512 MB storage
- Popular NoSQL database
- [Setup Guide](https://www.mongodb.com/cloud/atlas)

**Option C: Supabase**
- Free tier: 500 MB storage + PostgreSQL
- Includes authentication
- [Setup Guide](https://supabase.com/docs)

#### 2. **File Upload Migration** (Choose ONE)

**Option A: Cloudinary (Recommended for Images)**
- Free tier: 25 GB storage, 25 GB bandwidth
- Image optimization built-in
- [Setup Guide](https://cloudinary.com/documentation)

**Option B: AWS S3**
- Pay-as-you-go
- Highly scalable
- [Setup Guide](https://docs.aws.amazon.com/s3/)

**Option C: Vercel Blob Storage**
- Native Vercel integration
- Simple API
- [Setup Guide](https://vercel.com/docs/storage/vercel-blob)

---

## 📋 Migration Checklist

### Phase 1: Database Setup
- [ ] Choose database provider (Vercel Postgres / MongoDB / Supabase)
- [ ] Create database instance
- [ ] Get connection string
- [ ] Add `DATABASE_URL` to Vercel environment variables

### Phase 2: Code Refactoring
- [ ] Replace `database.js` with database client (e.g., `@vercel/postgres`, `mongoose`, `@supabase/supabase-js`)
- [ ] Replace `products-database.js` with database queries
- [ ] Replace `showcase-database.js` with database queries
- [ ] Create database schema/tables:
  - `products` table
  - `orders` table
  - `showcase_categories` table
  - `stock_history` table
- [ ] Migrate existing JSON data to database

### Phase 3: File Upload Setup
- [ ] Choose file storage provider (Cloudinary / S3 / Vercel Blob)
- [ ] Get API credentials
- [ ] Add credentials to Vercel environment variables
- [ ] Replace multer local storage with cloud storage SDK
- [ ] Update image URLs in database

### Phase 4: Testing
- [ ] Test product CRUD operations
- [ ] Test order placement
- [ ] Test image uploads
- [ ] Test payment flows (Razorpay + UPI)
- [ ] Test email confirmations
- [ ] Test admin panel

### Phase 5: Production Deploy
- [ ] Run `vercel --prod`
- [ ] Test all features on production URL
- [ ] Set up custom domain (optional)
- [ ] Monitor logs: `vercel logs`

---

## 🔧 Example: Vercel Postgres Migration

### 1. Install Vercel Postgres
```bash
npm install @vercel/postgres
```

### 2. Enable Vercel Postgres
```bash
vercel env add POSTGRES_URL
```
(Get this from Vercel Dashboard → Storage → Postgres)

### 3. Create Tables
```sql
-- products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image VARCHAR(255),
  sku VARCHAR(50) UNIQUE,
  barcode VARCHAR(50) UNIQUE,
  sizes JSONB,
  description TEXT,
  fabric VARCHAR(100),
  occasion VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- orders table
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

-- showcase_categories table
CREATE TABLE showcase_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  image VARCHAR(255),
  category VARCHAR(50),
  filter_tag VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- stock_history table
CREATE TABLE stock_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  old_stock INTEGER,
  new_stock INTEGER,
  change_amount INTEGER,
  change_reason VARCHAR(255),
  order_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Replace `database.js` (Example)
```javascript
const { sql } = require('@vercel/postgres');

async function insertOrder(orderData) {
  await sql`
    INSERT INTO orders (
      order_id, customer_name, email, phone,
      address_street, address_city, address_state, address_pin,
      items, subtotal, gst, total,
      payment_method, payment_status, payment_id, order_date
    ) VALUES (
      ${orderData.order_id}, ${orderData.customer_name}, ${orderData.email}, ${orderData.phone},
      ${orderData.address_street}, ${orderData.address_city}, ${orderData.address_state}, ${orderData.address_pin},
      ${orderData.items}::jsonb, ${orderData.subtotal}, ${orderData.gst}, ${orderData.total},
      ${orderData.payment_method}, ${orderData.payment_status}, ${orderData.payment_id}, ${orderData.order_date}
    )
  `;
}

async function getAllOrders() {
  const { rows } = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
  return rows;
}

module.exports = { insertOrder, getAllOrders };
```

---

## 🔧 Example: Cloudinary Image Upload

### 1. Install Cloudinary
```bash
npm install cloudinary multer-storage-cloudinary
```

### 2. Add Cloudinary Credentials to Vercel
```bash
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
```

### 3. Update `server.js` Multer Config
```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shalom-fashion',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});
```

---

## 🐛 Common Vercel Errors

### Error: "EROFS: read-only file system"
**Cause:** Trying to write to local filesystem  
**Solution:** Migrate to database + cloud storage (see above)

### Error: "Module not found"
**Cause:** Missing dependencies  
**Solution:** Run `npm install` and ensure `package.json` is complete

### Error: "Environment variable not found"
**Cause:** Missing env vars in Vercel  
**Solution:** Add all variables in Vercel Dashboard → Settings → Environment Variables

### Error: "Function execution timeout"
**Cause:** Long-running operations  
**Solution:** Optimize database queries, use async/await properly

---

## 📞 Need Help with Migration?

If you want me to:
1. **Migrate to Vercel Postgres** - I can refactor all database files
2. **Set up Cloudinary uploads** - I can replace multer with cloud storage
3. **Create migration scripts** - I can help transfer existing JSON data to database

Just let me know which database and file storage provider you prefer, and I'll handle the full migration!

---

## 🎯 Quick Decision Guide

| Your Priority | Database | File Storage | Effort | Cost |
|--------------|----------|--------------|--------|------|
| **Fastest setup** | Vercel Postgres | Vercel Blob | Medium | Free tier |
| **Most popular** | MongoDB Atlas | Cloudinary | Medium | Free tier |
| **All-in-one** | Supabase | Supabase Storage | Low | Free tier |
| **Enterprise** | AWS RDS | AWS S3 | High | Pay-as-you-go |

**My Recommendation:** Vercel Postgres + Cloudinary (best balance of simplicity, features, and free tier limits)

---

## 📝 Current Environment Variables Summary

Your `.env` file has:
```
PORT=3001
RAZORPAY_KEY_ID=rzp_test_T3oq9gSrBCfB3T
RAZORPAY_KEY_SECRET=snCqYA9JvFUUT7aqPNM7nCdg
EMAIL_APP_PASSWORD=tvrp vivx nxrt ilho
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=shalom-admin-2026
```

**⚠️ NEVER commit `.env` to git!** (It's already in `.gitignore`)

**To use in Vercel:** Add each variable individually in Vercel Dashboard → Project → Settings → Environment Variables

---

## 🚀 Ready to Deploy?

**Option 1: Test Deploy (Current Code - Read-Only)**
```bash
vercel
```

**Option 2: Production Deploy (After Migration)**
1. Choose your database + file storage
2. Tell me your choices
3. I'll refactor the code
4. Deploy to Vercel

Let me know how you'd like to proceed! 🎉
