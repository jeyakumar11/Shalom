# 🔧 FIX SUPABASE CONNECTION NOW

## Current Situation:
- ⚠️ Products coming from: `products.json` (local file)
- ❌ Supabase error: `tenant/user postgres.uyisndbhhzinsxpbxfgy not found`
- 🎯 Goal: Products from Supabase database

---

## 🚀 5-MINUTE FIX - Follow These Steps:

### Step 1: Check Your Supabase Project

**Option A: Check if project still exists**
1. Go to https://supabase.com/dashboard
2. Look for a project with reference: `uyisndbhhzinsxpbxfgy`
3. If you see it → Go to Step 2
4. If you DON'T see it → **Create new project** (Step 1B)

**Option 1B: Create New Supabase Project**
1. Click **"New Project"**
2. Choose organization (or create one)
3. Project Name: `shalom-fashion`
4. Database Password: **Create a strong password and SAVE IT!**
   - Example: `MyStr0ng!Pass2026`
   - **Write it down!** You'll need it in Step 2
5. Region: **US East (Ohio)** or closest to you
6. Click **"Create new project"**
7. ⏳ Wait 2-3 minutes for setup

---

### Step 2: Get the Correct Connection String

1. In Supabase Dashboard, click **Settings** (gear icon) in left sidebar
2. Click **Database**
3. Scroll down to **Connection String** section
4. Select **"Transaction"** mode (NOT Session mode!)
   ```
   [Session] [Transaction] [URI]
              👆 Click this one!
   ```
5. You'll see a string like:
   ```
   postgres://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
6. **IMPORTANT:** Replace `[YOUR-PASSWORD]` with your actual database password
   - If you forgot it, click "Reset Database Password" on the same page
7. **Copy the complete connection string**

---

### Step 3: Update Your `.env` File

1. Open `.env` in your code editor
2. Find this line:
   ```env
   POSTGRES_URL=postgres://postgres.uyisndbhhzinsxpbxfgy:gFIQ8RSlgKux4BpY@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
3. Replace it with your NEW connection string:
   ```env
   POSTGRES_URL=postgres://postgres.[YOUR-NEW-REF]:[YOUR-NEW-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
4. **Save the file** (Ctrl+S)

---

### Step 4: Create Database Tables

1. In Supabase Dashboard, click **SQL Editor** in left sidebar
2. Click **"+ New Query"**
3. Open the file `supabase-setup.sql` in your code editor
4. **Copy the ENTIRE contents** (Ctrl+A, Ctrl+C)
5. **Paste into Supabase SQL Editor** (Ctrl+V)
6. Click **"Run"** button (or press Ctrl+Enter)
7. ✅ You should see: **"Success. No rows returned"**

This creates 4 tables:
- `products` - Your product catalog
- `orders` - Customer orders
- `showcase_categories` - Fashion showcase cards (with 8 default entries)
- `stock_history` - Stock change logs

---

### Step 5: Restart Your Server

**Stop the current server:**
1. Go to the terminal where server is running
2. Press **Ctrl+C**
3. Wait for it to stop

**Start the new server:**
```cmd
node server.js
```

**Look for this in the console:**
```
✅ Connected to Postgres database
✅ [PRODUCTS] Connected to Postgres
✅ [SHOWCASE] Connected to Postgres
```

**If you see this instead:**
```
⚠️ Postgres unavailable, using local JSON files
```
→ Your connection string is still wrong, check Step 2-3 again

---

### Step 6: Verify It's Working

**Test the database connection:**
1. Open: http://localhost:3001/api/debug/env
2. Look for:
   ```json
   {
     "database": {
       "mode": "postgres",  👈 Should be "postgres" not "json"
       "postgres_connected": true,  👈 Should be true
       "message": "Connected to Postgres database"
     }
   }
   ```

**If still showing JSON mode:**
- Check `.env` file - did you save it?
- Check connection string - any typos?
- Check password - is it correct?
- Try resetting database password in Supabase

---

### Step 7: Add Products to Supabase

1. Go to http://localhost:3001/admin.html
2. Login:
   - Password: `admin123`
   - Token: `shalom-admin-2026`
3. Click **"Products"** tab
4. Add a test product:
   - Name: `Red Bridal Saree`
   - Category: `bridal`
   - Price: `5000`
   - Stock: `10`
   - Upload an image
5. Click **"Add Product"**
6. **Check the console** - should see:
   ```
   ✅ [POSTGRES] Product added: Red Bridal Saree
   ```

**Verify in Supabase:**
1. In Supabase Dashboard, click **Table Editor**
2. Click `products` table
3. ✅ You should see your product!

---

## ✅ Success Indicators

### In Terminal:
```
✅ Connected to Postgres database
✅ [PRODUCTS] Connected to Postgres
✅ [SHOWCASE] Connected to Postgres
```

### In `/api/debug/env`:
```json
{
  "database": {
    "mode": "postgres",
    "postgres_connected": true
  }
}
```

### When Adding Products:
```
✅ [POSTGRES] Product added: ...
```
(NOT "✅ [JSON] Product added...")

---

## 🐛 Common Issues

### Issue: "password authentication failed"
**Solution:** Reset database password in Supabase → Settings → Database → Reset Password

### Issue: "timeout" or "ECONNREFUSED"
**Solution:** 
- Check if project is still starting (wait 2-3 minutes)
- Verify you selected "Transaction" mode (not "Session")
- Check your internet connection

### Issue: Still showing JSON mode after restart
**Solution:**
1. Check `.env` file is saved
2. Verify no spaces around `POSTGRES_URL=`
3. Try copy-paste connection string again
4. Restart server again

### Issue: "relation 'products' does not exist"
**Solution:** You didn't run `supabase-setup.sql` - go back to Step 4

---

## 🔄 Migrate Existing JSON Data to Supabase (Optional)

If you already added products to JSON files and want to move them to Supabase:

1. Make sure Supabase is connected (see Step 6)
2. Run the migration script:
   ```cmd
   node migrate-to-postgres.js
   ```
3. ✅ All your JSON data will be copied to Supabase!

---

## 📞 Need Help?

**Check these files:**
- `.env` - Your connection string
- `supabase-setup.sql` - The schema to run
- Terminal console - Connection status messages

**Test connection manually:**
```cmd
node -e "const {Pool}=require('pg');const pool=new Pool({connectionString:process.env.POSTGRES_URL});pool.query('SELECT NOW()').then(r=>console.log('✅ Connected:',r.rows[0])).catch(e=>console.log('❌ Error:',e.message));"
```

Should show: `✅ Connected: { now: '2026-07-01...' }`

---

## 🌐 After Supabase is Fixed - Deploy to Vercel

Once you see `✅ Connected to Postgres database`:

### Add Environment Variables to Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all 9 variables from `.env` file
3. Make sure `POSTGRES_URL` is the NEW Supabase connection string

### Deploy:
```cmd
git add .
git commit -m "Connect to Supabase database"
git push origin master
```

Vercel will auto-deploy with Supabase! 🚀

---

## 📊 Summary

**Current:** Products from `products.json` ⚠️  
**Goal:** Products from Supabase Postgres ✅  
**Time:** 5-10 minutes  
**Steps:** Fix connection string → Create tables → Restart → Verify  

**Start now at Step 1!** 👆
