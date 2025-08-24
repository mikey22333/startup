import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No valid auth header found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createClient()
    
    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.substring(7))
    
    if (!user || userError) {
      console.log('User authentication failed:', userError)
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    console.log('Subscription status check for user:', user.email)

    // Get user profile with subscription info
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (!profile || profileError) {
      console.log('Profile not found, creating default profile for user:', user.email)
      // Create default profile if not exists
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          subscription_tier: 'free',
          subscription_status: 'active',
          daily_plans_used: 0,
          daily_plans_reset_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()
      
      if (createError || !newProfile) {
        console.error('Failed to create profile:', createError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
      
      // Use the newly created profile
      profile = newProfile
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
    console.error('Subscription status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
