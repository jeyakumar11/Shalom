# 🔐 Vercel Environment Variables Setup Guide

## Quick Setup (Choose ONE method)

---

## ⚡ Method 1: Automated Script (Easiest)

Just run the batch script I created:

```bash
setup-vercel-env.bat
```

This script will:
- ✅ Check if Vercel CLI is installed (install if needed)
- ✅ Login to Vercel
- ✅ Add all environment variables automatically
- ✅ Verify variables are set correctly

---

## 🌐 Method 2: Vercel Dashboard (Visual)

### Step 1: Login to Vercel
Go to: https://vercel.com/dashboard

### Step 2: Create/Select Project
- If deploying for first time: Click "Add New" → "Project"
- If already deployed: Click on your project name

### Step 3: Add Environment Variables
1. Go to **Settings** tab
2. Click **Environment Variables** in sidebar
3. Add each variable:

| Key | Value | Environments |
|-----|-------|--------------|
| `RAZORPAY_KEY_ID` | `rzp_test_T3oq9gSrBCfB3T` | Production, Preview, Development |
| `RAZORPAY_KEY_SECRET` | `snCqYA9JvFUUT7aqPNM7nCdg` | Production, Preview, Development |
| `EMAIL_APP_PASSWORD` | `tvrp vivx nxrt ilho` | Production, Preview, Development |
| `ADMIN_PASSWORD` | `admin123` | Production, Preview, Development |
| `ADMIN_TOKEN` | `shalom-admin-2026` | Production, Preview, Development |

### Step 4: Redeploy
Click **Deployments** → **⋯** (three dots) → **Redeploy**

---

## 💻 Method 3: Vercel CLI (Fast)

### Step 1: Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Add Variables (Run each command)
```bash
vercel env add RAZORPAY_KEY_ID
# Enter: rzp_test_T3oq9gSrBCfB3T
# Select: Production, Preview, Development (press Enter for all)

vercel env add RAZORPAY_KEY_SECRET
# Enter: snCqYA9JvFUUT7aqPNM7nCdg
# Select: Production, Preview, Development

vercel env add EMAIL_APP_PASSWORD
# Enter: tvrp vivx nxrt ilho
# Select: Production, Preview, Development

vercel env add ADMIN_PASSWORD
# Enter: admin123
# Select: Production, Preview, Development

vercel env add ADMIN_TOKEN
# Enter: shalom-admin-2026
# Select: Production, Preview, Development
```

### Step 4: Verify
```bash
vercel env ls
```

You should see all 5 variables listed.

---

## 🚀 Deploy After Setup

Once environment variables are added:

### First Time Deploy
```bash
vercel
```

### Production Deploy
```bash
vercel --prod
```

### Check Logs
```bash
vercel logs
```

---

## ✅ Verification Checklist

After deployment, verify everything works:

- [ ] Website loads at your Vercel URL
- [ ] Products display correctly
- [ ] Admin login works (password: `admin123`)
- [ ] Razorpay payment gateway initializes
- [ ] Order confirmation emails send
- [ ] UPI QR code generates

---

## 🐛 Troubleshooting

### Error: "RAZORPAY_KEY_ID is undefined"
**Solution:** Environment variables not set properly
- Check: `vercel env ls`
- Redeploy: `vercel --prod`

### Error: "Cannot read .env file"
**Solution:** This is EXPECTED on Vercel
- Vercel doesn't use `.env` files
- Variables are set via Dashboard/CLI
- Your code already uses `process.env.*` which works

### Error: "Login failed"
**Solution:** 
```bash
vercel logout
vercel login
```

### Variables Not Working After Adding
**Solution:** Redeploy the project
- Dashboard: Deployments → Redeploy
- CLI: `vercel --prod --force`

---

## 🔒 Security Notes

- ✅ `.env` file is in `.gitignore` (NOT uploaded to Git)
- ✅ Environment variables are encrypted on Vercel
- ✅ Variables are only accessible to your Vercel project
- ⚠️ **Never commit** `.env` to GitHub/Git
- ⚠️ **Never share** your Razorpay secret key publicly

---

## 📝 Current Variables Summary

Your environment variables:

```
RAZORPAY_KEY_ID=rzp_test_T3oq9gSrBCfB3T
RAZORPAY_KEY_SECRET=snCqYA9JvFUUT7aqPNM7nCdg
EMAIL_APP_PASSWORD=tvrp vivx nxrt ilho
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=shalom-admin-2026
```

**Note:** `PORT` is not needed on Vercel (auto-assigned)

---

## 🎯 Quick Command Reference

```bash
# Login
vercel login

# Add environment variable
vercel env add VARIABLE_NAME

# List all variables
vercel env ls

# Remove variable
vercel env rm VARIABLE_NAME

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# View project info
vercel inspect
```

---

## 🆘 Need Help?

If you see errors after following these steps, run:

```bash
vercel logs --follow
```

This will show real-time logs and any errors with environment variables.

---

## ✨ You're All Set!

Once environment variables are configured:
1. Your app will work exactly like localhost
2. Razorpay payments will process correctly
3. Email confirmations will be sent
4. Admin panel will be accessible

**Next:** Deploy with `vercel --prod` 🚀
