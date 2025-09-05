import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'riyassajeed233@gmail.com'
    
    const supabase = createClient()
    
    // Get user profile data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      email: profile.email,
      subscription_tier: profile.subscription_tier,
      subscription_status: profile.subscription_status,
      paddle_customer_id: profile.paddle_customer_id,
      subscription_id: profile.subscription_id,
      paddle_transaction_id: profile.paddle_transaction_id,
      updated_at: profile.updated_at,
      subscription_tier_changed_at: profile.subscription_tier_changed_at,
      full_profile: profile
    })
    
  } catch (error: any) {
    console.error('Debug subscription error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
