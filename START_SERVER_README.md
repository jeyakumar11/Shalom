# 🚀 Quick Start Guide - Shalom Fashion Website

## ✅ GOOD NEWS: Hybrid Database is Now Active!

Your website now **automatically** switches between:
- **Postgres** (when available) ✅
- **Local JSON files** (when Postgres fails) ✅

This means **the website will work RIGHT NOW** even with the Supabase connection error!

---

## 🎯 Start the Server

### Option 1: Just Run It (Works Immediately!)
```cmd
node server.js
```

Then open: http://localhost:3001

### Option 2: Check Database Status First
Visit this URL after starting the server:
```
http://localhost:3001/api/debug/env
```

You'll see:
```json
{
  "database": {
    "mode": "json",  // or "postgres" if connected
    "postgres_connected": false,
    "message": "Using local JSON files (Postgres unavailable)"
  }
}
```

---

## 📊 How It Works

### When Postgres Fails (Current Situation):
- ✅ Orders saved to: `orders.json`
- ✅ Products saved to: `products.json`
- ✅ Showcase categories saved to: `showcase-categories.json`
- ✅ Stock history saved to: `stock-history.json`
- ✅ **Everything works locally!**

### When Postgres Connects (After Fix):
- ✅ Orders saved to: Supabase database
- ✅ Products saved to: Supabase database
- ✅ Showcase categories saved to: Supabase database
- ✅ Stock history saved to: Supabase database
- ✅ **Everything works in production!**

---

## 🔧 Fix Postgres Connection (For Production)

Follow the guide in `URGENT_DATABASE_FIX.md`:

### Quick Steps:
1. Go to https://supabase.com/dashboard
2. Create a new project (if your old one is gone)
3. Copy the **Transaction** connection string
4. Update `.env` file:
   ```env
   POSTGRES_URL=postgres://postgres.[NEW-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
5. Run the SQL in `supabase-setup.sql` (in Supabase SQL Editor)
6. Restart server: `node server.js`

---

## 📁 Files That Store Data Locally

When using JSON mode:
- `orders.json` - Customer orders
- `products.json` - Product catalog
- `showcase-categories.json` - Fashion showcase cards
- `stock-history.json` - Stock change logs

**Note**: These files are automatically created on first run!

---

## 🌐 Deploy to Vercel (After Fixing Postgres)

### 1. Make sure Postgres works locally first
```cmd
node server.js
# Check http://localhost:3001/api/debug/env
# Should show: "mode": "postgres"
```

### 2. Add Environment Variables to Vercel

Either use CLI:
```cmd
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

Or use Vercel Dashboard:
- Go to: Project → Settings → Environment Variables
- Add all 9 variables from your `.env` file

### 3. Deploy
```cmd
git add .
git commit -m "Add hybrid database with JSON fallback"
git push origin master
```

Vercel will automatically deploy!

---

## 🎨 Admin Panel Access

URL: http://localhost:3001/admin.html

**Default Credentials**:
- Password: `admin123`
- Admin Token: `shalom-admin-2026`

---

## ❓ Troubleshooting

### "Unauthorized" Error When Adding Products
Make sure you're logged into the admin panel:
1. Go to http://localhost:3001/admin.html
2. Enter password: `admin123`
3. Enter token: `shalom-admin-2026`
4. Click "Login"
5. Now try adding products

### "UI is demolished" / Can't See Website
The hybrid database should fix this! The errors were preventing pages from loading.

Try these steps:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check http://localhost:3001/api/debug/env to verify server is running

### Products Not Showing
1. Login to admin panel
2. Add at least one product with an image
3. Refresh the homepage

---

## 📞 Need More Help?

1. Check logs in the terminal after running `node server.js`
2. Look for:
   - `✅ [POSTGRES]` - Using database
   - `✅ [JSON]` - Using local files
   - `⚠️ [PRODUCTS] Using local JSON files` - Fallback mode active

---

## 🎯 Current Status

✅ **Hybrid database active** - Website works even with Postgres errors  
⚠️ **Supabase connection broken** - Need to fix for production deployment  
✅ **Cloudinary configured** - Image uploads ready  
✅ **Razorpay configured** - Payment gateway ready  
✅ **Admin panel ready** - Product management working  

**You can use the website locally RIGHT NOW while fixing Supabase!**
