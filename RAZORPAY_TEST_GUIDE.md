# 🔒 Razorpay Test Mode Payment Guide

## ✅ YES - Test Mode ALLOWS Payments!

Your Razorpay is in **TEST MODE** which means:
- ✅ You CAN make payments
- ✅ Payments work perfectly 
- ❌ NO real money is charged
- ✅ Use test cards/UPI for testing

---

## 🎯 How to Test Payments

### 1️⃣ **CARD PAYMENTS (Test Mode)**

Use these test cards - they work like real cards but charge ₹0:

| Card Type | Card Number | CVV | Expiry | Result |
|-----------|-------------|-----|--------|--------|
| **Success** | 4111 1111 1111 1111 | Any 3 digits | Any future date | ✅ Payment Success |
| **Mastercard** | 5555 5555 5555 4444 | Any 3 digits | Any future date | ✅ Payment Success |
| **Rupay** | 6076 6500 0000 0028 | Any 3 digits | Any future date | ✅ Payment Success |
| **Failure** | 4000 0000 0000 0002 | Any 3 digits | Any future date | ❌ Payment Failed |

**Example:**
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: `12/25`
- Name: `Test User`

---

### 2️⃣ **UPI PAYMENTS (Test Mode)**

**Option A: Test UPI ID**
- Use: `success@razorpay` ✅ (Auto-succeeds)
- Or: `failure@razorpay` ❌ (Auto-fails)

**Option B: Regular UPI (Won't charge in test mode)**
- Use your real UPI ID: `yourname@okaxis`
- Enter UPI PIN when prompted
- ✅ Payment shows as success but NO money deducted

---

### 3️⃣ **NET BANKING (Test Mode)**

Select any bank and use:
- **Username:** Any text
- **Password:** Any text
- ✅ Always succeeds in test mode

---

### 4️⃣ **WALLETS (Test Mode)**

Select wallet and complete - all succeed in test mode with no charges.

---

## 🚀 Testing Your Website

### Step-by-Step:

1. **Add products to cart**
2. **Proceed to checkout**
3. **Fill customer details**
4. **Select "Online Payment"**
5. **Choose payment method:**
   - **Card:** Use `4111 1111 1111 1111`
   - **UPI:** Use `success@razorpay` or your real UPI
   - **Net Banking:** Select any bank
6. **Complete payment**
7. **Order confirmed!** ✅

---

## 🔄 UPI QR Code Testing

**Your website generates UPI QR codes with:**
- Merchant: `jaijs410@okaxis`
- Format: NPCI certified

**To Test QR:**
1. Open any UPI app (GPay, PhonePe, Paytm)
2. Scan QR code from website
3. Amount auto-fills
4. Enter UPI PIN
5. Payment completes

**Note:** In test mode, QR scanning works but backend treats it as test transaction.

---

## 📊 Check Test Payments

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Transactions** → **Payments**
3. See all test payments with status
4. Filter by test/live mode

---

## ⚠️ Important Notes

### Test Mode Limitations:
- ✅ All payment methods work
- ❌ No real money charged
- ✅ Full payment flow tested
- ❌ Can't receive real payments
- ✅ Perfect for development

### When to Switch to LIVE Mode:
1. Testing complete ✅
2. Website fully functional ✅
3. Ready for customers ✅
4. Get KYC approved by Razorpay ✅

---

## 🔴 Switch to LIVE Mode (Production)

**When ready for real payments:**

1. **Get Live Credentials:**
   - Login to Razorpay Dashboard
   - Complete KYC verification
   - Switch to "Live Mode"
   - Get `rzp_live_XXXXX` key

2. **Update .env file:**
```env
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=your_live_secret
```

3. **Test with real small amount**
4. **Go live!** 🚀

---

## 🆘 Troubleshooting

### "Payment Failed" Error?
✅ Use test card: `4111 1111 1111 1111`
✅ Check internet connection
✅ Try different payment method

### UPI QR not working?
✅ Check UPI ID format: `user@bank`
✅ Ensure NPCI format used
✅ Try direct UPI ID entry

### Order not confirmed?
✅ Click "Payment Completed" button
✅ Check payment status in modal
✅ Verify payment in Razorpay dashboard

---

## ✅ Your Current Setup

```env
RAZORPAY_KEY_ID=rzp_test_Szbwwo3t81Gyzd ✅
RAZORPAY_KEY_SECRET=wI94j3lozdHqmW1GQiN5O0iO ✅
Mode: TEST MODE ✅
```

**Status:** ✅ Ready to test payments!

---

## 💡 Quick Test Command

Use this test card for instant success:
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

Or this test UPI:
```
UPI ID: success@razorpay
```

---

**Happy Testing!** 🎉
