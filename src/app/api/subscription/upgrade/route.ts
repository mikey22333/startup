import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client with auth token
    const supabase = createClient()
    
    // Set the auth token for this request
    await supabase.auth.setSession({
      access_token: authHeader.substring(7),
      refresh_token: ''
    })
    
    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (!user || userError) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    // Get the new subscription tier from request body
    const { newTier } = await request.json()
    
    if (!newTier || !['free', 'pro', 'pro+'].includes(newTier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Update user's subscription tier and reset their daily usage
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: newTier,
        subscription_status: 'active',
        subscription_started_at: new Date().toISOString(),
        daily_plans_used: 0, // Always reset usage count on any tier change
        daily_plans_reset_date: today
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    console.log(`Successfully updated user ${user.email} to ${newTier} tier and reset usage to 0`)

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${newTier} tier`,
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Subscription upgrade error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
