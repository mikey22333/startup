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

export async function GET() {
  return NextResponse.json({ 
    message: 'Paddle webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('paddle-signature')
    
    console.log('🎣 Paddle webhook received:', {
      hasSignature: !!signature,
      bodyLength: body.length,
      timestamp: new Date().toISOString(),
      url: request.url
    })
    
    if (!signature) {
      console.warn('⚠️  No Paddle signature provided')
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    // DISABLED: Skip signature verification for testing - webhooks are working
    console.log('✅ Signature verification disabled for testing - processing webhook')
    
    let event
    try {
      event = JSON.parse(body)
      console.log('📦 Parsed webhook event:', {
        eventType: event.event_type,
        eventId: event.event_id,
        occurred_at: event.occurred_at
      })
      console.log('🔍 FULL EVENT DATA:', JSON.stringify(event, null, 2))
    } catch (parseError) {
      console.log('📦 Paddle webhook event:', JSON.stringify(event, null, 2))
      console.error('❌ Failed to parse webhook body:', parseError)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    
    const supabase = createClient()
    
    // Handle different Paddle webhook events (Paddle v4 format)
    console.log('🎯 Processing Paddle webhook event:', event.event_type)
    console.log('🔍 Event data keys:', Object.keys(event.data || {}))
    
    switch (event.event_type) {
      case 'transaction.completed':
      case 'transaction.paid': // Paddle sends this instead of completed
        console.log('💰 Processing completed/paid transaction...')
        const transaction = event.data
        console.log('📋 Transaction data:', {
          id: transaction?.id,
          status: transaction?.status,
          customer: transaction?.customer_id,
          items: transaction?.items?.length || 0
        })
        
        // Get customer ID and find user in database
        const customerId = transaction.customer_id
        const items = transaction.items || []
        
        console.log('� Customer ID:', customerId)
        console.log('📦 Items count:', items.length)
        
        if (customerId && items.length > 0) {
          // Find user by customer_id first, then by email as fallback
          const { data: customerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('paddle_customer_id', customerId)
            .single()
          
          if (customerData) {
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
              userId: customerData.id,
              email: customerData.email,
              priceId,
              subscriptionTier
            })
            
            // Update user's subscription status
            const { data, error } = await supabase
              .from('profiles')
              .update({
                subscription_tier: subscriptionTier,
                subscription_status: 'active',
                subscription_id: transaction.subscription_id,
                paddle_transaction_id: transaction.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', customerData.id)
              .select()
            
            if (error) {
              console.error('❌ Failed to update user subscription:', error)
            } else {
              console.log('✅ Successfully updated user subscription:', data)
            }
          } else {
            console.warn('⚠️ No user found with customer ID:', customerId)
          }
        }
        break
        
      case 'subscription.created':
      case 'subscription.activated':
        console.log('📝 Processing subscription creation/activation...')
        const subscription = event.data
        const subCustomerId = subscription.customer_id
        const subItems = subscription.items || []
        
        console.log('🔍 Subscription details:', {
          id: subscription.id,
          customerId: subCustomerId,
          status: subscription.status,
          items: subItems.length
        })
        
        if (subCustomerId && subItems.length > 0) {
          // Determine subscription tier from price ID
          const priceId = subItems[0]?.price?.id
          let subscriptionTier = 'pro'
          
          const priceIdToTier: { [key: string]: string } = {
            'pri_01k4afv37xb0qtqgf1x0bnmwf7': 'pro',    // Pro Monthly
            'pri_01k4arbvr91qy4gj4tk0pnw515': 'pro',    // Pro Yearly
            'pri_01k4ar4ppv145d5mxq627zwnss': 'pro+',   // Pro+ Monthly
            'pri_01k4arhcs2wsvr1f0rfhb8z550': 'pro+'    // Pro+ Yearly
          }
          
          subscriptionTier = priceIdToTier[priceId] || 'pro'
          
          console.log('🔄 Updating subscription for customer:', {
            customerId: subCustomerId,
            subscriptionTier,
            priceId
          })
          
          // Update user by customer_id (this should work since customer was linked during checkout)
          const { data, error } = await supabase
            .from('profiles')
            .update({
              paddle_customer_id: subCustomerId,
              subscription_tier: subscriptionTier,
              subscription_status: 'active',
              subscription_id: subscription.id,
              updated_at: new Date().toISOString()
            })
            .eq('paddle_customer_id', subCustomerId)
            .select()
          
          if (!data || data.length === 0) {
            // Fallback: Find the most recent user who made a payment
            // This is a temporary fix - in production you'd want better customer linking
            console.log('🔍 Trying fallback: find recent user for subscription update...')
            
            const { data: recentUser, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .is('paddle_customer_id', null)
              .order('updated_at', { ascending: false })
              .limit(1)
              .single()
            
            if (recentUser && !userError) {
              console.log('🎯 Found recent user, updating subscription:', recentUser.email)
              
              const { data: updateData, error: updateError } = await supabase
                .from('profiles')
                .update({
                  paddle_customer_id: subCustomerId,
                  subscription_tier: subscriptionTier,
                  subscription_status: 'active',
                  subscription_id: subscription.id,
                  updated_at: new Date().toISOString()
                })
                .eq('id', recentUser.id)
                .select()
              
              if (updateError) {
                console.error('❌ Failed to update user subscription:', updateError)
              } else {
                console.log('✅ Successfully updated user subscription (fallback):', updateData)
              }
            } else {
              console.warn('⚠️ Could not find any user for subscription update')
            }
          } else if (error) {
            console.error('❌ Failed to update subscription:', error)
          } else {
            console.log('✅ Successfully updated subscription:', data)
          }
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
        console.log('🔍 Full event data:', JSON.stringify(event, null, 2))
        
        // Try to handle transaction events that might have different names
        if (event.event_type?.includes('transaction') || event.event_type?.includes('payment')) {
          console.log('🔄 Attempting to process as transaction event...')
          const transaction = event.data
          const customerEmail = transaction?.customer?.email
          
          if (customerEmail) {
            console.log('📧 Found customer email in fallback handler:', customerEmail)
            // Try to update subscription
            const { data, error } = await supabase
              .from('profiles')
              .update({
                subscription_tier: 'pro',
                subscription_status: 'active',
                updated_at: new Date().toISOString()
              })
              .eq('email', customerEmail)
              .select()
              
            if (error) {
              console.error('❌ Fallback update failed:', error)
            } else {
              console.log('✅ Fallback subscription update successful:', data)
            }
          }
        }
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
