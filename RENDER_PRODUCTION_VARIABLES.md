# Render Production Environment Variables Update

## Critical: Production Deployment Variables

**IMPORTANT:** Your Render deployment needs these 7 environment variables updated to enable production Paddle checkout:

### Required Environment Variables

1. **NEXT_PUBLIC_PADDLE_ENVIRONMENT**
   - Current: `sandbox`  
   - **Update to:** `production`

2. **NEXT_PUBLIC_PADDLE_CLIENT_TOKEN**
   - Current: `test_f119963f994f2851a970225d4ef`
   - **Update to:** `live_f119963f994f2851a970225d4ef`

3. **PADDLE_API_KEY**
   - Current: Sandbox API key
   - **Update to:** Your production API key from Paddle dashboard

4. **PADDLE_WEBHOOK_SECRET**
   - Current: Sandbox webhook secret
   - **Update to:** `ntfset_01k4zg9mj3wcs53rj1bz4a8c29`

5. **NEXT_PUBLIC_PADDLE_PRICE_ID_PRO**
   - **Add new:** Your production Pro plan price ID

6. **NEXT_PUBLIC_PADDLE_PRICE_ID_PREMIUM**  
   - **Add new:** Your production Premium plan price ID

7. **NEXT_PUBLIC_PADDLE_PRICE_ID_ENTERPRISE**
   - **Add new:** Your production Enterprise plan price ID

## How to Update on Render

1. **Go to your Render dashboard:** https://dashboard.render.com
2. **Select your PlanSpark service**
3. **Navigate to Environment tab**
4. **Update each variable above**
5. **Click "Save Changes"** 
6. **Render will automatically redeploy**

## Verification Steps

After updating and redeployment:

1. Visit your live site pricing page
2. Click "Get Started" on Pro/Premium plans  
3. Verify Paddle checkout opens in production mode
4. Test with a small payment (you can refund)

## Status After Update

✅ **Code Changes:** All payment restrictions removed  
✅ **Button Functionality:** Only current plan disabled  
✅ **Production Config:** Paddle environment ready  
🔄 **Deploy Status:** Waiting for environment variable update  

---

**Next Steps:**
1. Update the 7 environment variables on Render
2. Wait for automatic redeployment  
3. Test production checkout flow
4. Celebrate live payments! 🎉