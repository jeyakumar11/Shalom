# 🔍 HOW TO GET YOUR POSTGRES CONNECTION STRING

## ⚠️ You Shared the Wrong Keys

What you shared:
```
NEXT_PUBLIC_SUPABASE_URL → Frontend API URL (not database)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY → Frontend auth key (not database)
```

What we need:
```
POSTGRES_URL → Direct database connection string
```

---

## 📋 Step-by-Step Guide

### Step 1: Go to Database Settings

**Direct link:**
https://supabase.com/project/uyisndbhhzinsxpbxfgy/settings/database

**Or manually:**
1. Go to https://supabase.com/dashboard
2. Click on your project: `uyisndbhhzinsxpbxfgy`
3. Click **Settings** (gear icon) in left sidebar
4. Click **"Database"**

---

### Step 2: Scroll to "Connection String" Section

Look for a section that says **"Connection string"**

You'll see 3 options:
```
○ Session    ○ Transaction    ○ URI
```

---

### Step 3: Click "Transaction" Mode

**Click the middle option: "Transaction"**
```
○ Session    ● Transaction    ○ URI
             👆 Click this!
```

---

### Step 4: Copy the Connection String

You'll see something like:
```
postgres://postgres.uyisndbhhzinsxpbxfgy:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Notice:** It says `[YOUR-PASSWORD]` - this is a placeholder!

---

### Step 5: Get Your Database Password

**Option A: You Remember Your Password**
- Replace `[YOUR-PASSWORD]` with your actual password
- Example: If password is `MyPass123`, the string becomes:
  ```
  postgres://postgres.uyisndbhhzinsxpbxfgy:MyPass123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
  ```

**Option B: You Don't Remember Your Password**
1. On the same page, scroll to **"Database password"** section
2. Click **"Reset Database Password"**
3. Enter a NEW password (example: `Shalom2026!`)
4. Click **"Update password"**
5. **WRITE IT DOWN!**
6. Use this new password in the connection string

---

### Step 6: Share the Complete Connection String

**The connection string should look like this:**
```
postgres://postgres.uyisndbhhzinsxpbxfgy:YourActualPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Paste it here or tell me you have it!**

---

## 🖼️ Visual Guide

### What the Page Looks Like:

```
┌─────────────────────────────────────────────┐
│ Database Settings                           │
├─────────────────────────────────────────────┤
│                                             │
│ Connection string                           │
│                                             │
│ ○ Session  ● Transaction  ○ URI            │
│                                             │
│ postgres://postgres.uyisndbhhzinsx...      │
│ [Copy button]                               │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ Database password                           │
│ ••••••••••                                  │
│ [Reset Database Password]                   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ⚠️ Common Mistakes

### ❌ Wrong Keys (What you shared):
```
NEXT_PUBLIC_SUPABASE_URL=https://uyisndbhhzinsxpbxfgy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```
**These are for frontend JavaScript, not server database connection!**

### ✅ Correct Key (What we need):
```
POSTGRES_URL=postgres://postgres.uyisndbhhzinsxpbxfgy:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```
**This is for server-side direct database access!**

---

## 🔐 Password Security Note

**The password is the SECRET part!**

If you share the connection string with me:
- I'll add it to Vercel
- I'll update your .env file
- Then you can change the password later for security

**Or you can:**
- Just tell me "I have it"
- Follow the commands I give you
- Add it yourself

---

## 🚀 Quick Access Links

**Database Settings:**
https://supabase.com/project/uyisndbhhzinsxpbxfgy/settings/database

**Dashboard:**
https://supabase.com/dashboard

---

## 📞 Next Steps

Once you get the connection string:

**Tell me ONE of these:**
1. "I have the connection string" (I'll give you commands)
2. Paste it here (I'll add it to Vercel for you)
3. "I can't find it" (I'll help more)

---

**Go to the database settings page now:** 👇
https://supabase.com/project/uyisndbhhzinsxpbxfgy/settings/database

Look for **"Connection string"** section → Click **"Transaction"**!
