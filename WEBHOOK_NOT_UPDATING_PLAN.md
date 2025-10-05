# 🔧 Webhook Not Updating User Plan - Troubleshooting

## ✅ Payment Working
- Transactions appearing in production Paddle dashboard
- Payments processing correctly
- Customer emails showing correctly

## ❌ Issue: Website Not Updating Plan

The user's subscription tier is not being updated after payment.

## 🔍 Possible Causes

### 1. Webhook Not Reaching Server

**Check Render Logs:**
1. Go to: https://dashboard.render.com
2. Select your PlanSpark service
3. Click "Logs" tab
4. Look for webhook activity after payment:
   ```
   🎣 Paddle webhook received
   🎯 Processing Paddle webhook event: transaction.completed
   ```

**If NO webhook logs appear:**
- Webhook is not reaching your server
- Check webhook URL in Paddle dashboard
- Verify webhook is active

### 2. Webhook Signature Verification Failing

**Look for this error in Render logs:**
```
❌ Invalid Paddle webhook signature
401 Unauthorized
```

**If you see this:**
- Webhook secret doesn't match
- Update `PADDLE_WEBHOOK_SECRET` on Render

### 3. User Not Found in Database

**Look for this in Render logs:**
```
⚠️ No user found for customer ID: ctm_xxxxx
⚠️ No user without customer_id found
```

**Cause:**
- User's email in Paddle doesn't match database
- User not logged in during checkout
- paddle_customer_id not being linked

### 4. Transaction Event Not Being Sent

**Check Paddle Webhook Configuration:**
1. Go to: https://vendors.paddle.com/notifications/webhooks
2. Click your webhook
3. Verify these events are enabled:
   - ✅ `transaction.completed`
   - ✅ `transaction.paid`
   - ✅ `subscription.created`
   - ✅ `subscription.activated`

## 🚀 Quick Fixes

### Fix 1: Check Webhook URL

**Production Paddle Dashboard:**
- Webhook URL: `https://planspark.onrender.com/api/paddle/webhook`
- Status: Active
- Events: All subscription & transaction events enabled

### Fix 2: Verify Webhook Secret

**Get Production Secret:**
1. Go to: https://vendors.paddle.com/notifications/webhooks
2. Click your webhook
3. Copy webhook secret
4. Compare with Render environment variable:
   ```
   PADDLE_WEBHOOK_SECRET=ntfset_...
   ```

### Fix 3: Manual User Update (Temporary)

While debugging, manually update the user:

```sql
-- Find the user by email
SELECT id, email, subscription_tier, paddle_customer_id 
FROM profiles 
WHERE email = 'customer@email.com';

-- Update their subscription
UPDATE profiles 
SET 
  subscription_tier = 'pro',  -- or 'pro+'
  subscription_status = 'active',
  paddle_customer_id = 'ctm_xxxxx',  -- from Paddle transaction
  subscription_expires_at = NOW() + INTERVAL '1 month',
  subscription_started_at = NOW()
WHERE email = 'customer@email.com';
```

### Fix 4: Test Webhook Manually

**In Paddle Dashboard:**
1. Go to: https://vendors.paddle.com/notifications/webhooks
2. Click your webhook
3. Click "Test webhook"
4. Check Render logs for the test event

## 🔍 Debugging Steps

### Step 1: Check if Webhook is Reaching Server

**Look at Render logs immediately after payment:**

**Expected logs:**
```
POST /api/paddle/webhook
🎣 Paddle webhook received
✅ Paddle webhook signature verified
🎯 Processing Paddle webhook event: transaction.completed
💰 Processing completed/paid transaction...
🔍 Customer ID: ctm_xxxxx
📦 Items count: 1
🔍 Processing payment for customer_id: ctm_xxxxx
```

**If you see this → Webhook is reaching server ✅**

### Step 2: Check if User is Being Found

**Continue looking at logs:**
```
🔍 Direct customer lookup result: Found user@email.com
✅ Found recent user for payment: user@email.com
```

**OR**
```
⚠️ No user found by customer_id
⚠️ No user without customer_id found
```

**If "No user found" → User lookup failing ❌**

### Step 3: Check if Database Update Succeeds

**Look for:**
```
🔄 Updating user subscription: {...}
✅ Successfully updated user subscription
```

**OR**
```
❌ Failed to update user subscription: [error]
```

## 🎯 Most Likely Issues

### Issue 1: Webhook Not Configured in Production

**Symptom:** No webhook logs in Render

**Fix:**
1. Go to: https://vendors.paddle.com/notifications/webhooks
2. Add webhook if not exists: `https://planspark.onrender.com/api/paddle/webhook`
3. Enable all transaction & subscription events
4. Save webhook secret to Render

### Issue 2: Wrong Webhook Secret

**Symptom:** 401 errors in Render logs

**Fix:**
1. Get production webhook secret from Paddle
2. Update `PADDLE_WEBHOOK_SECRET` on Render
3. Redeploy

### Issue 3: User Not Authenticated During Checkout

**Symptom:** "No user found" in logs

**Fix:** Update webhook handler to find user by email instead of customer_id

## 📊 Immediate Action Plan

1. **Check Render Logs Right Now:**
   - Look for webhook activity after the payment
   - Copy any error messages

2. **Verify Webhook Configuration:**
   - Check it exists in production Paddle
   - Verify URL is correct
   - Check events are enabled

3. **Test Webhook:**
   - Use Paddle's "Test webhook" feature
   - Watch Render logs

4. **If Still Not Working:**
   - Share Render logs with me
   - Share transaction ID from Paddle
   - I'll help debug further

## 📝 Next Steps

Please check:
1. **Render logs** - Any webhook activity?
2. **Paddle webhook settings** - Configured correctly?
3. **Share the transaction ID** - So I can help trace it

**Once we see the logs, we can fix the exact issue!** 🔧
