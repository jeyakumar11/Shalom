# ✅ Vercel Deployment Checklist - Cloud Migration

## 📋 Pre-Deployment Setup

### Step 1: Install Dependencies ⏱️ 2 minutes
```bash
npm install
```
**What this does:** Installs `@vercel/postgres`, `cloudinary`, and related packages

**Verify:**
```bash
npm list @vercel/postgres cloudinary
```

---

### Step 2: Setup Vercel Postgres ⏱️ 5 minutes

#### A. Create Database
1. Go to https://vercel.com/dashboard
2. Select your project (or create new)
3. Click **Storage** tab (left sidebar)
4. Click **Create Database**
5. Select **Postgres**
6. Choose **Free Plan** (256MB storage)
7. Click **Create**

#### B. Get Connection String
1. After creation, click **Connect**
2. Go to **.env.local** tab
3. Copy the `POSTGRES_URL` value

#### C. Add to Local .env
Open your `.env` file and add:
```env
POSTGRES_URL=postgres://default:xxxxx@xxxxx.vercel-storage.com:5432/verceldb
```

#### D. Create Database Tables
1. In Vercel Dashboard → Storage → Your Postgres DB
2. Click **Query** tab
3. Open `database-schema.sql` in your editor
4. Copy **entire contents**
5. Paste into Vercel Query editor
6. Click **Run Query**

**Verify tables created:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- `products`
- `orders`
- `showcase_categories`
- `stock_history`

---

### Step 3: Setup Cloudinary ⏱️ 3 minutes

#### A. Create Free Account
1. Go to https://cloudinary.com/users/register/free
2. Sign up with email
3. Verify email

#### B. Get Credentials
1. After login, go to **Dashboard**
2. Find **Account Details** section (top right)
3. Copy these values:
   - **Cloud Name**
   - **API Key**
   - **API Secret** (click "eye" icon to reveal)

#### C. Add to Local .env
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

---

### Step 4: Update server.js ⏱️ 5 minutes

#### Option A: Automatic (Recommended)
```bash
node update-server-for-postgres.js
```

This script:
- ✅ Creates backup (`server.js.backup`)
- ✅ Updates database imports
- ✅ Adds Cloudinary config
- ✅ Comments out old multer storage
- ⚠️ Lists routes that need manual async/await

#### Option B: Manual
Open `server.js` and make these changes:

**Line ~13-15** (database imports):
```javascript
// OLD:
const { insertOrder, getAllOrders } = require('./database');
const productsDB = require('./products-database');
const showcaseDB = require('./showcase-database');

// NEW:
const { insertOrder, getAllOrders } = require('./database-postgres');
const productsDB = require('./products-database-postgres');
const showcaseDB = require('./showcase-database-postgres');
```

**After line ~11** (add Cloudinary):
```javascript
const { upload, cloudinary } = require('./cloudinary-config');
```

**Line ~20-45** (remove old multer config):
```javascript
// Delete or comment out the entire local multer storage configuration
// (from "const uploadDir = ..." to "...}};")
// It's replaced by Cloudinary config
```

**All database routes** - Add `async` and `await`:
```javascript
// Example: GET /api/products
// OLD:
app.get('/api/products', (req, res) => {
  const products = productsDB.getAllProducts();
  ...
});

// NEW:
app.get('/api/products', async (req, res) => {
  const products = await productsDB.getAllProducts();
  ...
});
```

**Routes to update** (add `async` and `await`):
- `GET /api/products`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `POST /api/place-order`
- `GET /api/orders`
- `GET /api/admin/orders`
- `GET /api/showcase-categories`
- `GET /api/admin/showcase-categories`
- `POST /api/admin/showcase-categories`
- `PUT /api/admin/showcase-categories/:id`
- `DELETE /api/admin/showcase-categories/:id`

---

### Step 5: Migrate Existing Data ⏱️ 2 minutes

```bash
npm run migrate
```

**What this does:**
- ✅ Transfers all products from `products.json` → Postgres
- ✅ Transfers all orders from `orders.json` → Postgres
- ✅ Transfers showcase categories from `showcase-categories.json` → Postgres

**Expected output:**
```
╔═══════════════════════════════════════════════════════════╗
║   Shalom Fashion - Database Migration to Postgres        ║
╚═══════════════════════════════════════════════════════════╝

═══ Migrating Products ═══
📦 Found 25 products to migrate...
✅ Migrated: Elegant Silk Saree (indian)
...
📊 Products Migration Summary:
   ✅ Success: 25
   ❌ Errors: 0

✅ Migration Complete!
```

**If errors occur:**
- Check `POSTGRES_URL` is correct in `.env`
- Verify `database-schema.sql` was run in Vercel
- Check JSON files exist and are valid

---

### Step 6: Test Locally ⏱️ 5 minutes

```bash
npm start
```

Visit: http://localhost:3001

**Test Checklist:**
- [ ] Website loads
- [ ] Products display in all categories
- [ ] Admin login works (`admin123`)
- [ ] View products in admin panel
- [ ] Add new product with image upload
- [ ] Image uploads to Cloudinary (check URL)
- [ ] Place test order
- [ ] Order appears in admin panel
- [ ] Restart server → data persists ✅

**Check Cloudinary:**
- Go to https://cloudinary.com/console/media_library
- See uploaded images in `shalom-fashion/products` folder

---

## 🚀 Vercel Deployment

### Step 7: Add Environment Variables to Vercel ⏱️ 5 minutes

#### Option A: Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable for **Production, Preview, Development**:

```env
RAZORPAY_KEY_ID=rzp_test_T3oq9gSrBCfB3T
RAZORPAY_KEY_SECRET=snCqYA9JvFUUT7aqPNM7nCdg
EMAIL_APP_PASSWORD=tvrp vivx nxrt ilho
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=shalom-admin-2026
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Note:** `POSTGRES_URL` is automatically added by Vercel Storage (no need to add manually)

#### Option B: Vercel CLI
```bash
vercel env add CLOUDINARY_CLOUD_NAME
# Enter value, select all environments

vercel env add CLOUDINARY_API_KEY
# Enter value, select all environments

vercel env add CLOUDINARY_API_SECRET
# Enter value, select all environments

# Repeat for other variables
```

**Verify:**
```bash
vercel env ls
```

---

### Step 8: Deploy to Vercel ⏱️ 3 minutes

#### First Time / Preview Deploy:
```bash
vercel
```

Follow prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No (or Yes if exists)
- **What's your project's name?** → shalom-fashion
- **In which directory?** → ./
- **Override settings?** → No

**Test preview URL before production!**

#### Production Deploy:
```bash
vercel --prod
```

**Your site is live!** 🎉

---

## ✅ Post-Deployment Verification

### Step 9: Test Production Site ⏱️ 10 minutes

Visit your Vercel production URL (e.g., `https://shalom-fashion.vercel.app`)

**Full Test Checklist:**

#### Frontend Tests:
- [ ] Homepage loads
- [ ] Hero carousel works
- [ ] All category tabs work (Indian, Western, Bridal, Accessories)
- [ ] Showcase cards filter products correctly
- [ ] Product cards display with images
- [ ] Add to cart works
- [ ] Cart sidebar opens/closes
- [ ] Cart quantity updates
- [ ] Cart total calculates correctly
- [ ] Theme toggle works (light/dark)

#### Checkout Tests:
- [ ] Checkout form validation works
- [ ] Razorpay payment opens
- [ ] Test payment completes (use test card)
- [ ] UPI QR generates
- [ ] COD option available
- [ ] Order confirmation appears

#### Admin Tests:
- [ ] Admin login works
- [ ] Dashboard shows statistics
- [ ] Products list displays
- [ ] Add new product works
- [ ] Image upload to Cloudinary works
- [ ] Edit product works
- [ ] Delete product works
- [ ] Orders list displays
- [ ] Order details show correctly
- [ ] Showcase categories management works
- [ ] Export orders to Excel works

#### Data Persistence Test:
- [ ] Redeploy: `vercel --prod --force`
- [ ] Wait 5 minutes
- [ ] Check products still there ✅
- [ ] Check orders still there ✅
- [ ] Check images still display ✅

---

## 🐛 Troubleshooting Guide

### Issue: "Cannot connect to database"
**Check:**
```bash
vercel env ls
# Ensure POSTGRES_URL is set
```
**Fix:** Add `POSTGRES_URL` in Vercel Dashboard → Settings → Environment Variables

---

### Issue: "Cloudinary upload failed"
**Check .env values:**
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
**Fix:** Verify credentials at https://cloudinary.com/console

---

### Issue: "Products not displaying"
**Check database:**
```bash
# In Vercel Dashboard → Storage → Postgres → Query tab:
SELECT COUNT(*) FROM products;
```
**Fix:** Run migration again: `npm run migrate`

---

### Issue: "Images not loading"
**Check Cloudinary:**
- Go to https://cloudinary.com/console/media_library
- Look for `shalom-fashion/products` folder
- Verify images uploaded

**Fix:** Re-upload images via admin panel

---

### Issue: "Server error 500"
**View logs:**
```bash
vercel logs --follow
```
**Common causes:**
- Missing environment variable
- Database connection issue
- Async/await not properly added to routes

---

## 📊 Monitoring & Maintenance

### View Logs:
```bash
vercel logs
vercel logs --follow  # Real-time
```

### Check Database Usage:
- Vercel Dashboard → Storage → Postgres
- View: Storage used, queries/day

### Check Cloudinary Usage:
- Cloudinary Dashboard → Usage
- View: Storage used, bandwidth, transformations

### Database Backups:
- Vercel Postgres: Automatic daily backups (retained 7 days)
- Manual export:
  ```bash
  # In Vercel Query tab:
  SELECT * FROM products;
  # Export as CSV
  ```

---

## 🎉 Success!

### Your Application Now Has:
- ✅ Permanent data storage (Vercel Postgres)
- ✅ CDN-hosted images (Cloudinary)
- ✅ Production-grade infrastructure
- ✅ Automatic backups
- ✅ Scalable architecture
- ✅ Free tier for both services

### Performance:
- **Database queries**: ~10-50ms
- **Image loading**: CDN-optimized (auto format/quality)
- **Uptime**: 99.9% (Vercel SLA)
- **Storage**: 256MB DB + 25GB images (free tier)

### You Can Now:
- ✅ Handle unlimited traffic (within free tier limits)
- ✅ Add thousands of products
- ✅ Process orders reliably
- ✅ Scale as business grows
- ✅ Set up custom domain
- ✅ Enable analytics

---

## 🚀 Next Steps (Optional)

### 1. Custom Domain
- Vercel Dashboard → Domains → Add Domain
- Follow DNS setup instructions

### 2. Analytics
- Vercel Dashboard → Analytics → Enable

### 3. Performance Monitoring
- Vercel Dashboard → Speed Insights → Enable

### 4. Upgrade Plans (When Needed)
- Vercel Pro: $20/month (more bandwidth, team features)
- Cloudinary Plus: $89/month (100GB storage)

---

## 📞 Support Resources

### Vercel:
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support
- Status: https://vercel-status.com

### Cloudinary:
- Docs: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com

### Your Application:
- Issues: Check `vercel logs`
- Database: Vercel Dashboard → Storage → Postgres
- Images: Cloudinary Dashboard → Media Library

---

**Congratulations! Your Shalom Fashion application is production-ready!** 🎊
