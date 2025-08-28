import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client for server-side operations 
    const supabase = createClient()
    
    // Try to get user session from cookies (same as generatePlan)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('Subscription API - Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: userError?.message
    })
    
    if (!user || userError) {
      console.log('Subscription API - Unauthorized:', userError?.message || 'No user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    
    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if daily usage needs reset
    const today = new Date().toISOString().split('T')[0]
    let currentUsage = profile.daily_plans_used
    
    if (profile.daily_plans_reset_date !== today) {
      // Reset daily usage
      const { error: resetError } = await supabase
        .from('profiles')
        .update({
          daily_plans_used: 0,
          daily_plans_reset_date: today
        })
        .eq('id', user.id)
      
      if (!resetError) {
        currentUsage = 0
      }
    }

    // Calculate limits based on subscription tier
    const dailyLimit = profile.subscription_tier === 'free' ? 1 
                     : profile.subscription_tier === 'pro' ? 5 
                     : Number.MAX_SAFE_INTEGER // pro+ gets unlimited

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      subscriptionTier: profile.subscription_tier,
      subscriptionStatus: profile.subscription_status,
      dailyUsage: {
        used: currentUsage,
        limit: dailyLimit === Number.MAX_SAFE_INTEGER ? 'unlimited' : dailyLimit,
        remaining: dailyLimit === Number.MAX_SAFE_INTEGER ? 'unlimited' : Math.max(0, dailyLimit - currentUsage),
        resetDate: profile.daily_plans_reset_date || today
      }
    })

  } catch (error) {
    console.error('Usage status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
