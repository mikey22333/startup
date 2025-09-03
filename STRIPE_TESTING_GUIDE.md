# Stripe Payment Testing Checklist

## Test Environment Setup
- [ ] Test API keys configured (sk_test_, pk_test_)
- [ ] Test products created in Stripe Dashboard
- [ ] Price IDs added to environment variables
- [ ] Webhook endpoint configured (Stripe CLI or Dashboard)
- [ ] Database schema updated with Stripe fields

## Basic Payment Flow Tests

### ✅ Successful Payment Test
- [ ] User can sign up/sign in
- [ ] Pricing page loads correctly
- [ ] "Get Started" button redirects to Stripe Checkout
- [ ] Test card 4242 4242 4242 4242 works
- [ ] Payment completes successfully
- [ ] User redirected to success page
- [ ] User profile updated with subscription tier
- [ ] Webhook received and processed

### ❌ Failed Payment Test  
- [ ] Use declined card 4000 0000 0000 0002
- [ ] Payment fails as expected
- [ ] User stays on checkout page
- [ ] No subscription created
- [ ] User profile unchanged

### 🔒 3D Secure Test
- [ ] Use 3DS card 4000 0025 0000 3155
- [ ] 3D Secure challenge appears
- [ ] Can complete or fail authentication
- [ ] Payment processes based on auth result

## Subscription Management Tests

### Customer Portal
- [ ] Paid users can access customer portal
- [ ] Portal loads correctly
- [ ] Can view invoices
- [ ] Can update payment methods
- [ ] Can cancel subscription
- [ ] Free users see upgrade option instead

### Webhook Events
- [ ] checkout.session.completed triggers profile update
- [ ] customer.subscription.updated changes tier
- [ ] customer.subscription.deleted downgrades to free
- [ ] invoice.payment_failed marks as past_due

## Edge Cases

### Authentication
- [ ] Non-authenticated users redirected to /auth
- [ ] Stripe customer created on first payment
- [ ] Existing customers reuse customer ID

### Plan Changes
- [ ] Upgrading from Pro to Pro+ works
- [ ] Downgrading redirects to customer portal
- [ ] Same tier selection shows "Current Plan"

### Error Handling
- [ ] Invalid price ID returns error
- [ ] Network failures handled gracefully
- [ ] Webhook signature verification works
- [ ] Database errors don't crash app

## Production Readiness

### Security
- [ ] Webhook signatures verified
- [ ] User authorization checked
- [ ] No secret keys in frontend
- [ ] HTTPS required for webhooks

### User Experience
- [ ] Clear error messages
- [ ] Loading states shown
- [ ] Success confirmation clear
- [ ] Easy subscription management

## Testing Commands

### Local Development
```bash
# Start development server
npm run dev

# Listen for webhooks (in separate terminal)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test webhook delivery
stripe trigger checkout.session.completed
```

### Debug Information
```bash
# Check Stripe CLI logs
stripe logs tail

# View webhook events in dashboard
# Stripe Dashboard → Developers → Webhooks → [Your endpoint] → Logs
```

## Common Test Scenarios

1. **New User Journey**
   - Sign up → Choose plan → Pay → Use app

2. **Existing User Upgrade** 
   - Sign in → Go to pricing → Upgrade → Manage subscription

3. **Payment Failure Recovery**
   - Try failed card → See error → Use valid card → Success

4. **Subscription Lifecycle**
   - Subscribe → Use service → Manage subscription → Cancel → Downgrade

## Verification Steps

After each test:
1. Check Stripe Dashboard for payment/subscription
2. Verify user profile in database updated correctly  
3. Test app functionality matches subscription tier
4. Confirm webhook events were processed
5. Check email notifications (if configured)

## Production Testing

Before going live:
- [ ] Test with live Stripe keys
- [ ] Verify production webhook URL
- [ ] Test actual payment amounts
- [ ] Confirm tax/billing compliance
- [ ] Test customer portal in production
