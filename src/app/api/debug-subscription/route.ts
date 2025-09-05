import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'riyassajeed233@gmail.com'
    
    const supabase = createClient()
    
    // Get ALL profiles with this email (in case there are duplicates)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
    
    // Also check auth.users table for this email
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, created_at, updated_at, email_confirmed_at, last_sign_in_at')
      .eq('email', email)
    
    console.log('Debug subscription check:', {
      email,
      profilesFound: profiles?.length || 0,
      authUsersFound: authUsers?.length || 0
    })
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    }
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
    }
    
    // Get the single profile (should match the logic in useSubscription hook)
    const { data: singleProfile, error: singleError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()
    
    return NextResponse.json({
      debug_info: {
        email: email,
        timestamp: new Date().toISOString(),
        profiles_found: profiles?.length || 0,
        auth_users_found: authUsers?.length || 0
      },
      all_profiles: profiles || [],
      auth_users: authUsers || [],
      single_profile: singleProfile,
      single_profile_error: singleError?.message || null,
      // Quick status for the main profile
      current_status: singleProfile ? {
        email: singleProfile.email,
        id: singleProfile.id,
        subscription_tier: singleProfile.subscription_tier,
        subscription_status: singleProfile.subscription_status,
        paddle_customer_id: singleProfile.paddle_customer_id,
        subscription_id: singleProfile.subscription_id,
        paddle_transaction_id: singleProfile.paddle_transaction_id,
        updated_at: singleProfile.updated_at,
        subscription_tier_changed_at: singleProfile.subscription_tier_changed_at
      } : null
    })
    
  } catch (error: any) {
    console.error('Debug subscription error:', error)
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
