# 🔍 Paddle Production vs Sandbox Diagnosis

## Current Status

Your environment variables are **correctly configured for PRODUCTION**:

```bash
✅ NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
✅ NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_f119963f994f2851a970225d4ef
✅ PADDLE_API_KEY=pdl_live_apikey_01k50y5hvajfrp35aqkdcrv8yq_...
✅ PADDLE_WEBHOOK_SECRET=ntfset_01k4zg9mj3wcs53rj1bz4a8c29 (production)
```

## 🚨 Problem: Why Transactions Go to Sandbox

Even with production settings, transactions can go to sandbox for these reasons:

### **1. Customer Using Test Payment Methods** (Most Common)

**Symptoms:**
- Transactions appear in sandbox dashboard
- Customer email shows as YOUR email
- Invoices have "TEST MODE" watermark

**Cause:**
- Customer is using test card numbers (e.g., `4242 4242 4242 4242`)
- Paddle automatically routes test cards to sandbox, even in production

**Solution:**
- Instruct customers to use **real credit/debit cards**
- Test cards always go to sandbox regardless of environment

---

### **2. Multiple Webhook Endpoints Configured**

**Check This:**

1. **Paddle Sandbox Dashboard:**
   - URL: https://sandbox-vendors.paddle.com/
   - Go to: Developer Tools → Notifications → Webhooks
   - Look for: `https://planspark.onrender.com/api/paddle/webhook`
   - **Action:** DELETE this webhook if it exists

2. **Paddle Production Dashboard:**
   - URL: https://vendors.paddle.com/
   - Go to: Developer Tools → Notifications → Webhooks
   - Look for: `https://planspark.onrender.com/api/paddle/webhook`
   - **Action:** KEEP this webhook, ensure it's active

**Why This Matters:**
- If BOTH sandbox and production have the same webhook URL
- Your server can't distinguish which environment sent the webhook
- This causes confusion in transaction processing

---

### **3. Customer Using Sandbox Checkout Link**

**Check Your Pricing Page:**

Make sure customers are NOT accessing:
- ❌ Sandbox checkout URLs
- ❌ Test price IDs
- ❌ Old links with `?environment=sandbox`

**Verify:**
```typescript
// In your pricing component, check:
NEXT_PUBLIC_PADDLE_ENVIRONMENT=production (not sandbox)
Price IDs start with: pri_01k4f... (production IDs)
```

---

### **4. Browser Cache/Cookies**

**Issue:**
- If you previously tested in sandbox mode
- Browser may have cached Paddle SDK in sandbox mode

**Solution:**
- Clear browser cache and cookies
- Test in incognito/private mode
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

---

## ✅ Verification Checklist

### Step 1: Check Paddle Dashboards

- [ ] Login to **Sandbox Dashboard**: https://sandbox-vendors.paddle.com/
  - [ ] Check if webhook exists for your domain
  - [ ] If yes, **DELETE IT**
  - [ ] Check recent transactions - should be only YOUR tests

- [ ] Login to **Production Dashboard**: https://vendors.paddle.com/
  - [ ] Verify webhook exists: `https://planspark.onrender.com/api/paddle/webhook`
  - [ ] Webhook secret matches: `ntfset_01k4zg9mj3wcs53rj1bz4a8c29`
  - [ ] Check recent transactions - should be customer transactions

### Step 2: Test Transaction Flow

1. **Clear Browser Data**
   ```
   - Clear cache
   - Clear cookies for planspark.onrender.com
   - Close all browser tabs
   ```

2. **Test Purchase (Incognito Mode)**
   - Open incognito/private window
   - Go to: https://planspark.onrender.com/pricing
   - Click "Get Started" on Pro plan
   - Use a **REAL** credit card (not test card)
   - Complete purchase

3. **Verify Transaction Location**
   - Check **Production Dashboard** → Transactions
   - Transaction should appear there (not in sandbox)
   - Customer email should be the actual customer's email

### Step 3: Check Webhook Logs

After a test purchase, check your Render logs:

```bash
# Look for these log messages:
🎣 Paddle webhook received
✅ Paddle webhook signature verified
🎯 Processing Paddle webhook event: transaction.completed
```

### Step 4: Environment Variables

Double-check on Render dashboard:

```bash
# Should all be set to PRODUCTION values:
NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_f119963f994f2851a970225d4ef
PADDLE_WEBHOOK_SECRET=ntfset_01k4zg9mj3wcs53rj1bz4a8c29
```

---

## 🔧 What I Just Fixed

### Security Enhancement

**Before:**
```typescript
// DISABLED: Skip signature verification for testing
console.log('✅ Signature verification disabled for testing')
```

**After:**
```typescript
// Verify webhook signature for security
const isValid = verifyPaddleSignature(body, signature)
if (!isValid) {
  console.error('❌ Invalid Paddle webhook signature')
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}
console.log('✅ Paddle webhook signature verified')
```

**Impact:**
- ✅ Webhooks now properly verified
- ✅ Prevents fake webhook attacks
- ✅ Ensures only legitimate Paddle webhooks are processed

---

## 🎯 Most Likely Cause

Based on your description:
> "someone made a subscription and I've been getting transactions on my paddle developer sandbox"

**The customer is probably using a TEST CREDIT CARD.**

Even with production environment configured, Paddle automatically routes test card transactions to sandbox.

### Solution:

**Email the customer:**
```
Hi [Customer],

Thank you for trying to subscribe! It looks like you used a test card number.

To complete your subscription, please:
1. Go back to the checkout page
2. Use a real credit/debit card (not test numbers)
3. Complete the payment

Your real payment will be processed through our live system.

Let me know if you need any help!
```

---

## 🚀 Next Steps

1. **Immediately**: Check both Paddle dashboards (sandbox + production)
2. **Remove** any webhooks from sandbox dashboard
3. **Verify** production webhook is configured correctly
4. **Test** with a real card in incognito mode
5. **Deploy** the security fix (webhook signature verification)
6. **Contact** the customer about using a real card

---

## 📊 How to Tell Which Environment Is Active

### In Paddle Checkout:
- **Sandbox**: Shows "TEST MODE" banner
- **Production**: No banner, live payment processing

### In Paddle Dashboard:
- **Sandbox**: URL is `sandbox-vendors.paddle.com`
- **Production**: URL is `vendors.paddle.com`

### In Transaction Details:
- **Sandbox**: Transaction ID starts with `txn_...` (sandbox prefix)
- **Production**: Transaction ID starts with `txn_...` (but different ID format)

### In Webhook Logs:
- Look for the webhook secret being used
- Production: `ntfset_01k4zg9mj3wcs53rj1bz4a8c29`
- Sandbox: Different secret (starts with `ntfset_`)

---

## 🆘 Still Having Issues?

If transactions still go to sandbox after:
1. ✅ Verifying production environment variables
2. ✅ Removing sandbox webhooks
3. ✅ Testing with real cards in incognito mode

Then contact Paddle support with:
- Your production seller ID
- Example transaction ID
- Webhook configuration screenshots
- Environment variable confirmation

**Paddle Support:** https://vendors.paddle.com/support
