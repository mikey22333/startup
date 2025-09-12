# URGENT: Paddle 401 Error Fix Guide

## Issue Analysis
**Error:** `checkout-service.paddle.com: 401 ()`  
**Cause:** Missing or incorrect production API key on Render deployment

## Root Problem
Your Render deployment is likely still using **sandbox credentials** instead of production credentials.

## Critical Fix Steps

### 1. **Immediate: Check Your Render Environment Variables**

Go to [Render Dashboard](https://dashboard.render.com) → Your PlanSpark service → Environment tab

**Verify these variables are set to PRODUCTION values:**

```env
# ❌ WRONG (Sandbox values)
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_f119963f994f2851a970225d4ef

# ✅ CORRECT (Production values)  
NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_f119963f994f2851a970225d4ef
```

### 2. **Add Missing Production API Key**

You need to add your **server-side production API key**:

```env
PADDLE_API_KEY=your_production_api_key_here
```

**How to get production API key:**
1. Go to [Paddle Dashboard](https://vendors.paddle.com/authentication-v2)
2. Select **Live** environment (not Sandbox)  
3. Create new API key or copy existing production key
4. Add to Render environment variables

### 3. **Update Webhook Secret**

```env
PADDLE_WEBHOOK_SECRET=ntfset_01k4zg9mj3wcs53rj1bz4a8c29
```

### 4. **Add Production Price IDs**

You need to create these in Paddle Live environment:

```env
NEXT_PUBLIC_PADDLE_PRICE_ID_PRO=pri_01xxxxx
NEXT_PUBLIC_PADDLE_PRICE_ID_PREMIUM=pri_01xxxxx  
NEXT_PUBLIC_PADDLE_PRICE_ID_ENTERPRISE=pri_01xxxxx
```

## Verification Commands

After updating Render variables:

1. **Check deployment logs** in Render for any errors
2. **Test locally first** with production variables  
3. **Verify checkout opens** without 401 errors

## Quick Local Test

Update your local `.env.local`:

```env
NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_f119963f994f2851a970225d4ef
PADDLE_API_KEY=your_production_api_key
```

Then test locally: `npm run dev`

---

**The 401 error will disappear once you update the production API key on Render!** 🔧