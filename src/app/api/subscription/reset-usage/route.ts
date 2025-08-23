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

    const today = new Date().toISOString().split('T')[0]

    // Reset user's daily usage
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        daily_plans_used: 0,
        daily_plans_reset_date: today
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error resetting usage:', updateError)
      return NextResponse.json({ error: 'Failed to reset usage' }, { status: 500 })
    }

    console.log(`Manually reset usage for user ${user.email} (tier: ${updatedProfile?.subscription_tier})`)

    return NextResponse.json({
      success: true,
      message: 'Usage successfully reset to 0',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Usage reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
