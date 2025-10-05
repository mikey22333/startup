# 🎯 ACTUAL ROOT CAUSE: Sandbox Price IDs in Production

## TL;DR

**If customer used REAL credit card and still went to sandbox:**

Your price IDs are **SANDBOX** price IDs, not production!

```bash
# These are SANDBOX price IDs (not production):
pri_01k4f550jy8e15dy74nzt6yq5x
pri_01k4f5cr5sz7ev95b8yt7jtrf4
pri_01k4f6cjrdkvkrsdve2dmaff3s
pri_01k4f6nftvpnkhhsmjwrdc2wrt
```

## Why This Happens

**Paddle Behavior:**
- You initialize Paddle in production mode ✅
- But when you open checkout with a sandbox price ID ❌
- Paddle automatically switches to sandbox to find that price
- Customer pays through sandbox (even with real card)
- Transaction appears in sandbox dashboard

## The Fix (5 Steps)

### 1. Create Products in Production Paddle

**Go to:** https://vendors.paddle.com/catalog/products

Click "Create Product" and create:
- **Product 1:** PlanSpark Pro
- **Product 2:** PlanSpark Pro+

### 2. Create Prices for Each Product

For **PlanSpark Pro**:
- Monthly price: $X.XX → Copy price ID
- Yearly price: $X.XX → Copy price ID

For **PlanSpark Pro+**:
- Monthly price: $X.XX → Copy price ID
- Yearly price: $X.XX → Copy price ID

### 3. Update Environment Variables on Render

Replace these 4 variables with your NEW production price IDs:

```bash
NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID=pri_NEW_PRODUCTION_ID
NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID=pri_NEW_PRODUCTION_ID
NEXT_PUBLIC_PADDLE_PRO_PLUS_MONTHLY_PRICE_ID=pri_NEW_PRODUCTION_ID
NEXT_PUBLIC_PADDLE_PRO_PLUS_YEARLY_PRICE_ID=pri_NEW_PRODUCTION_ID
```

### 4. Redeploy (Automatic)

Render will automatically redeploy when you save environment variables.

### 5. Test

1. Clear browser cache completely
2. Visit: https://planspark.onrender.com/pricing
3. Click "Get Started"
4. Complete purchase with real card
5. Check production dashboard: https://vendors.paddle.com/transactions
6. Transaction should appear there (not in sandbox)

## How to Verify Your Price IDs

### Check if Price ID Exists in Production

1. Go to: https://vendors.paddle.com/catalog/prices
2. Search for: `pri_01k4f550jy8e15dy74nzt6yq5x`
3. **Not found?** → It's a sandbox price ID
4. **Found?** → It's a production price ID

### Compare Both Dashboards

**Sandbox:** https://sandbox-vendors.paddle.com/catalog/prices
- Your current price IDs probably exist here

**Production:** https://vendors.paddle.com/catalog/prices  
- Your current price IDs probably DON'T exist here

## Why You Have Sandbox Price IDs

You likely:
1. Set up products in sandbox first (for testing)
2. Copied those price IDs to environment variables
3. Switched to production token
4. But forgot to create products in production

## What Happens to Previous Customer

The customer who already paid through sandbox:

**Option 1: Refund & Re-subscribe**
- Refund their sandbox transaction
- Ask them to subscribe again
- New transaction will go to production

**Option 2: Manual Grant**
- Leave their sandbox subscription as-is
- Manually upgrade them in your database
- They keep access but you track separately

**Option 3: Let it Run**
- Sandbox subscriptions still work
- Webhooks still fire
- Just track in sandbox dashboard for this customer
- New customers will use production

## Red Flags That Indicate This Issue

- ✅ Production token configured (`live_...`)
- ✅ Production webhook secret configured
- ✅ Code says "PRODUCTION mode" in logs
- ❌ But transactions appear in sandbox dashboard
- ❌ Customer emails show as your email
- ❌ Invoices say "TEST MODE"

**This means:** Price IDs are sandbox IDs!

## After Fix - What to Expect

### Console Logs Should Show

```
🚀 Initializing Paddle in PRODUCTION mode
🔧 Token: live_f1199...
✅ Paddle initialized successfully
✅ Price preview successful
Opening Paddle checkout with: { priceId: "pri_01NEW..." }
```

### Paddle Checkout Should Show

- ❌ NO "TEST MODE" banner
- ✅ Real payment processing
- ✅ Production pricing
- ✅ Customer's real email

### Transactions Should Appear In

- ✅ Production dashboard: https://vendors.paddle.com/transactions
- ❌ NOT sandbox: https://sandbox-vendors.paddle.com/transactions

## Complete Checklist

- [ ] Create products in Paddle production dashboard
- [ ] Create prices (monthly & yearly for each product)
- [ ] Copy all 4 production price IDs
- [ ] Update 4 environment variables on Render:
  - [ ] NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID
  - [ ] NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID
  - [ ] NEXT_PUBLIC_PADDLE_PRO_PLUS_MONTHLY_PRICE_ID
  - [ ] NEXT_PUBLIC_PADDLE_PRO_PLUS_YEARLY_PRICE_ID
- [ ] Wait for Render to redeploy
- [ ] Clear browser cache
- [ ] Test in incognito mode
- [ ] Verify transaction in production dashboard
- [ ] Contact previous customer about re-subscription

## Summary

**Problem:** Sandbox price IDs used in production environment

**Why it matters:** Paddle routes to sandbox when it sees sandbox price IDs

**Solution:** Create production prices, update environment variables

**Time to fix:** 10-15 minutes

**Result:** All future transactions will go to production correctly

---

**Read the full details in:** `REAL_ISSUE_SANDBOX_PRICE_IDS.md`
