# 🚀 QUICK REFERENCE - Shalom Fashion Website

## ✅ YOUR WEBSITE IS WORKING NOW!

```
🌐 Website:      http://localhost:3001
🔧 Admin Panel:  http://localhost:3001/admin.html
📊 Status:       http://localhost:3001/api/debug/env
```

---

## 🎯 Start/Stop Server

### Start Server
```cmd
node server.js
```

### Stop Server
Press `Ctrl+C` in the terminal

### Check If Running
```cmd
curl http://localhost:3001/api/debug/env
```

---

## 🔐 Admin Login

**URL:** http://localhost:3001/admin.html

**Credentials:**
- Password: `admin123`
- Token: `shalom-admin-2026`

---

## 📊 Current Database Mode

**Mode:** JSON Fallback (Local Files)

**Data Stored In:**
- `orders.json` - Customer orders
- `products.json` - Product catalog  
- `showcase-categories.json` - Fashion cards
- `stock-history.json` - Stock changes

---

## 🔧 Fix Supabase (For Production)

### Quick Steps:
1. Go to https://supabase.com/dashboard
2. Create new project
3. Get connection string (Transaction mode)
4. Update `.env` → `POSTGRES_URL=...`
5. Run `supabase-setup.sql` in SQL Editor
6. Restart server

**Full Guide:** See `URGENT_DATABASE_FIX.md`

---

## 🌐 Deploy to Vercel

### Prerequisites:
✅ Supabase connected (see above)

### Steps:
1. Add all env vars to Vercel Dashboard
2. Commit: `git add . && git commit -m "Deploy"`
3. Push: `git push origin master`
4. ✅ Auto-deployed!

---

## 🎨 Add Your First Product

1. Open admin panel
2. Login with credentials
3. Click "Products" tab
4. Fill form:
   - Name: "Red Bridal Saree"
   - Category: "bridal"
   - Price: 5000
   - Stock: 5
5. Upload image
6. Click "Add Product"
7. ✅ Check homepage!

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `server.js` | Main server |
| `.env` | Secrets & config |
| `database-hybrid.js` | Orders DB |
| `products-database-hybrid.js` | Products DB |
| `showcase-database-hybrid.js` | Showcase DB |
| `supabase-setup.sql` | Database schema |
| `PROBLEM_SOLVED.md` | Full documentation |

---

## 🐛 Quick Fixes

### "Unauthorized" Error
→ Login at `/admin.html` first

### Products Not Showing
→ Add products in admin panel

### Port 3001 In Use
→ `taskkill /F /IM node.exe`

### UI Broken
→ Clear cache (Ctrl+Shift+Delete)
→ Hard refresh (Ctrl+F5)

---

## 📞 Environment Variables

```env
PORT=3001
POSTGRES_URL=postgres://...
CLOUDINARY_CLOUD_NAME=djn3eb2ht
CLOUDINARY_API_KEY=538668853245255
CLOUDINARY_API_SECRET=gLF0dkFsIsi-JtzzTGWh9x90V9g
RAZORPAY_KEY_ID=rzp_test_T3oq9gSrBCfB3T
RAZORPAY_KEY_SECRET=snCqYA9JvFUUT7aqPNM7nCdg
EMAIL_APP_PASSWORD=tvrp vivx nxrt ilho
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=shalom-admin-2026
```

---

## ✨ What's Working

✅ Website with glassmorphism UI  
✅ Admin panel  
✅ Product management  
✅ Image uploads (Cloudinary)  
✅ Shopping cart  
✅ Razorpay payments  
✅ Order tracking  
✅ Email notifications  
✅ Stock management  
✅ QR code generation  
✅ Excel export  
✅ Dark/Light theme  

---

## 📚 Documentation

- `PROBLEM_SOLVED.md` - What I fixed
- `URGENT_DATABASE_FIX.md` - Fix Supabase
- `START_SERVER_README.md` - Detailed guide
- `DEPLOYMENT_CHECKLIST.md` - Go live steps

---

## 🎉 Next Steps

1. ✅ **Test locally** - Add products, create orders
2. ⚠️ **Fix Supabase** - For production deployment
3. 🚀 **Deploy to Vercel** - Go live!

**Current Status:**  
✅ Development: READY  
⚠️ Production: Need Supabase fix  

---

**Questions?** Check `PROBLEM_SOLVED.md` for full details!
