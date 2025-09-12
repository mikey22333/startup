# Paddle Webhook Security Guide

## Production Webhook Setup

### 1. Webhook URL Configuration
Set up webhook destinations in your live Paddle dashboard pointing to:
```
https://your-domain.com/api/paddle/webhook
```

### 2. Required Events
Subscribe to these events in your Paddle dashboard:

**Subscription Events:**
- `subscription.created` - New subscription created
- `subscription.updated` - Subscription modified (upgrades/downgrades)
- `subscription.cancelled` - Subscription cancelled
- `subscription.paused` - Subscription paused
- `subscription.resumed` - Subscription resumed

**Transaction Events:**
- `transaction.completed` - Payment successful
- `transaction.updated` - Transaction details changed
- `transaction.created` - New transaction initiated

### 3. Security Measures

#### Webhook Signature Verification
The webhook endpoint automatically verifies signatures using HMAC-SHA256:
```typescript
// Automatic verification in webhook route
function verifyPaddleSignature(rawBody: string, signature: string): boolean
```

#### IP Allowlisting (Recommended)
Add these Paddle IP ranges to your server/CDN allowlist:

**Production IPs:**
- Check Paddle's current IP documentation
- Update your server firewall/CDN settings
- Reject webhook requests from other IPs

#### Environment Variables Required
```bash
PADDLE_WEBHOOK_SECRET=your_live_webhook_secret
```

### 4. Webhook Processing

#### Supported Events
The webhook handler processes:

1. **Subscription Created** (`subscription.created`)
   - Creates/updates user profile
   - Sets subscription tier (pro/pro+)
   - Calculates expiration date
   - Resets usage counters

2. **Subscription Updated** (`subscription.updated`)
   - Handles plan changes
   - Updates billing information
   - Processes upgrades/downgrades

3. **Subscription Cancelled** (`subscription.cancelled`)
   - Removes subscription status
   - Maintains access until expiration
   - Logs cancellation details

4. **Transaction Completed** (`transaction.completed`)
   - Confirms successful payment
   - Updates subscription status
   - Extends subscription period

#### Error Handling
- Automatic retry logic for failed webhook processing
- Detailed logging for debugging
- Graceful handling of unknown events

### 5. Testing Production Webhooks

#### Real Payment Testing
1. Use real payment methods in production
2. Monitor webhook delivery in Paddle dashboard
3. Check application logs for processing confirmation

#### Webhook Testing Tools
```bash
# Test webhook endpoint manually
curl -X POST https://your-domain.com/api/paddle/webhook \
  -H "Content-Type: application/json" \
  -H "Paddle-Signature: ts=1234567890;h1=signature" \
  -d '{"event_type":"subscription.created",...}'
```

### 6. Monitoring and Alerts

#### Webhook Delivery Monitoring
- Monitor webhook delivery success rate in Paddle dashboard
- Set up alerts for failed webhook deliveries
- Track processing latency and errors

#### Application Monitoring
- Log all webhook events for audit trails
- Monitor subscription state changes
- Track payment processing success rates

### 7. Troubleshooting

#### Common Issues
1. **Invalid Signature**: Check PADDLE_WEBHOOK_SECRET matches dashboard
2. **Missing Events**: Verify event subscriptions in Paddle dashboard
3. **Processing Errors**: Check application logs for specific errors

#### Debug Mode
Enable debug logging temporarily:
```typescript
// Add to webhook route for debugging
console.log('Webhook received:', { eventType, data, signature })
```

### 8. Best Practices

#### Idempotency
- Webhook handler uses transaction IDs to prevent duplicate processing
- Safe to retry webhook deliveries

#### Performance
- Webhook processing is optimized for quick response
- Database operations use proper indexing
- Async processing for non-critical operations

#### Security
- All webhook data is validated before processing
- Sensitive data is logged securely
- User permissions are verified before updates

### 9. Production Checklist

- [ ] Webhook URL configured in live Paddle dashboard
- [ ] All required events subscribed
- [ ] PADDLE_WEBHOOK_SECRET environment variable set
- [ ] IP allowlisting configured (if applicable)
- [ ] SSL certificate valid for webhook URL
- [ ] Test webhook delivery with real transaction
- [ ] Monitor webhook processing logs
- [ ] Set up webhook delivery monitoring/alerts

### 10. Support and Documentation

- **Paddle Webhooks**: https://developer.paddle.com/webhooks
- **Signature Verification**: https://developer.paddle.com/webhooks/signature-verification
- **Event Types**: https://developer.paddle.com/webhooks/event-types