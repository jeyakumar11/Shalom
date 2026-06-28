# ⚡ Quick Start: Cloud Migration

## 🎯 What This Does

Migrates your app from local JSON files to:
- **Vercel Postgres** - Permanent database storage
- **Cloudinary** - Cloud image hosting with CDN

---

## 🚀 Quick Steps (15 minutes)

### 1️⃣ Setup Vercel Postgres (5 min)

```bash
# Login to Vercel
vercel login

# Go to: https://vercel.com/dashboard
# → Your Project → Storage → Create Database → Postgres
# → Copy POSTGRES_URL from .env.local tab
```

Add to your `.env`:
```env
POSTGRES_URL=postgres://user:password@host/database
```

**Create tables:**
- In Vercel Dashboard → Storage → Postgres → Query tab
- Copy/paste all contents of `database-schema.sql`
- Click "Run Query"

---

### 2️⃣ Setup Cloudinary (3 min)

```bash
# Sign up: https://cloudinary.com/users/register/free
# → Dashboard → Copy: Cloud Name, API Key, API Secret
```

Add to your `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_secret
```

---

### 3️⃣ Install & Migrate (5 min)

```bash
# Install new dependencies
npm install

# Update server.js automatically
node update-server-for-postgres.js

# Migrate your data
npm run migrate
```

---

### 4️⃣ Test Locally (2 min)

```bash
npm start
# Visit: http://localhost:3001
# Test: Login to admin, add product, place order
```

---

### 5️⃣ Deploy to Vercel

```bash
# Add env vars to Vercel Dashboard:
# → Settings → Environment Variables
# → Add: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
# (POSTGRES_URL is auto-added by Vercel Storage)

# Deploy
vercel --prod
```

---

## ✅ Done!

Your site now has:
- ✅ Permanent data storage
- ✅ Cloud image hosting
- ✅ Production-ready setup
- ✅ Auto-backups

---

## 📖 Need More Details?

See: `CLOUD_MIGRATION_COMPLETE_GUIDE.md`

---

## 🐛 Quick Troubleshooting

**"POSTGRES_URL not found"**
→ Add to Vercel Dashboard → Settings → Environment Variables

**"Migration failed"**
→ Run `database-schema.sql` in Vercel Postgres first

**"Cloudinary error"**
→ Check credentials in `.env` and Vercel dashboard

---

**That's it! You're production-ready.** 🎉
