# 🚨 URGENT: Database Connection Fix

## Problem
Your Supabase database connection is failing with:
```
tenant/user postgres.uyisndbhhzinsxpbxfgy not found
```

This means **your Supabase database doesn't exist or the connection string is wrong**.

---

## ✅ IMMEDIATE FIX - Option 1: Get New Supabase Connection

### Step 1: Verify Your Supabase Project Exists
1. Go to https://supabase.com/dashboard
2. Log in with your account
3. **Check if your project exists**
   - Look for a project with reference: `uyisndbhhzinsxpbxfgy`
   - If it doesn't exist, you need to **create a new project**

### Step 2: Create New Supabase Project (if needed)
1. Click **"New Project"**
2. Choose a name: `shalom-fashion`
3. Set a strong database password: **Save this password!**
4. Choose region: **US East (recommended)**
5. Wait 2-3 minutes for setup to complete

### Step 3: Get the Correct Connection String
1. In Supabase Dashboard, go to **Settings → Database**
2. Scroll down to **Connection String**
3. Select **"Transaction"** mode (NOT Session mode)
4. Copy the connection string - it looks like:
   ```
   postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
5. **Important**: Replace `[PASSWORD]` with your actual database password

### Step 4: Update Your `.env` File
Replace the old `POSTGRES_URL` with your new connection string:
```env
POSTGRES_URL=postgres://postgres.[YOUR-NEW-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 5: Create Database Tables
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase-setup.sql` file
4. Paste into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`
6. ✅ You should see: "Success. No rows returned"

### Step 6: Test Locally
```cmd
node server.js
```

Open http://localhost:3001 - website should work now!

---

## ✅ IMMEDIATE FIX - Option 2: Use Local JSON Files (Temporary)

If you want to test the website **right now** without fixing Supabase, I can add a fallback to use local JSON files when Postgres fails.

**Should I implement the local fallback?** This will let you:
- ✅ Test the website immediately
- ✅ Add products and orders locally
- ✅ Keep working while you fix Supabase
- ⚠️ Won't work on Vercel (only locally)

---

## 📋 For Vercel Deployment

Once your database is working locally:

### 1. Add Environment Variables to Vercel
```bash
# In your Vercel dashboard:
vercel env add POSTGRES_URL
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET
vercel env add EMAIL_APP_PASSWORD
vercel env add ADMIN_PASSWORD
vercel env add ADMIN_TOKEN
```

Or use Vercel Dashboard → Project → Settings → Environment Variables

### 2. Deploy
```bash
git add .
git commit -m "Fix database connection"
git push origin master
```

Vercel will automatically deploy!

---

## 🔍 Quick Diagnosis

Run this to check your connection:
```cmd
node -e "const {Pool}=require('pg');const pool=new Pool({connectionString:process.env.POSTGRES_URL});pool.query('SELECT NOW()').then(r=>console.log('✅ Connected:',r.rows[0])).catch(e=>console.log('❌ Error:',e.message));"
```

---

## ❓ Need Help?

**Which option do you want?**
1. Fix Supabase connection (recommended for production)
2. Add local JSON fallback (quick temporary fix)
3. Both (fallback while fixing Supabase)

Reply with the number and I'll help you!
