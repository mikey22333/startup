# 🚨 CRITICAL: Webhook Signature Failing - User Plans Not Updating

## ✅ Issue Found!

Your Render logs show:
```
❌ Invalid Paddle webhook signature
🎣 Paddle webhook received: { hasSignature: true }
```

**Root Cause:** `PADDLE_WEBHOOK_SECRET` on Render is using the **SANDBOX** secret instead of **PRODUCTION** secret.

**Impact:** Webhooks are rejected → User subscriptions not activated after payment.

---

## 🚀 IMMEDIATE FIX (5 Minutes)

### Step 1: Get PRODUCTION Webhook Secret

1. **Go to:** https://vendors.paddle.com/notifications/webhooks (PRODUCTION dashboard, not sandbox)
2. **Click** on your webhook: `https://planspark.onrender.com/api/paddle/webhook`
3. **Look for:** "Webhook secret" section
4. **Click:** "Show" or "Reveal" button
5. **Copy** the secret (starts with `ntfset_...`)

### Step 2: Update Render Environment Variable

1. **Go to:** https://dashboard.render.com
2. **Select:** Your PlanSpark service
3. **Click:** "Environment" tab
4. **Find:** `PADDLE_WEBHOOK_SECRET`
5. **Replace** with the production secret you just copied
6. **Click:** "Save Changes"
7. **Wait:** Render will automatically redeploy (2-3 minutes)

### Step 3: Verify Fix

After redeploy:
1. Make a test purchase OR
2. Ask the customer to try again
3. **Check Render logs** - should now show:
   ```
   ✅ Paddle webhook signature verified
   ✅ Successfully updated user subscription
   ```

---

## 📊 What's Happening

### Current State (Broken):
```
1. Customer pays → Payment succeeds ✅
2. Paddle sends webhook → Reaches server ✅
3. Server checks signature → FAILS ❌ (Wrong secret)
4. Webhook rejected → User plan NOT updated ❌
```

### After Fix:
```
1. Customer pays → Payment succeeds ✅
2. Paddle sends webhook → Reaches server ✅
3. Server checks signature → PASSES ✅ (Correct secret)
4. Webhook processed → User plan UPDATED ✅
```

---

## 🔍 Why This Happened

You currently have the **SANDBOX** webhook secret on Render:
```bash
# Current (WRONG for production)
PADDLE_WEBHOOK_SECRET=ntfset_01k4cyg7we8y260j9b7ts1vv43  # Sandbox secret
```

You need the **PRODUCTION** webhook secret:
```bash
# Need (CORRECT for production)
PADDLE_WEBHOOK_SECRET=ntfset_PRODUCTION_SECRET_HERE  # Get from Paddle production
```

---

## ✅ Verification After Fix

### Check 1: Render Logs

**Before Fix:**
```
❌ Invalid Paddle webhook signature
```

**After Fix:**
```
✅ Paddle webhook signature verified
🎯 Processing Paddle webhook event: transaction.completed
💰 Processing completed/paid transaction...
🔄 Updating user subscription
✅ Successfully updated user subscription
```

### Check 2: Database

User's profile should update:
- `subscription_tier` → 'pro' or 'pro+'
- `subscription_status` → 'active'
- `paddle_customer_id` → Set to customer ID

### Check 3: Website

User should see:
- Upgraded plan in dashboard
- Increased usage limits
- Access to pro features

---

## 🆘 If Still Not Working After Fix

### Double-Check Webhook Configuration

**Paddle Production Dashboard:**
1. Go to: https://vendors.paddle.com/notifications/webhooks
2. Verify webhook exists: `https://planspark.onrender.com/api/paddle/webhook`
3. Status: **Active** ✅
4. Events enabled:
   - ✅ transaction.completed
   - ✅ transaction.paid
   - ✅ subscription.created
   - ✅ subscription.activated

### Test Webhook Manually

1. In Paddle dashboard, click webhook
2. Click "Test webhook" or "Send test event"
3. Watch Render logs
4. Should see successful processing

### Check Environment Variable

After updating on Render:
1. Go to Environment tab
2. Click "Edit" on `PADDLE_WEBHOOK_SECRET`
3. Verify it matches production secret from Paddle
4. Save again if needed

---

## 📋 For Previous Customers

Customers who already paid but plan didn't update:

### Option 1: Manual Database Update

```sql
-- Find customer by email
SELECT id, email, subscription_tier 
FROM profiles 
WHERE email = 'customer@email.com';

-- Update their subscription
UPDATE profiles 
SET 
  subscription_tier = 'pro',  -- or 'pro+' based on what they paid for
  subscription_status = 'active',
  paddle_customer_id = 'ctm_xxxxx',  -- from Paddle transaction
  subscription_expires_at = NOW() + INTERVAL '1 month',  -- or '1 year'
  subscription_started_at = NOW()
WHERE email = 'customer@email.com';
```

### Option 2: Paddle Retry Webhook

1. Go to Paddle transaction
2. Click "Retry webhook" button
3. After fixing secret, webhook will process successfully

---

## 🎯 Summary

**Problem:** Sandbox webhook secret on production server

**Solution:** Update `PADDLE_WEBHOOK_SECRET` with production secret

**Steps:**
1. Get production secret from Paddle
2. Update on Render
3. Wait for redeploy
4. Test purchase

**Time:** 5 minutes

**Result:** User plans will update automatically after payment ✅

---

## 📞 Quick Reference

**Paddle Production Dashboard:** https://vendors.paddle.com
**Paddle Webhooks:** https://vendors.paddle.com/notifications/webhooks
**Render Dashboard:** https://dashboard.render.com

**What to copy:** The webhook secret from production Paddle
**Where to paste:** `PADDLE_WEBHOOK_SECRET` on Render

**GO FIX IT NOW!** ⚡
