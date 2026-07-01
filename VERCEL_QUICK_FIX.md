# ⚡ VERCEL QUICK FIX - 3 Steps

## 🚨 Your Current Errors:

```
❌ 401 Unauthorized    → Missing ADMIN_TOKEN
❌ 500 Server Error    → Missing/Wrong POSTGRES_URL
⚠️ Using JSON files    → Supabase not connected
```

---

## ✅ 3-STEP FIX (5 Minutes)

### Step 1: Add Missing Environment Variables

**Go to:** https://vercel.com/dashboard
→ Click your project → **Settings** → **Environment Variables**

**Add these 2 critical variables:**

```
Name: ADMIN_TOKEN
Value: shalom-admin-2026
✓ Production  ✓ Preview  ✓ Development
```

```
Name: ADMIN_PASSWORD
Value: admin123
✓ Production  ✓ Preview  ✓ Development
```

---

### Step 2: Fix POSTGRES_URL

**Check if `POSTGRES_URL` exists in Vercel:**
- If missing → Add it
- If exists → Update it with correct Supabase connection string

**Get correct connection string:**
1. Go to https://supabase.com/dashboard
2. Open your Supabase project
3. Settings → Database → Connection String
4. Select **"Transaction"** mode
5. Copy the string
6. Replace `[YOUR-PASSWORD]` with your actual password

**Add/Update in Vercel:**
```
Name: POSTGRES_URL
Value: postgres://postgres.[YOUR-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
✓ Production  ✓ Preview  ✓ Development
```

---

### Step 3: Redeploy

**In Vercel Dashboard:**
1. Go to **"Deployments"** tab
2. Click **"⋯"** on latest deployment
3. Click **"Redeploy"**
4. ✅ Wait 2-3 minutes

**OR push to GitHub:**
```cmd
git commit --allow-empty -m "Redeploy with env vars"
git push origin master
```

---

## ✅ Verify the Fix

**Visit:** https://shalom-git-master-iamj41.vercel.app/api/debug/env

**Should see:**
```json
{
  "database": {
    "mode": "postgres",  ← Not "json"
    "postgres_connected": true
  },
  "hasAdminToken": true,
  "hasAdminPassword": true,
  "hasPostgresUrl": true
}
```

**All should be `true`!**

---

## 🎯 After Fix

✅ No more 401 errors  
✅ No more 500 errors  
✅ Admin panel works  
✅ Products load  
✅ Database connected  

---

**Start now! Step 1 → Add ADMIN_TOKEN to Vercel** 👆

Full details: See `FIX_VERCEL_ERRORS.md`
