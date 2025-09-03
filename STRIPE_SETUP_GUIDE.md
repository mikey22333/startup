# Stripe Payment Configuration for PlanSpark

## Environment Variables Required

Add these to your `.env.local` (development) and Render Environment Variables (production):

### Stripe API Keys
```bash
# Get these from your Stripe Dashboard -> Developers -> API keys
STRIPE_SECRET_KEY=sk_test_...   # Use sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe webhook endpoint

# Public keys (safe to expose in frontend)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...   # Use pk_live_... for production
```

### Stripe Price IDs
```bash
# Create these products/prices in your Stripe Dashboard
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PLUS_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PLUS_YEARLY_PRICE_ID=price_...
```

### App URL
```bash
# Your app's URL for redirects
NEXT_PUBLIC_APP_URL=https://planspark.app  # or http://localhost:3000 for development
```

## Setup Steps

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the business verification process
3. Navigate to **Developers** -> **API keys**

### 2. Get API Keys
```bash
# Test Mode Keys (for development)
STRIPE_SECRET_KEY=sk_test_51ABC...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51ABC...
```

### 3. Create Products & Prices
In Stripe Dashboard -> **Products**:

**Pro Monthly** ($19/month)
- Create product: "PlanSpark Pro Monthly"
- Set price: $19.00 USD, recurring monthly
- Copy the price ID: `price_1ABC...`

**Pro Plus Monthly** ($49/month)
- Create product: "PlanSpark Pro+ Monthly"
- Set price: $49.00 USD, recurring monthly
- Copy the price ID: `price_1DEF...`

**Yearly Plans** (20% discount)
- Pro Yearly: $182.40 ($19 × 12 × 0.8)
- Pro+ Yearly: $470.40 ($49 × 12 × 0.8)

### 4. Create Webhook Endpoint
1. Go to **Developers** -> **Webhooks**
2. Click **Add endpoint**
3. URL: `https://planspark.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the webhook secret: `whsec_...`

### 5. Update Database Schema
Run the SQL migration:
```sql
-- This is in add-stripe-fields.sql
ALTER TABLE public.profiles 
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN stripe_subscription_id TEXT UNIQUE,
ADD COLUMN subscription_current_period_end TIMESTAMPTZ;
```

### 6. Configure Customer Portal
In Stripe Dashboard -> **Settings** -> **Billing**:
- Enable Customer Portal
- Customize portal settings (optional)
- Set return URL: `https://planspark.app/pricing`

## Testing

### Test Cards (Development Mode)
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires 3DS: 4000 0025 0000 3155
```

### Test Flow
1. Go to `/pricing` page
2. Click "Get Started" on Pro plan
3. Use test card details
4. Verify webhook receives events
5. Check user profile is updated

## Production Deployment

### 1. Switch to Live Mode
- Get live API keys from Stripe Dashboard
- Update environment variables with `sk_live_...` and `pk_live_...`
- Update webhook URL to production domain

### 2. Render Environment Variables
Add all environment variables to your Render service:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PLUS_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PLUS_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://planspark.app
```

## Files Created/Modified

### API Routes
- `/api/stripe/create-checkout-session` - Creates Stripe checkout
- `/api/stripe/webhook` - Handles Stripe webhooks
- `/api/stripe/customer-portal` - Manages subscriptions

### Pages
- `/pricing/success` - Post-payment success page

### Configuration
- `/lib/stripe.ts` - Stripe client configuration
- `add-stripe-fields.sql` - Database schema updates

### Updated Files
- `/pricing/page.tsx` - Integrated with Stripe checkout

## Security Notes

1. **Never expose secret keys** in frontend code
2. **Verify webhook signatures** to prevent tampering
3. **Use HTTPS** for all webhook endpoints
4. **Validate user permissions** before subscription changes
5. **Test thoroughly** before going live

## Troubleshooting

### Common Issues
1. **Webhook not receiving events**: Check endpoint URL and selected events
2. **Customer not created**: Verify user authentication in checkout
3. **Subscription not updating**: Check webhook signature and database permissions
4. **Redirect issues**: Verify `NEXT_PUBLIC_APP_URL` is correct

### Debug Steps
1. Check Stripe Dashboard logs
2. Review webhook endpoint logs
3. Verify environment variables
4. Test with Stripe CLI for local development
