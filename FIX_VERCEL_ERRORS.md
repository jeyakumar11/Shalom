# 🔧 FIX VERCEL DEPLOYMENT ERRORS

## 🚨 Issues Detected in Your Logs:

### 1. ❌ 401 Unauthorized - Admin endpoints
```
GET 401 /api/admin/orders
GET 401 /api/admin/products
POST 401 /api/admin/upload-image
```
**Cause:** `ADMIN_TOKEN` environment variable not set in Vercel

### 2. ❌ 500 Internal Server Error - Showcase categories
```
GET 500 /api/showcase-categories
⚠️ [SHOWCASE] Using local JSON files
```
**Cause:** Showcase database trying to read JSON file (doesn't exist in Vercel)

### 3. ⚠️ Using JSON files instead of Supabase
```
⚠️ [SHOWCASE] Using local JSON files
```
**Cause:** `POSTGRES_URL` not set or incorrect in Vercel

---

## ✅ SOLUTION - Fix Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Click on your **"shalom"** project
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in left sidebar

---

### Step 2: Verify All 9 Environment Variables

**Check if these exist and are correct:**

| Variable Name | Status | Value Format |
|---------------|--------|--------------|
| `POSTGRES_URL` | ⚠️ Check | `postgres://postgres.[REF]:[PASSWORD]@...` |
| `CLOUDINARY_CLOUD_NAME` | ✅ Should exist | `djn3eb2ht` |
| `CLOUDINARY_API_KEY` | ✅ Should exist | `538668853245255` |
| `CLOUDINARY_API_SECRET` | ✅ Should exist | `gLF0dkFsIsi-JtzzTGWh9x90V9g` |
| `RAZORPAY_KEY_ID` | ✅ Should exist | `rzp_test_T3oq9gSrBCfB3T` |
| `RAZORPAY_KEY_SECRET` | ✅ Should exist | `snCqYA9JvFUUT7aqPNM7nCdg` |
| `EMAIL_APP_PASSWORD` | ✅ Should exist | `tvrp vivx nxrt ilho` |
| `ADMIN_PASSWORD` | ❌ Likely missing | `admin123` |
| `ADMIN_TOKEN` | ❌ Likely missing | `shalom-admin-2026` |

---

### Step 3: Add Missing Environment Variables

**Click "Add New" button for each missing variable:**

#### Add ADMIN_TOKEN (Critical - Fixes 401 errors)
```
Name: ADMIN_TOKEN
Value: shalom-admin-2026
```
**Apply to:** Production, Preview, Development (select all 3)

#### Add ADMIN_PASSWORD
```
Name: ADMIN_PASSWORD
Value: admin123
```
**Apply to:** Production, Preview, Development (select all 3)

#### Verify POSTGRES_URL (Critical - Fixes 500 errors)
```
Name: POSTGRES_URL
Value: postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**⚠️ IMPORTANT:** This must be your **working** Supabase connection string!

**To verify it's correct:**
1. Go to https://supabase.com/dashboard
2. Open your project
3. Go to Settings → Database
4. Copy the **Transaction** mode connection string
5. Replace `[YOUR-PASSWORD]` with your actual database password

---

### Step 4: Redeploy

After adding/updating environment variables:

**Option A: Via Dashboard**
1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"⋯"** (three dots) menu
4. Click **"Redeploy"**
5. Check **"Use existing Build Cache"**
6. Click **"Redeploy"**

**Option B: Via Git Push**
```cmd
cd "e:\Shalom website\Shalom"
git commit --allow-empty -m "Trigger redeploy after env vars"
git push origin master
```

⏳ Wait 2-3 minutes for deployment to complete

---

### Step 5: Verify the Fix

#### Test 1: Check Database Connection
Visit: `https://shalom-git-master-iamj41.vercel.app/api/debug/env`

**Should show:**
```json
{
  "database": {
    "mode": "postgres",
    "postgres_connected": true,
    "message": "Connected to Postgres database"
  },
  "hasAdminToken": true,
  "hasAdminPassword": true
}
```

**If still showing "json" mode:**
- ❌ `POSTGRES_URL` is wrong or missing
- Check Supabase connection string
- Make sure database tables exist (run `supabase-setup.sql`)

#### Test 2: Check Admin Authentication
1. Go to: `https://shalom-git-master-iamj41.vercel.app/admin.html`
2. Login with:
   - Password: `admin123`
   - Token: `shalom-admin-2026`
3. Click **"Products"** tab
4. Should load without 401 error ✅

#### Test 3: Check Showcase Categories
Visit: `https://shalom-git-master-iamj41.vercel.app/`
- Showcase section should load without errors
- No 500 errors in browser console

---

## 🔍 Understanding the Errors

### Why 401 Unauthorized?

Your admin panel sends requests like:
```javascript
fetch('/api/admin/products', {
  headers: {
    'x-admin-token': 'shalom-admin-2026'  // This token
  }
})
```

Server checks:
```javascript
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) {  // ← This was undefined!
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
```

**Without `ADMIN_TOKEN` in Vercel:**
- `process.env.ADMIN_TOKEN` = `undefined`
- Token check fails → 401 error

---

### Why 500 Internal Server Error?

Showcase database tries:
```javascript
// In showcase-database-hybrid.js
function readJSON() {
  // On Vercel, this file doesn't exist!
  return JSON.parse(fs.readFileSync('showcase-categories.json'));
  // ↑ Throws error → 500
}
```

**Solution:** Connect to Postgres so it doesn't try to read JSON files

---

### Why Using JSON Files?

```javascript
// In database-hybrid.js
async function checkPostgresConnection() {
  try {
    await pool.query('SELECT NOW()');
    usePostgres = true;  // ← Success!
  } catch (error) {
    usePostgres = false;  // ← Falls back to JSON
  }
}
```

**If `POSTGRES_URL` is missing or wrong:**
- Connection fails
- Falls back to JSON mode
- But JSON files don't exist on Vercel → crashes

---

## 📊 Quick Diagnostic Commands

### Check What Environment Variables Vercel Has:

**Visit in browser:**
```
https://shalom-git-master-iamj41.vercel.app/api/debug/env
```

**Look for:**
- `hasPostgresUrl: true` ✅
- `hasAdminToken: true` ✅
- `hasAdminPassword: true` ✅
- `database.mode: "postgres"` ✅
- `database.postgres_connected: true` ✅

**If any are `false` or `undefined`:**
→ That environment variable is missing in Vercel

---

## 🚨 Critical Fixes Priority

### Priority 1: Add ADMIN_TOKEN (Fixes 401 errors)
```
Name: ADMIN_TOKEN
Value: shalom-admin-2026
```

### Priority 2: Fix POSTGRES_URL (Fixes 500 errors)
```
Name: POSTGRES_URL
Value: [Your correct Supabase connection string]
```

### Priority 3: Add ADMIN_PASSWORD (Completes admin auth)
```
Name: ADMIN_PASSWORD
Value: admin123
```

**After adding these 3, redeploy!**

---

## 🔄 Complete Environment Variables List

Copy this checklist and verify each one in Vercel:

```
□ PORT (not needed in Vercel, but won't hurt)
□ POSTGRES_URL ← CRITICAL!
□ CLOUDINARY_CLOUD_NAME
□ CLOUDINARY_API_KEY
□ CLOUDINARY_API_SECRET
□ RAZORPAY_KEY_ID
□ RAZORPAY_KEY_SECRET
□ EMAIL_APP_PASSWORD
□ ADMIN_PASSWORD ← MISSING!
□ ADMIN_TOKEN ← MISSING!
```

---

## 🧪 Test Locally First

Before redeploying to Vercel, test locally:

```cmd
node server.js
```

**You should see:**
```
✅ Connected to Postgres database
✅ [PRODUCTS] Connected to Postgres
✅ [SHOWCASE] Connected to Postgres
```

**If you see warnings:**
```
⚠️ Using local JSON files
```
→ Your `.env` file has wrong Supabase credentials
→ Fix locally first before pushing to Vercel!

---

## 📝 Step-by-Step Fix Summary

1. ✅ **Go to Vercel Dashboard** → Settings → Environment Variables
2. ✅ **Add missing variables:**
   - `ADMIN_TOKEN=shalom-admin-2026`
   - `ADMIN_PASSWORD=admin123`
3. ✅ **Verify POSTGRES_URL** is correct (from Supabase)
4. ✅ **Redeploy** the site
5. ✅ **Test** at `/api/debug/env`
6. ✅ **Login** to admin panel
7. ✅ **Verify** no more 401/500 errors

---

## 🎯 Expected Results After Fix

### Vercel Function Logs Should Show:
```
✅ Connected to Postgres database
✅ [PRODUCTS] Connected to Postgres
✅ [SHOWCASE] Connected to Postgres
```

### API Endpoints Should Return:
- `/api/products` → 200 OK (list of products)
- `/api/showcase-categories` → 200 OK (list of categories)
- `/api/admin/orders` → 200 OK (when authenticated)
- `/api/admin/products` → 200 OK (when authenticated)

### No More Errors:
- ❌ 401 Unauthorized → ✅ 200 OK
- ❌ 500 Internal Server Error → ✅ 200 OK
- ❌ "Using local JSON files" → ✅ "Connected to Postgres"

---

## 🆘 Still Getting Errors?

### If 401 errors persist:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+F5)
3. Check Vercel logs for `ADMIN_TOKEN` value
4. Verify you're sending correct token from admin panel

### If 500 errors persist:
1. Check Vercel function logs for stack trace
2. Verify Supabase tables exist (run `supabase-setup.sql`)
3. Test Supabase connection locally first
4. Check Supabase project is not paused

### If "json" mode persists:
1. Verify `POSTGRES_URL` format is exactly:
   ```
   postgres://postgres.[REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
2. Test connection from your local machine:
   ```cmd
   node -e "const {Pool}=require('pg');const pool=new Pool({connectionString:'YOUR_POSTGRES_URL'});pool.query('SELECT NOW()').then(r=>console.log('✅',r.rows[0])).catch(e=>console.log('❌',e.message));"
   ```
3. Make sure Supabase project exists and is active

---

## 📞 Quick Support

**If you need help, share:**
1. Screenshot of Vercel Environment Variables page
2. Response from `/api/debug/env` endpoint
3. Latest error from Vercel function logs

---

**Start with Priority 1 & 2 fixes above and redeploy!** 🚀
