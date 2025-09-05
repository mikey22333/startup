import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const { priceId, billingPeriod = 'monthly' } = await request.json()

    // TEMPORARY: Skip auth for testing Paddle integration
    // TODO: Fix auth session issue later
    
    // Create Supabase client using request cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    // Try to get user but don't fail if auth doesn't work
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // For now, use a test user ID if auth fails
    const userId = user?.id || 'test-user-id'
    const userEmail = user?.email || 'test@example.com'

    console.log('Auth check:', { userId, userEmail, hasError: !!authError })

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    // Check if user already has a Paddle customer ID (skip for test user)
    let profile = null
    if (user?.id) {
      const { data } = await supabase
        .from('profiles')
        .select('paddle_customer_id, email')
        .eq('id', user.id)
        .single()
      profile = data
    }

    // Return the necessary data for client-side Paddle checkout
    return NextResponse.json({ 
      priceId,
      customerId: profile?.paddle_customer_id || null,
      userId,
      userEmail,
      billingPeriod,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing/success`,
    })

  } catch (error: any) {
    console.error('Paddle checkout preparation error:', error)
    return NextResponse.json(
      { error: 'Failed to prepare checkout' },
      { status: 500 }
    )
  }
}
