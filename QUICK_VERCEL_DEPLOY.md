# ⚡ Quick Vercel Deployment Guide

## 🚀 Super Quick Method (Recommended)

Just double-click this file:
```
deploy-to-vercel.bat
```

This interactive script will:
1. Check/install Vercel CLI
2. Login to Vercel
3. Setup environment variables
4. Deploy your site

**That's it!** Follow the on-screen menu.

---

## 📋 Manual Method (3 Steps)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Setup Environment Variables

**Option A: Use the script**
```bash
deploy-to-vercel.bat
```
Choose Option 1 from the menu.

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add these 5 variables:

```
RAZORPAY_KEY_ID=rzp_test_T3oq9gSrBCfB3T
RAZORPAY_KEY_SECRET=snCqYA9JvFUUT7aqPNM7nCdg
EMAIL_APP_PASSWORD=tvrp vivx nxrt ilho
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=shalom-admin-2026
```

### Step 3: Deploy
```bash
# First time / Preview
vercel

# Production (after testing preview)
vercel --prod
```

---

## ✅ What's Already Done

Your project is **ready for Vercel**:
- ✅ `vercel.json` configured
- ✅ `server.js` uses `process.env.PORT` (Vercel compatible)
- ✅ `.env` is in `.gitignore` (won't be uploaded)
- ✅ All dependencies in `package.json`
- ✅ Static files properly routed

---

## ⚠️ Important Notes

### ✅ What WILL Work on Vercel:
- Website UI (all pages load)
- Product browsing
- Admin panel login
- Razorpay payments
- Email confirmations

### ❌ What WON'T Persist on Vercel:
- **New products added** (local JSON storage)
- **Orders placed** (local JSON storage)
- **Uploaded images** (local file storage)

**Why?** Vercel serverless functions have ephemeral (temporary) filesystems. Any data written is lost when the function stops.

---

## 🔥 For Production Use

To make data persist permanently, you need cloud storage:

### Recommended Setup:
1. **Database**: Vercel Postgres (free tier)
2. **Images**: Cloudinary (free tier)

**Want me to set this up?** Just ask:
> "Migrate to Vercel Postgres and Cloudinary"

I'll refactor the entire backend to use cloud storage so your data persists permanently.

---

## 🐛 Common Issues & Fixes

### Issue: "vercel: command not found"
**Fix:**
```bash
npm install -g vercel
```

### Issue: "Environment variable undefined"
**Fix:** Add variables via dashboard or CLI, then redeploy:
```bash
vercel --prod --force
```

### Issue: "Products/Orders not saving"
**Expected:** This is normal with current setup (file-based storage doesn't work on Vercel)
**Fix:** Migrate to database (see above)

### Issue: "Login failed"
**Fix:**
```bash
vercel logout
vercel login
```

---

## 📞 Quick Commands

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs

# List env variables
vercel env ls

# Check who's logged in
vercel whoami

# View project info
vercel inspect
```

---

## 🎯 Deployment Checklist

Before deploying to production:

- [ ] Run `deploy-to-vercel.bat` OR follow manual steps
- [ ] Environment variables are set (check with `vercel env ls`)
- [ ] Preview deployment tested (`vercel`)
- [ ] Admin login works
- [ ] Razorpay payment flow tested
- [ ] Email confirmations sent successfully
- [ ] All pages load correctly

Then deploy:
```bash
vercel --prod
```

---

## 🌐 After Deployment

Your site will be live at:
```
https://your-project-name.vercel.app
```

**Custom Domain (Optional):**
1. Vercel Dashboard → Domains
2. Add your domain (e.g., shalomfashion.com)
3. Update DNS records as instructed

---

## 🆘 Need Help?

View real-time logs:
```bash
vercel logs --follow
```

Check deployment status:
```bash
vercel ls
```

For migration to persistent storage, just ask! 🚀
