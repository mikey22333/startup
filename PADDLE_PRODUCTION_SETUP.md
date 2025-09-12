# Paddle Production Environment Setup Guide

This guide walks through the steps to transition from Paddle sandbox to production environment.

## Environment Variables Update

### Local Development (.env.local)
```bash
# Paddle Production Configuration
NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_live_client_token_here

# Production Price IDs - Replace with your live Paddle price IDs
NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID=pri_01k4f550jy8e15dy74nzt6yq5x
NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID=pri_01k4f5cr5sz7ev95b8yt7jtrf4
NEXT_PUBLIC_PADDLE_PRO_PLUS_MONTHLY_PRICE_ID=pri_01k4f6cjrdkvkrsdve2dmaff3s
NEXT_PUBLIC_PADDLE_PRO_PLUS_YEARLY_PRICE_ID=pri_01k4f6nftvpnkhhsmjwrdc2wrt
# Production Webhook Secret
PADDLE_WEBHOOK_SECRET=your_live_webhook_secret
```

### Render Deployment Variables
Update these environment variables in your Render dashboard:

1. **NEXT_PUBLIC_PADDLE_ENVIRONMENT**: Set to `production`
2. **NEXT_PUBLIC_PADDLE_CLIENT_TOKEN**: Your live Paddle client-side token
3. **NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID**: Live monthly subscription price ID
4. **NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID**: Live yearly subscription price ID
5. **NEXT_PUBLIC_PADDLE_PRO_PLUS_MONTHLY_PRICE_ID**: Live Pro+ monthly price ID
6. **NEXT_PUBLIC_PADDLE_PRO_PLUS_YEARLY_PRICE_ID**: Live Pro+ yearly price ID
7. **PADDLE_WEBHOOK_SECRET**: Live webhook secret for signature verification

## Required Steps in Paddle Dashboard

### 1. Create Live Products and Prices
- Create subscription plans matching your sandbox setup:
  - Pro Monthly Plan
  - Pro Yearly Plan  
  - Pro+ Monthly Plan
  - Pro+ Yearly Plan
- Copy the price IDs from your live dashboard

### 2. Generate Live API Keys
- Go to Developer Tools > Authentication in your live Paddle dashboard
- Create a new client-side token
- Update NEXT_PUBLIC_PADDLE_CLIENT_TOKEN with the live token

### 3. Configure Webhook Endpoints
- Create webhook destinations pointing to your production domain
- Webhook URL: `https://your-domain.com/api/paddle/webhook`
- Subscribe to these events:
  - subscription.created
  - subscription.updated
  - subscription.cancelled
  - transaction.completed
  - transaction.updated

### 4. Update Default Payment Link
- Set your production domain as the default payment link
- Must be a verified domain (not localhost)

### 5. Configure Payment Methods
- Enable desired payment methods (cards, bank transfers, etc.)
- Configure regional payment methods as needed

### 6. Set Tax Settings
- Configure tax-inclusive or tax-exclusive pricing
- Set up tax collection for required regions

## Security Considerations

### Webhook Signature Verification
The webhook route automatically verifies signatures using the PADDLE_WEBHOOK_SECRET.

### IP Allowlisting
Consider allowlisting Paddle's production IP addresses:
- Check Paddle's documentation for current production IP ranges
- Configure your server/CDN to only accept webhooks from these IPs

## Testing Production Setup

### 1. Test Checkout Flow
- Visit your pricing page
- Click subscription buttons to test Paddle checkout
- Complete a test transaction with real payment method

### 2. Verify Webhooks
- Monitor webhook endpoint logs
- Ensure subscription events are processed correctly
- Verify signature validation is working

### 3. Test Subscription Management
- Test subscription upgrades/downgrades
- Verify customer portal access
- Test subscription cancellation flow

## Rollback Plan

If issues occur, you can quickly revert to sandbox:

1. Set NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
2. Use sandbox client token and price IDs
3. Redeploy application

## Monitoring

Monitor these metrics after going live:
- Checkout completion rates
- Webhook delivery success
- Payment processing errors
- Subscription lifecycle events

## Support

- Paddle Dashboard: https://vendors.paddle.com/
- Paddle Documentation: https://developer.paddle.com/
- Paddle Support: Contact through your vendor dashboard