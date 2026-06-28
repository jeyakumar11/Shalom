# 🚀 Complete Cloud Storage Migration Guide

Your application is now ready to use **Vercel Postgres** (database) and **Cloudinary** (images) for permanent data storage!

---

## 📋 What Was Created

### New Database Modules (Postgres-based):
- ✅ `database-postgres.js` - Orders management
- ✅ `products-database-postgres.js` - Products management  
- ✅ `showcase-database-postgres.js` - Showcase categories
- ✅ `cloudinary-config.js` - Image upload configuration

### Migration Tools:
- ✅ `database-schema.sql` - SQL schema for Postgres tables
- ✅ `migrate-to-postgres.js` - Automated data migration script

### Configuration:
- ✅ `.env` - Updated with Postgres + Cloudinary variables
- ✅ `package.json` - Added `@vercel/postgres`, `cloudinary` dependencies

### Old Files (Kept for backup):
- 📦 `database.js` - JSON-based (will be replaced)
- 📦 `products-database.js` - JSON-based (will be replaced)
- 📦 `showcase-database.js` - JSON-based (will be replaced)
- 📦 `products.json` - Will be migrated to Postgres
- 📦 `orders.json` - Will be migrated to Postgres
- 📦 `showcase-categories.json` - Will be migrated to Postgres

---

## 🎯 Migration Steps

### STEP 1: Setup Vercel Postgres

**1.1 Create Postgres Database**
```bash
# Login to Vercel CLI
vercel login

# Link your project
vercel link
```

**1.2 Enable Postgres in Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database** → **Postgres**
5. Choose **Free Plan** (256MB storage)
6. Click **Create**

**1.3 Get Connection String**
1. After creation, go to **.env.local** tab
2. Copy the `POSTGRES_URL` value
3. Add to your local `.env` file:
   ```
   POSTGRES_URL=postgres://user:password@host/database
   ```

**1.4 Create Database Tables**
1. In Vercel Dashboard → Storage → your Postgres database
2. Click **Query** tab
3. Copy and paste the **entire** contents of `database-schema.sql`
4. Click **Run Query**
5. Verify tables created: `products`, `orders`, `showcase_categories`, `stock_history`

---

### STEP 2: Setup Cloudinary

**2.1 Create Free Cloudinary Account**
1. Go to https://cloudinary.com/users/register/free
2. Sign up (free tier: 25GB storage, 25GB bandwidth/month)
3. Verify your email

**2.2 Get API Credentials**
1. After login, go to Dashboard
2. Find **Account Details** section
3. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

**2.3 Add to .env File**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

---

### STEP 3: Install New Dependencies

```bash
npm install
```

This installs:
- `@vercel/postgres` - Vercel Postgres client
- `cloudinary` - Cloudinary SDK
- `multer-storage-cloudinary` - Multer + Cloudinary integration

---

### STEP 4: Migrate Existing Data

**Run the migration script:**
```bash
npm run migrate
```

This will:
- ✅ Transfer all products from `products.json` → Postgres
- ✅ Transfer all orders from `orders.json` → Postgres
- ✅ Transfer showcase categories from `showcase-categories.json` → Postgres

**Expected output:**
```
╔═══════════════════════════════════════════════════════════╗
║   Shalom Fashion - Database Migration to Postgres        ║
╚═══════════════════════════════════════════════════════════╝

═══ Migrating Products ═══
📦 Found 25 products to migrate...
✅ Migrated: Elegant Silk Saree (indian)
✅ Migrated: Designer Lehenga (bridal)
...

📊 Products Migration Summary:
   ✅ Success: 25
   ❌ Errors: 0

═══ Migrating Orders ═══
📦 Found 12 orders to migrate...
✅ Migrated: SF-20260101-1234 (John Doe)
...

╔═══════════════════════════════════════════════════════════╗
║   ✅ Migration Complete!                                  ║
╚═══════════════════════════════════════════════════════════╝
```

---

### STEP 5: Update server.js

**Replace the old database imports with new Postgres ones:**

**FIND these lines** (around line 13-15):
```javascript
const { insertOrder, getAllOrders } = require('./database');
const productsDB = require('./products-database');
const showcaseDB = require('./showcase-database');
```

**REPLACE with:**
```javascript
const { insertOrder, getAllOrders } = require('./database-postgres');
const productsDB = require('./products-database-postgres');
const showcaseDB = require('./showcase-database-postgres');
```

**Replace multer configuration** (around line 20-45):

**FIND:**
```javascript
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});
```

**REPLACE with:**
```javascript
const { upload } = require('./cloudinary-config');
```

**Make all database functions async:**

Since Postgres queries are async, you need to add `async/await` to routes.

**Example - Update GET /api/products:**
```javascript
// OLD:
app.get('/api/products', (req, res) => {
  try {
    const products = productsDB.getAllProducts();
    res.json({ success: true, products, count: products.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// NEW:
app.get('/api/products', async (req, res) => {
  try {
    const products = await productsDB.getAllProducts();
    res.json({ success: true, products, count: products.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});
```

**Do this for ALL routes that use database functions!**

---

### STEP 6: Update Cloudinary Image URLs

After uploading images via admin panel, Cloudinary will return URLs like:
```
https://res.cloudinary.com/your_cloud_name/image/upload/v123/shalom-fashion/products/product-123.jpg
```

These will work automatically! The `cloudinary-config.js` handles everything.

---

### STEP 7: Test Locally

```bash
npm start
```

**Test checklist:**
- [ ] Website loads (http://localhost:3001)
- [ ] Products display correctly
- [ ] Admin login works
- [ ] Add new product with image upload (should upload to Cloudinary)
- [ ] Place a test order
- [ ] Check order appears in admin panel
- [ ] Verify data persists after server restart

---

### STEP 8: Add Environment Variables to Vercel

**Option A: Vercel Dashboard** (Recommended)
1. Go to https://vercel.com/dashboard
2. Select project → Settings → Environment Variables
3. Add these variables:

```
RAZORPAY_KEY_ID=rzp_test_T3oq9gSrBCfB3T
RAZORPAY_KEY_SECRET=snCqYA9JvFUUT7aqPNM7nCdg
EMAIL_APP_PASSWORD=tvrp vivx nxrt ilho
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=shalom-admin-2026
POSTGRES_URL=(copy from Vercel Storage tab)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Option B: Vercel CLI**
```bash
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
# (POSTGRES_URL is automatically added by Vercel Storage)
```

---

### STEP 9: Deploy to Vercel

```bash
# Deploy to preview
vercel

# After testing, deploy to production
vercel --prod
```

---

## ✅ Verification

After deployment, test:

1. **Website loads**: Visit your Vercel URL
2. **Products display**: Check all categories
3. **Admin panel**: Login and view dashboard
4. **Add product**: Upload image → should appear instantly
5. **Place order**: Test full checkout flow
6. **Check persistence**: Redeploy or wait 5 minutes, data should remain

---

## 🎉 Benefits

### Before (JSON Files):
- ❌ Data lost on redeploy
- ❌ Images lost on redeploy
- ❌ Manual file management
- ❌ No concurrent access support

### After (Postgres + Cloudinary):
- ✅ Data persists permanently
- ✅ Images stored in CDN (fast loading)
- ✅ Automatic backups (Vercel)
- ✅ Scalable for growth
- ✅ Multi-user support
- ✅ Professional production setup

---

## 🐛 Troubleshooting

### "POSTGRES_URL not defined"
**Solution:** Add `POSTGRES_URL` to Vercel environment variables from Storage tab

### "Cloudinary upload failed"
**Solution:** Verify `CLOUDINARY_*` credentials in `.env` and Vercel dashboard

### "Migration script errors"
**Solution:** 
1. Ensure `database-schema.sql` was run in Vercel Postgres first
2. Check `POSTGRES_URL` is correct
3. Verify JSON files exist and are valid

### "Cannot find module '@vercel/postgres'"
**Solution:** Run `npm install` to install new dependencies

### Images not loading after migration
**Solution:** Re-upload images via admin panel - old local images won't transfer automatically

---

## 📞 Need Help?

Check logs:
```bash
vercel logs --follow
```

View Postgres data:
```bash
# In Vercel Dashboard → Storage → Postgres → Query tab
SELECT * FROM products LIMIT 10;
SELECT * FROM orders LIMIT 10;
```

---

## 🎯 Next Steps

1. ✅ Complete Steps 1-9 above
2. ✅ Test thoroughly on Vercel
3. ✅ Set up custom domain (optional)
4. ✅ Enable automatic backups
5. ✅ Monitor usage in Vercel dashboard

**You're production-ready!** 🚀
