# 🔧 GET NEW SUPABASE CONNECTION STRING

## ⚠️ Current Status:
- ❌ Old Supabase project doesn't exist (`postgres.uyisndbhhzinsxpbxfgy`)
- ✅ All other environment variables are set in Vercel
- ⚠️ Website is using JSON mode (won't work in production)

## 🎯 What You Need to Do:

You have **2 options**:

---

## Option 1: Create New Supabase Project (Recommended - 5 Minutes)

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Log in with your account

### Step 2: Create New Project
1. Click **"New Project"** button
2. Select/Create an organization
3. Fill in details:
   - **Name:** `shalom-fashion` (or any name you prefer)
   - **Database Password:** Create a STRONG password
     - Example: `ShAlOm@F4sh!0n2026`
     - **⚠️ WRITE THIS DOWN! You'll need it!**
   - **Region:** Select **US East (N. Virginia)** or closest to you
   - **Pricing Plan:** Free (sufficient for your needs)
4. Click **"Create new project"**
5. ⏳ **Wait 2-3 minutes** for setup to complete

### Step 3: Get Connection String
1. Once project is ready, click **Settings** (gear icon) in left sidebar
2. Click **"Database"**
3. Scroll to **"Connection string"** section
4. Select **"Transaction"** mode (NOT Session!)
   ```
   ○ Session    ● Transaction    ○ URI
                👆 Click this!
   ```
5. You'll see something like:
   ```
   postgres://postgres.[NEW-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** with the password you created in Step 2
7. **Copy the complete connection string**

### Step 4: Create Database Tables
1. In Supabase Dashboard, click **"SQL Editor"** in left sidebar
2. Click **"+ New query"**
3. Open your local file: `supabase-setup.sql`
4. Copy the ENTIRE contents (Ctrl+A, Ctrl+C)
5. Paste into Supabase SQL Editor (Ctrl+V)
6. Click **"Run"** button (or press Ctrl+Enter)
7. ✅ Should see: **"Success. No rows returned"**

### Step 5: Add to Vercel
Run this command in your terminal (replace with YOUR connection string):
```cmd
vercel env add POSTGRES_URL production
```

When prompted, paste your connection string:
```
postgres://postgres.[YOUR-NEW-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 6: Update Local .env File
Open `.env` file and update:
```env
POSTGRES_URL=postgres://postgres.[YOUR-NEW-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```
Save the file.

### Step 7: Test Locally
```cmd
node server.js
```

You should see:
```
✅ Connected to Postgres database
✅ [PRODUCTS] Connected to Postgres
✅ [SHOWCASE] Connected to Postgres
```

### Step 8: Deploy to Vercel
```cmd
vercel --prod
```

---

## Option 2: Use Different Postgres Provider

If you don't want to use Supabase, you can use:

### Neon (Recommended Alternative)
1. Go to: https://neon.tech
2. Sign up (free)
3. Create a new project
4. Copy the connection string
5. Run: `vercel env add POSTGRES_URL production`
6. Paste the connection string
7. Update `.env` locally
8. Run `database-schema.sql` in Neon SQL Editor
9. Deploy: `vercel --prod`

### Railway
1. Go to: https://railway.app
2. Sign up (free trial)
3. Create PostgreSQL database
4. Copy connection string
5. Follow same steps as Neon

---

## ⚡ Quick Command Reference

### Test Connection Locally:
```cmd
node server.js
```
Look for: `✅ Connected to Postgres database`

### Add to Vercel:
```cmd
vercel env add POSTGRES_URL production
```

### Update and Deploy:
```cmd
vercel --prod
```

### Check Status:
```cmd
curl https://shalom-six.vercel.app/api/debug/env
```
Should show: `"mode": "postgres"`

---

## 📋 After Getting New Connection String

**I removed the old broken `POSTGRES_URL` from Vercel.**

**Now you need to:**
1. ✅ Create new Supabase project (or use alternative)
2. ✅ Get connection string
3. ✅ Run `supabase-setup.sql` to create tables
4. ✅ Add to Vercel: `vercel env add POSTGRES_URL production`
5. ✅ Update `.env` file locally
6. ✅ Test locally: `node server.js`
7. ✅ Deploy: `vercel --prod`
8. ✅ Verify: Visit `/api/debug/env`

---

## 🆘 Need Help?

**Once you create the Supabase project, tell me:**
1. "I created the project"
2. Share if you need help with any step

**I can help you:**
- Run the SQL setup script
- Test the connection
- Deploy to Vercel

---

**Start with Option 1, Step 1** → Go to https://supabase.com/dashboard now! 🚀
