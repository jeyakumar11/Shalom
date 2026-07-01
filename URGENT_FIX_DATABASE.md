# 🚨 URGENT: Products Not Persisting - Database Not Connected!

## 🔍 THE PROBLEM:

Your products ARE being added, BUT:
- ❌ They're saved to temporary memory (JSON mode)
- ❌ Data disappears on server restart
- ❌ Not saved to Supabase database
- ❌ **Database mode: "json" (should be "postgres")**

**Why:** The Supabase password in `POSTGRES_URL` is incorrect!

---

## ✅ SOLUTION (3 Steps - 5 Minutes):

### Step 1: Reset Your Supabase Password

1. **Go to:** https://supabase.com/project/uyisndbhhzinsxpbxfgy/settings/database

2. **Scroll to "Database password" section**

3. **Click "Reset Database Password"**

4. **Enter a NEW password:**
   - Example: `ShAlOm2026!Fashion`
   - Make it strong but memorable
   - **WRITE IT DOWN!** ✍️

5. **Click "Update password"**

6. **Wait 10 seconds** for reset to complete

---

### Step 2: Get Your NEW Connection String

1. **On the same page**, scroll to **"Connection string"** section

2. **Click "Transaction" mode** (NOT Session!)
   ```
   ○ Session    ● Transaction    ○ URI
                👆 Click this!
   ```

3. **Copy the connection string**
   It will look like:
   ```
   postgres://postgres.uyisndbhhzinsxpbxfgy:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

4. **Replace `[YOUR-PASSWORD]`** with the password you created in Step 1
   Example:
   ```
   postgres://postgres.uyisndbhhzinsxpbxfgy:ShAlOm2026!Fashion@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

5. **Copy the complete string** (with your password filled in)

---

### Step 3: Update Vercel and Deploy

**Run these commands in your terminal:**

```cmd
cd "e:\Shalom website\Shalom"
```

**Add the NEW connection string to Vercel:**
```cmd
vercel env add POSTGRES_URL production --force
```

**When prompted, paste your NEW connection string** (from Step 2)

**Update local .env file:**
Open `.env` file and update this line:
```env
POSTGRES_URL=postgres://postgres.uyisndbhhzinsxpbxfgy:YOUR_NEW_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Deploy:**
```cmd
vercel --prod
```

---

### Step 4: Create Database Tables

1. **Go to:** https://supabase.com/project/uyisndbhhzinsxpbxfgy/editor

2. **Click "SQL Editor"**

3. **Click "+ New query"**

4. **Copy the ENTIRE content from** `supabase-setup.sql` file

5. **Paste into the SQL editor**

6. **Click "Run"** (or press Ctrl+Enter)

7. **Expected result:** ✅ "Success. No rows returned"

8. **Verify:** Click "Table Editor" → You should see 4 tables:
   - `products`
   - `orders`
   - `showcase_categories`
   - `stock_history`

---

## 🧪 VERIFY IT WORKS:

### Test 1: Check Database Status
```cmd
curl https://shalom-six.vercel.app/api/debug/env
```

**Should show:**
```json
{
  "database": {
    "mode": "postgres",
    "postgres_connected": true
  }
}
```

### Test 2: Add a Product
1. Go to: https://shalom-six.vercel.app/admin.html
2. Click "Products" tab
3. Add a new product
4. **Check Supabase:** Go to Table Editor → `products` table
5. ✅ Your product should be there!

### Test 3: Refresh Admin Dashboard
1. Go to dashboard
2. Should show correct product count
3. Products should persist even after redeployment

---

## 📋 QUICK COMMAND REFERENCE:

**Update connection string in Vercel:**
```cmd
vercel env add POSTGRES_URL production --force
```

**Deploy:**
```cmd
vercel --prod
```

**Test connection:**
```cmd
curl https://shalom-six.vercel.app/api/debug/env
```

---

## 🎯 WHY THIS HAPPENED:

The `POSTGRES_URL` I set earlier has this password: `gFIQ8RSlgKux4BpY`

But this password is either:
- ❌ Wrong/expired
- ❌ Never set for this Supabase project
- ❌ From a different Supabase project

That's why you're seeing:
```
Error: tenant/user postgres.uyisndbhhzinsxpbxfgy not found
```

**Solution:** Reset the password in Supabase and update the connection string!

---

## ⚡ DO THIS RIGHT NOW:

1. ✅ **Step 1:** Reset Supabase password → https://supabase.com/project/uyisndbhhzinsxpbxfgy/settings/database

2. ✅ **Step 2:** Get new connection string with your password

3. ✅ **Step 3:** Run these commands:
   ```cmd
   vercel env add POSTGRES_URL production --force
   vercel --prod
   ```

4. ✅ **Step 4:** Run SQL in Supabase → https://supabase.com/project/uyisndbhhzinsxpbxfgy/editor

5. ✅ **Test:** Products should now persist!

---

## 🆘 NEED HELP?

**After you reset the password in Step 1, paste the NEW connection string here and I'll:**
1. Update Vercel for you
2. Update your .env file
3. Deploy the site
4. Verify it's working

**Just say:** "I have the new connection string: postgres://..."

---

**Time needed:** 5 minutes total ⏱️
**Start now:** https://supabase.com/project/uyisndbhhzinsxpbxfgy/settings/database 🚀
