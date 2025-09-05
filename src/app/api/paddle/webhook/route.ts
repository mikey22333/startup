import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import crypto from 'crypto'

// Verify Paddle webhook signature
function verifyPaddleSignature(rawBody: string, signature: string): boolean {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    console.warn('⚠️  PADDLE_WEBHOOK_SECRET not configured')
    return false
  }

  try {
    // Extract signature from header
    const parts = signature.split(';')
    let ts = ''
    let h1 = ''
    
    for (const part of parts) {
      const [key, value] = part.split('=')
      if (key === 'ts') ts = value
      if (key === 'h1') h1 = value
    }

    // Create expected signature
    const payload = `${ts}:${rawBody}`
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(h1, 'hex')
    )
  } catch (error) {
    console.error('❌ Signature verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('paddle-signature')
    
    console.log('🎣 Paddle webhook received:', {
      hasSignature: !!signature,
      bodyLength: body.length,
      headers: Object.fromEntries(request.headers.entries())
    })
    
    if (!signature) {
      console.warn('⚠️  No Paddle signature provided')
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    // Verify webhook signature in production
    const isProduction = process.env.NODE_ENV === 'production'
    const isSignatureValid = isProduction ? verifyPaddleSignature(body, signature) : true
    
    if (isProduction && !isSignatureValid) {
      console.error('❌ Invalid Paddle webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    let event
    try {
      event = JSON.parse(body)
      console.log('📦 Paddle webhook event:', JSON.stringify(event, null, 2))
    } catch (parseError) {
      console.error('❌ Failed to parse webhook body:', parseError)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    
    const supabase = createClient()
    
    // Handle different Paddle webhook events (Paddle v4 format)
    switch (event.event_type) {
      case 'transaction.completed':
        console.log('💰 Processing completed transaction...')
        const transaction = event.data
        
        // Get customer email from transaction
        const customerEmail = transaction.customer?.email
        const items = transaction.details?.line_items || []
        
        console.log('Transaction details:', {
          transactionId: transaction.id,
          customerEmail,
          status: transaction.status,
          items: items.length
        })
        
        if (customerEmail && items.length > 0) {
          // Determine subscription tier based on price ID
          const priceId = items[0]?.price?.id
          let subscriptionTier = 'pro'
          
          // Map price IDs to subscription tiers
          const priceIdToTier: { [key: string]: string } = {
            'pri_01k4afv37xb0qtqgf1x0bnmwf7': 'pro',    // Pro Monthly
            'pri_01k4arbvr91qy4gj4tk0pnw515': 'pro',    // Pro Yearly
            'pri_01k4ar4ppv145d5mxq627zwnss': 'pro+',   // Pro+ Monthly
            'pri_01k4arhcs2wsvr1f0rfhb8z550': 'pro+'    // Pro+ Yearly
          }
          
          subscriptionTier = priceIdToTier[priceId] || 'pro'
          
          console.log('🔄 Updating user subscription:', {
            customerEmail,
            priceId,
            subscriptionTier
          })
          
          // Update user's subscription status using email
          const { data, error } = await supabase
            .from('profiles')
            .update({
              paddle_customer_id: transaction.customer?.id,
              subscription_tier: subscriptionTier,
              subscription_status: 'active',
              subscription_id: transaction.subscription_id,
              paddle_transaction_id: transaction.id,
              updated_at: new Date().toISOString()
            })
            .eq('email', customerEmail)
            .select()
          
          if (error) {
            console.error('❌ Failed to update user subscription:', error)
          } else {
            console.log('✅ Successfully updated user subscription:', data)
          }
        }
        break
        
      case 'subscription.created':
        console.log('📝 Processing subscription creation...')
        // Handle new subscription
        const subscription = event.data
        const customerId = subscription.custom_data?.userId
        
        if (customerId) {
          // Update user's subscription status
          await supabase
            .from('profiles')
            .update({
              paddle_customer_id: subscription.customer_id,
              subscription_tier: subscription.custom_data?.billingPeriod === 'yearly' ? 'pro_yearly' : 'pro',
              subscription_status: 'active',
              subscription_id: subscription.id
            })
            .eq('id', customerId)
        }
        break
        
      case 'subscription.updated':
        console.log('🔄 Processing subscription update...')
        // Handle subscription updates
        const updatedSubscription = event.data
        
        await supabase
          .from('profiles')
          .update({
            subscription_status: updatedSubscription.status,
            subscription_tier: updatedSubscription.custom_data?.billingPeriod === 'yearly' ? 'pro_yearly' : 'pro'
          })
          .eq('subscription_id', updatedSubscription.id)
        break
        
      case 'subscription.canceled':
        console.log('❌ Processing subscription cancellation...')
        // Handle subscription cancellation
        const canceledSubscription = event.data
        
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_tier: 'free'
          })
          .eq('subscription_id', canceledSubscription.id)
        break
        
      default:
        console.log('❓ Unhandled Paddle webhook event:', event.event_type)
        console.log('Event data:', JSON.stringify(event, null, 2))
    }

    console.log('✅ Webhook processing completed successfully')
    return NextResponse.json({ received: true })
    
  } catch (error: any) {
    console.error('❌ Paddle webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
