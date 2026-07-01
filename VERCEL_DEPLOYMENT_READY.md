# 🚀 VERCEL DEPLOYMENT CHECKLIST

## ✅ YES! You Can Deploy to Vercel Once Supabase is Connected

**Requirements:**
- ✅ Supabase database connected (not JSON files)
- ✅ All environment variables configured
- ✅ Code pushed to GitHub
- ✅ Vercel project created

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Step 1: Verify Supabase is Connected

**Start your server:**
```cmd
node server.js
```

**Look for these messages:**
```
✅ Connected to Postgres database
✅ [PRODUCTS] Connected to Postgres
✅ [SHOWCASE] Connected to Postgres
```

**If you see this instead, STOP:**
```
⚠️ Using local JSON files
```
→ Fix Supabase first! See `FIX_SUPABASE_NOW.md`

---

### ✅ Step 2: Test Database Connection

**Visit:** http://localhost:3001/api/debug/env

**You should see:**
```json
{
  "database": {
    "mode": "postgres",  ← Must be "postgres" not "json"
    "postgres_connected": true,  ← Must be true
    "message": "Connected to Postgres database"
  },
  "hasPostgresUrl": true,
  "hasCloudinaryName": true,
  "hasCloudinaryKey": true,
  "hasCloudinarySecret": true,
  "hasAdminPassword": true,
  "hasAdminToken": true,
  "hasRazorpayKeyId": true,
  "hasRazorpaySecret": true,
  "hasEmailPassword": true
}
```

**All values should be `true`!**

---

### ✅ Step 3: Test Adding a Product

1. Go to http://localhost:3001/admin.html
2. Login with credentials
3. Add a test product with image
4. **Check console** - should see:
   ```
   ✅ [POSTGRES] Product added: Test Product
   ```
   **NOT:** `✅ [JSON] Product added`

5. Verify in Supabase:
   - Go to Supabase Dashboard → Table Editor → `products`
   - Your product should be there!

---

### ✅ Step 4: Verify All Environment Variables

**Check your `.env` file has all 9 variables:**

```env
PORT=3001
POSTGRES_URL=postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
CLOUDINARY_CLOUD_NAME=djn3eb2ht
CLOUDINARY_API_KEY=538668853245255
CLOUDINARY_API_SECRET=gLF0dkFsIsi-JtzzTGWh9x90V9g
RAZORPAY_KEY_ID=rzp_test_T3oq9gSrBCfB3T
RAZORPAY_KEY_SECRET=snCqYA9JvFUUT7aqPNM7nCdg
EMAIL_APP_PASSWORD=tvrp vivx nxrt ilho
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=shalom-admin-2026
```

⚠️ **Important:** Make sure `.env` is in `.gitignore` (it should be!)

---

## 🌐 DEPLOY TO VERCEL

### Option A: Using Vercel Dashboard (Recommended)

#### 1. Push to GitHub

```cmd
cd "e:\Shalom website\Shalom"
git add .
git commit -m "Ready for Vercel deployment with Supabase"
git push origin master
```

#### 2. Connect to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Click **"Import"** on your Shalom project
4. **Don't click Deploy yet!** → Configure environment variables first

#### 3. Add Environment Variables

In Vercel import screen:
1. Scroll to **"Environment Variables"** section
2. Add **all 9 variables** from your `.env` file:

**Add one by one:**
```
Name: POSTGRES_URL
Value: postgres://postgres.[YOUR-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

Name: CLOUDINARY_CLOUD_NAME
Value: djn3eb2ht

Name: CLOUDINARY_API_KEY
Value: 538668853245255

Name: CLOUDINARY_API_SECRET
Value: gLF0dkFsIsi-JtzzTGWh9x90V9g

Name: RAZORPAY_KEY_ID
Value: rzp_test_T3oq9gSrBCfB3T

Name: RAZORPAY_KEY_SECRET
Value: snCqYA9JvFUUT7aqPNM7nCdg

Name: EMAIL_APP_PASSWORD
Value: tvrp vivx nxrt ilho

Name: ADMIN_PASSWORD
Value: admin123

Name: ADMIN_TOKEN
Value: shalom-admin-2026
```

⚠️ **Critical:** Make sure `POSTGRES_URL` is your **working** Supabase connection string!

#### 4. Deploy

1. Click **"Deploy"** button
2. ⏳ Wait 2-3 minutes for build
3. ✅ Your site will be live!

---

### Option B: Using Vercel CLI

#### 1. Install Vercel CLI (if not installed)

```cmd
npm install -g vercel
```

#### 2. Login to Vercel

```cmd
vercel login
```

#### 3. Link Your Project

```cmd
cd "e:\Shalom website\Shalom"
vercel link
```

#### 4. Add Environment Variables

```cmd
vercel env add POSTGRES_URL production
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_API_SECRET production
vercel env add RAZORPAY_KEY_ID production
vercel env add RAZORPAY_KEY_SECRET production
vercel env add EMAIL_APP_PASSWORD production
vercel env add ADMIN_PASSWORD production
vercel env add ADMIN_TOKEN production
```

Enter each value when prompted.

#### 5. Deploy

```cmd
vercel --prod
```

---

## ✅ AFTER DEPLOYMENT

### 1. Verify Deployment

Visit your Vercel URL (e.g., `https://shalom.vercel.app`)

**Check these pages:**
- ✅ Homepage loads with UI
- ✅ Products section shows items (if you added any)
- ✅ Admin panel accessible at `/admin.html`
- ✅ Showcase categories appear
- ✅ Cart functionality works

### 2. Check Database Connection

Visit: `https://your-site.vercel.app/api/debug/env`

**Should show:**
```json
{
  "database": {
    "mode": "postgres",
    "postgres_connected": true
  }
}
```

**If showing "json" mode:**
- ❌ Environment variables not set correctly in Vercel
- ❌ Supabase connection string is wrong

### 3. Test Adding a Product

1. Go to `https://your-site.vercel.app/admin.html`
2. Login with credentials
3. Add a product
4. Check Supabase database → Product should be there
5. Refresh homepage → Product should appear

### 4. Check Vercel Logs

In Vercel Dashboard:
1. Go to your project
2. Click **"Functions"** tab
3. Click on any function to see logs
4. Look for:
   ```
   ✅ Connected to Postgres database
   ✅ [PRODUCTS] Connected to Postgres
   ```

---

## 🔧 TROUBLESHOOTING

### Issue: Build Fails

**Check Vercel build logs for errors:**

**Common fixes:**
1. Make sure `package.json` has all dependencies
2. Check `vercel.json` is correct
3. Ensure `server.js` has no syntax errors

**Current build config:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

---

### Issue: Site Shows "json" Mode in Production

**Cause:** Environment variables not set in Vercel

**Fix:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Verify all 9 variables are present
3. Check `POSTGRES_URL` value is correct
4. Redeploy: Dashboard → Deployments → ⋯ → Redeploy

---

### Issue: Images Not Uploading

**Cause:** Cloudinary credentials not working

**Fix:**
1. Verify Cloudinary credentials in Vercel environment variables
2. Test locally first: `node server.js` → Add product with image
3. Check Cloudinary dashboard for uploads

---

### Issue: Payments Not Working

**Cause:** Razorpay keys might be test keys

**For Production:**
1. Go to https://dashboard.razorpay.com
2. Switch to **Live Mode** (top left)
3. Get **Live Keys** (not test keys)
4. Update Vercel environment variables:
   - `RAZORPAY_KEY_ID=rzp_live_...`
   - `RAZORPAY_KEY_SECRET=...`

⚠️ **Test Mode vs Live Mode:**
- Test: `rzp_test_...` (for development)
- Live: `rzp_live_...` (for production)

---

### Issue: "Unauthorized" in Admin Panel

**Cause:** Admin credentials not working

**Fix:**
1. Check Vercel environment variables have:
   - `ADMIN_PASSWORD=admin123`
   - `ADMIN_TOKEN=shalom-admin-2026`
2. Try hard refresh (Ctrl+Shift+R)
3. Clear browser cache

---

### Issue: Database Connection Timeout

**Cause:** Supabase connection string might be wrong

**Fix:**
1. Go to Supabase Dashboard → Settings → Database
2. Get **Transaction** connection string
3. Update in Vercel environment variables
4. Redeploy

---

## 📊 PRODUCTION CHECKLIST

Before going live with customers:

### Security:
- [ ] Change default admin password (`admin123` → strong password)
- [ ] Change admin token (`shalom-admin-2026` → random string)
- [ ] Switch Razorpay to **Live Mode** keys
- [ ] Enable HTTPS (Vercel does this automatically)
- [ ] Review Supabase security rules

### Testing:
- [ ] Test product CRUD (Create, Read, Update, Delete)
- [ ] Test order placement end-to-end
- [ ] Test payment gateway with real cards
- [ ] Test email notifications
- [ ] Test on mobile devices
- [ ] Test all showcase categories
- [ ] Test search functionality
- [ ] Test cart operations

### Performance:
- [ ] Add at least 10-20 products
- [ ] Optimize images (Cloudinary does this)
- [ ] Test page load speed
- [ ] Check Vercel analytics

### SEO (Optional):
- [ ] Add meta descriptions to `index.html`
- [ ] Add Open Graph tags
- [ ] Create sitemap
- [ ] Set up Google Analytics

---

## 🔄 CONTINUOUS DEPLOYMENT

Once set up, deployment is automatic:

```cmd
# Make changes to your code
git add .
git commit -m "Update feature X"
git push origin master
```

→ Vercel automatically detects push and redeploys! ✅

**No manual deployment needed!**

---

## 📞 GETTING YOUR VERCEL URL

After first deployment, you'll get:
- **Default:** `https://shalom-xxxxx.vercel.app`
- **Custom:** You can add your own domain later

**To add custom domain:**
1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `shalomfashion.com`)
3. Update DNS records as instructed
4. ✅ Site accessible at your domain!

---

## 💡 IMPORTANT NOTES

### 1. JSON Files Are Ignored in Production
Vercel doesn't persist file system changes, so:
- ❌ `products.json` won't work on Vercel
- ❌ `orders.json` won't work on Vercel
- ✅ **You MUST use Supabase** for production

### 2. Logs Are Available
Check Vercel logs:
- Dashboard → Project → Functions
- Real-time logs during requests
- Error tracking

### 3. Free Tier Limits
Vercel free tier includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Custom domains
- ⚠️ 10 seconds function timeout

### 4. Supabase Free Tier
Supabase free tier includes:
- ✅ 500MB database storage
- ✅ 1GB file storage
- ✅ 2GB bandwidth/month
- ✅ Up to 50,000 monthly active users

---

## 🎯 SUMMARY

**Can you deploy to Vercel?**
✅ **YES** - Once Supabase is connected (not JSON mode)

**What you need:**
1. ✅ Supabase database working locally
2. ✅ All 9 environment variables
3. ✅ Code pushed to GitHub
4. ✅ Vercel project created

**Deployment time:**
⏱️ **5-10 minutes** (first time)
⏱️ **2-3 minutes** (subsequent deploys)

**Cost:**
💰 **FREE** (Vercel + Supabase free tiers)

---

## 🚀 NEXT STEPS

### If Supabase is NOT connected yet:
1. Follow **`FIX_SUPABASE_NOW.md`**
2. Get Supabase working locally first
3. Then come back here to deploy

### If Supabase IS connected:
1. ✅ Verify with checklist above
2. ✅ Push to GitHub
3. ✅ Add environment variables to Vercel
4. ✅ Click Deploy!
5. ✅ Your site will be live!

---

**Ready to deploy?** Make sure you see `✅ Connected to Postgres database` first!
