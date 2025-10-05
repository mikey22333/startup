import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Create service role client for webhook (needs admin permissions)
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

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

    // Verify webhook signature for security
    const isValid = verifyPaddleSignature(body, signature)
    if (!isValid) {
      console.error('❌ Invalid Paddle webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    console.log('✅ Paddle webhook signature verified')
    
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
    
    const supabase = createServiceClient()
    
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
          console.log('🔍 Processing payment for customer_id:', customerId)
          
          // Find user by customer_id first, then by email as fallback
          let { data: customerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('paddle_customer_id', customerId)
            .single()
          
          console.log('🔍 Direct customer lookup result:', customerData ? `Found ${customerData.email}` : 'Not found')
          
          // If no user found by customer_id, find recent active user
          if (!customerData) {
            console.log('🔍 No user found by customer_id, searching for the paying user...')
            
            // Find the most recent user who doesn't have a paddle_customer_id
            // This indicates they just made a payment and need to be linked
            const { data: recentUser } = await supabase
              .from('profiles')
              .select('*')
              .is('paddle_customer_id', null)
              .order('updated_at', { ascending: false })
              .limit(1)
              .single()
              
            if (recentUser) {
              console.log('✅ Found recent user for payment:', recentUser.email)
              customerData = recentUser
            } else {
              console.warn('⚠️ No user without customer_id found')
            }
          }
          
          if (customerData) {
            // Determine subscription tier based on price ID
            const priceId = items[0]?.price?.id
            let subscriptionTier = 'pro'
            
            // Map price IDs to subscription tiers using environment variables
            const priceIdToTier: { [key: string]: string } = {
              [process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID || '']: 'pro',
              [process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID || '']: 'pro',
              [process.env.NEXT_PUBLIC_PADDLE_PRO_PLUS_MONTHLY_PRICE_ID || '']: 'pro+',
              [process.env.NEXT_PUBLIC_PADDLE_PRO_PLUS_YEARLY_PRICE_ID || '']: 'pro+'
            }
            
            subscriptionTier = priceIdToTier[priceId] || 'pro'
            
            // Calculate subscription expiration date based on billing period
            const yearlyPriceIds = [
              process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID,
              process.env.NEXT_PUBLIC_PADDLE_PRO_PLUS_YEARLY_PRICE_ID
            ]
            const isYearly = yearlyPriceIds.includes(priceId)
            const expirationDate = new Date()
            if (isYearly) {
              expirationDate.setFullYear(expirationDate.getFullYear() + 1)
            } else {
              expirationDate.setMonth(expirationDate.getMonth() + 1)
            }
            
            console.log('🔄 Updating user subscription:', {
              userId: customerData.id,
              email: customerData.email,
              priceId,
              subscriptionTier,
              billingPeriod: isYearly ? 'yearly' : 'monthly',
              expiresAt: expirationDate.toISOString()
            })
            
            // Update user's subscription status
            const { data, error } = await supabase
              .from('profiles')
              .update({
                paddle_customer_id: customerId,
                subscription_tier: subscriptionTier,
                subscription_status: 'active',
                subscription_id: transaction.subscription_id,
                subscription_expires_at: expirationDate.toISOString(),
                subscription_started_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', customerData.id)
              .select()
            
            if (error) {
              console.error('❌ Failed to update user subscription:', error)
            } else {
              console.log('✅ Successfully updated user subscription:', {
                user: customerData.email,
                tier: subscriptionTier,
                status: 'active'
              })
            }
          } else {
            console.warn('⚠️ No user found for customer ID:', customerId)
          }
        }
        break

      case 'subscription.created':
      case 'subscription.activated':
        console.log('📝 Processing subscription creation/activation...')
        const subscriptionData = event.data
        const customerIdSub = subscriptionData.customer_id
        const itemsSub = subscriptionData.items || []
        
        console.log('🔍 Subscription details:', {
          id: subscriptionData.id,
          customerId: customerIdSub,
          status: subscriptionData.status,
          items: itemsSub.length
        })
        
        if (customerIdSub && itemsSub.length > 0) {
          // Determine subscription tier from price ID
          const priceIdSub = itemsSub[0]?.price?.id
          let subscriptionTierSub = 'pro'
          
          const priceIdToTierSub: { [key: string]: string } = {
            [process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID || '']: 'pro',
            [process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID || '']: 'pro',
            [process.env.NEXT_PUBLIC_PADDLE_PRO_PLUS_MONTHLY_PRICE_ID || '']: 'pro+',
            [process.env.NEXT_PUBLIC_PADDLE_PRO_PLUS_YEARLY_PRICE_ID || '']: 'pro+'
          }
          
          subscriptionTierSub = priceIdToTierSub[priceIdSub] || 'pro'
          
          // Calculate subscription expiration date based on billing period
          const yearlyPriceIdsSub = [
            process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID,
            process.env.NEXT_PUBLIC_PADDLE_PRO_PLUS_YEARLY_PRICE_ID
          ]
          const isYearlySub = yearlyPriceIdsSub.includes(priceIdSub)
          const expirationDateSub = new Date()
          if (isYearlySub) {
            expirationDateSub.setFullYear(expirationDateSub.getFullYear() + 1)
          } else {
            expirationDateSub.setMonth(expirationDateSub.getMonth() + 1)
          }
          
          console.log('🔄 Updating subscription for customer:', {
            customerId: customerIdSub,
            subscriptionTier: subscriptionTierSub,
            priceId: priceIdSub,
            billingPeriod: isYearlySub ? 'yearly' : 'monthly',
            expiresAt: expirationDateSub.toISOString()
          })
          
          // Update user by customer_id (this should work since customer was linked during checkout)
          const { data: subData, error: subError } = await supabase
            .from('profiles')
            .update({
              paddle_customer_id: customerIdSub,
              subscription_tier: subscriptionTierSub,
              subscription_status: 'active',
              subscription_id: subscriptionData.id,
              subscription_expires_at: expirationDateSub.toISOString(),
              subscription_started_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('paddle_customer_id', customerIdSub)
            .select()
          
          if (!subData || subData.length === 0) {
            // Fallback: Find the most recent user who made a payment
            // Look for users who recently updated (indicating recent activity)
            console.log('🔍 Trying fallback: find recent active user for subscription update...')
            
            const { data: recentUsersSub, error: userErrorSub } = await supabase
              .from('profiles')
              .select('*')
              .order('updated_at', { ascending: false })
              .limit(5) // Get last 5 active users
            
            if (recentUsersSub && !userErrorSub && recentUsersSub.length > 0) {
              // Look for a user without paddle_customer_id (indicating new customer)
              let targetUserSub = recentUsersSub.find(u => !u.paddle_customer_id)
              
              // If no user without customer_id, use the most recent user
              if (!targetUserSub) {
                targetUserSub = recentUsersSub[0]
              }
              
              console.log('🎯 Found target user for subscription update:', {
                email: targetUserSub.email,
                id: targetUserSub.id,
                hasCustomerId: !!targetUserSub.paddle_customer_id
              })
              
              const { data: updateDataSub, error: updateErrorSub } = await supabase
                .from('profiles')
                .update({
                  paddle_customer_id: customerIdSub,
                  subscription_tier: subscriptionTierSub,
                  subscription_status: 'active',
                  subscription_id: subscriptionData.id,
                  subscription_expires_at: expirationDateSub.toISOString(),
                  subscription_started_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('id', targetUserSub.id)
                .select()
              
              if (updateErrorSub) {
                console.error('❌ Failed to update user subscription:', updateErrorSub)
              } else {
                console.log('✅ Successfully updated user subscription (fallback):', {
                  user: targetUserSub.email,
                  tier: subscriptionTierSub,
                  customerId: customerIdSub
                })
              }
            } else {
              console.warn('⚠️ Could not find any user for subscription update')
            }
          } else if (subError) {
            console.error('❌ Failed to update subscription:', subError)
          } else {
            console.log('✅ Successfully updated subscription:', subData)
          }
        }
        break;
        
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
        break;
        
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
        break;
        
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
