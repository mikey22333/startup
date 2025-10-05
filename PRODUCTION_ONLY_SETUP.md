# 🚀 Production-Only Paddle Setup

## ✅ Sandbox Mode Removed

This application now **only supports PRODUCTION mode** for Paddle payments. All sandbox/test configurations have been removed.

## Required Environment Variables

Set these on your Render deployment:

```bash
# Paddle Production Client Token (starts with live_)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_f119963f994f2851a970225d4ef

# Paddle Production Price IDs
NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID=pri_01k4f550jy8e15dy74nzt6yq5x
NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID=pri_01k4f5cr5sz7ev95b8yt7jtrf4
NEXT_PUBLIC_PADDLE_PRO_PLUS_MONTHLY_PRICE_ID=pri_01k4f6cjrdkvkrsdve2dmaff3s
NEXT_PUBLIC_PADDLE_PRO_PLUS_YEARLY_PRICE_ID=pri_01k4f6nftvpnkhhsmjwrdc2wrt

# Paddle Production API Key (for server-side operations)
PADDLE_API_KEY=pdl_live_apikey_01k50y5hvajfrp35aqkdcrv8yq_h2YnnxZzBJPnkNEkY4kxYg_AqM

# Paddle Production Webhook Secret
PADDLE_WEBHOOK_SECRET=ntfset_01k4zg9mj3wcs53rj1bz4a8c29
```

## ⚠️ Important Notes

### No More Sandbox Support

- **Removed:** `NEXT_PUBLIC_PADDLE_ENVIRONMENT` variable (no longer needed)
- **Hardcoded:** Application always runs in production mode
- **Testing:** Must use real payment methods or Paddle's production test cards

### Webhook Configuration

**Production Webhook URL:**
```
https://planspark.onrender.com/api/paddle/webhook
```

**Configure in Paddle Production Dashboard:**
1. Go to: https://vendors.paddle.com/
2. Navigate to: Developer Tools → Notifications → Webhooks
3. Add webhook URL: `https://planspark.onrender.com/api/paddle/webhook`
4. Use webhook secret: `ntfset_01k4zg9mj3wcs53rj1bz4a8c29`
5. Enable events:
   - `transaction.completed`
   - `transaction.paid`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`

### Testing in Production

Since sandbox mode is removed, use these methods for testing:

1. **Paddle Production Test Cards:**
   - Use test cards that work in production mode
   - Check Paddle documentation for approved test cards
   - These won't charge real money but create test transactions

2. **Small Real Transactions:**
   - Use real cards with minimal amounts
   - Refund immediately after testing
   - Monitor in production dashboard

3. **Staging Environment:**
   - Create a separate Render service for staging
   - Use different Paddle products/prices for testing
   - Test there before deploying to production

## What Was Removed

### From `src/lib/paddle.ts`:

```typescript
// ❌ REMOVED: Sandbox environment checking
const paddleEnvironment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'production'

// ❌ REMOVED: Conditional sandbox initialization
if (paddleEnvironment === 'sandbox') {
  console.log('🏖️ Setting Paddle environment to sandbox (testing mode)')
  (window as any).Paddle.Environment.set('sandbox')
}

// ✅ NOW: Always production
environment: 'production'
```

### From Environment Variables:

```bash
# ❌ REMOVED: No longer used
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox|production
```

## Benefits of Production-Only

1. **Simplified Configuration:** Fewer environment variables to manage
2. **No Confusion:** Clear that only production is supported
3. **Security:** No accidental sandbox usage in production
4. **Cleaner Code:** Removed conditional logic and complexity
5. **Faster Initialization:** No environment checks

## Migration Checklist

If you were using sandbox mode before:

- [ ] Remove `NEXT_PUBLIC_PADDLE_ENVIRONMENT` from environment variables
- [ ] Update `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` to production token (starts with `live_`)
- [ ] Update all price IDs to production IDs
- [ ] Update `PADDLE_WEBHOOK_SECRET` to production webhook secret
- [ ] Remove webhooks from Paddle sandbox dashboard
- [ ] Configure webhooks in Paddle production dashboard
- [ ] Test checkout with real payment method
- [ ] Monitor production dashboard for transactions

## Verification

After deploying production-only configuration:

1. **Check Logs:**
   ```
   🚀 Initializing Paddle in PRODUCTION mode
   ✅ Paddle initialized successfully: true
   ```

2. **Test Checkout:**
   - Go to pricing page
   - Click "Get Started"
   - Should open Paddle checkout
   - Should NOT show "TEST MODE" banner

3. **Verify Transactions:**
   - All transactions appear in production dashboard
   - No transactions in sandbox dashboard
   - Customer emails are actual customer emails (not your email)

## Troubleshooting

### Issue: Paddle Not Initializing

**Cause:** Missing or invalid production token

**Fix:**
```bash
# Verify token starts with live_
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_...

# NOT test_...
```

### Issue: Transactions Still Going to Sandbox

**Possible Causes:**
1. Customer using test card numbers
2. Webhook still configured in sandbox dashboard
3. Browser cache from old sandbox setup

**Fix:**
1. Ask customer to use real card
2. Remove sandbox webhooks
3. Clear browser cache completely

### Issue: 401 Webhook Errors

**Cause:** Webhook secret mismatch

**Fix:**
```bash
# Get new webhook secret from production dashboard
# Update environment variable
PADDLE_WEBHOOK_SECRET=ntfset_...
```

## Support

If you need to test payments:

1. **Use Paddle's Production Test Mode:**
   - Some cards work in production without actual charges
   - Check Paddle documentation for test card numbers

2. **Create Staging Environment:**
   - Deploy separate instance with different Paddle products
   - Test there before production

3. **Contact Paddle Support:**
   - For production testing recommendations
   - For webhook troubleshooting
   - For transaction issues

## Summary

✅ **Production Only:** All payments are now production mode  
✅ **Simplified:** Fewer environment variables  
✅ **Secure:** Webhook signature verification enabled  
✅ **Clear Logs:** Always shows "PRODUCTION mode"  
❌ **No Sandbox:** Testing must use production methods
