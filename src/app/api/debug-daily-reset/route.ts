import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }
    
    const supabase = createClient()
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()
    
    if (profileError || !profile) {
      return NextResponse.json({ 
        error: 'User profile not found',
        details: profileError?.message
      }, { status: 404 })
    }
    
    const today = new Date().toISOString().split('T')[0]
    const currentTime = new Date().toISOString()
    
    // Check for daily reset issues
    const analysis = {
      email: profile.email,
      current_time: currentTime,
      today_date: today,
      profile_reset_date: profile.daily_plans_reset_date,
      needs_reset: profile.daily_plans_reset_date !== today,
      daily_plans_used: profile.daily_plans_used,
      subscription_tier: profile.subscription_tier,
      subscription_status: profile.subscription_status,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      subscription_tier_changed_at: profile.subscription_tier_changed_at,
      
      // Daily limit calculation
      expected_daily_limit: profile.subscription_tier === 'free' ? 1 
                          : profile.subscription_tier === 'pro' ? 5 
                          : 'unlimited',
      
      // Check for anomalies
      issues: [] as string[]
    }
    
    // Detect potential issues
    if (analysis.needs_reset) {
      analysis.issues.push(`Daily usage needs reset (last reset: ${profile.daily_plans_reset_date}, today: ${today})`)
    }
    
    if (profile.subscription_tier === 'free' && profile.daily_plans_used > 1) {
      analysis.issues.push('Free tier user has used more than 1 plan today - possible reset issue')
    }
    
    if (profile.subscription_tier === 'pro' && profile.daily_plans_used > 5) {
      analysis.issues.push('Pro tier user has used more than 5 plans today - possible reset issue')
    }
    
    if (!profile.daily_plans_reset_date) {
      analysis.issues.push('No reset date set - profile may be corrupted')
    }
    
    // Check if user was created today but reset date is different
    const profileCreatedDate = new Date(profile.created_at).toISOString().split('T')[0]
    if (profileCreatedDate === today && profile.daily_plans_reset_date !== today) {
      analysis.issues.push('Profile created today but reset date is different')
    }
    
    return NextResponse.json({
      analysis,
      suggested_fix: analysis.needs_reset ? {
        action: 'Reset daily usage',
        sql: `UPDATE profiles SET daily_plans_used = 0, daily_plans_reset_date = '${today}' WHERE email = '${email}';`
      } : null
    })
    
  } catch (error: any) {
    console.error('Debug daily reset error:', error)
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, force_reset } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    
    if (force_reset) {
      // Force reset the daily usage for the specified user
      const { data, error } = await supabase
        .from('profiles')
        .update({
          daily_plans_used: 0,
          daily_plans_reset_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select()
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Daily usage forcefully reset',
        updated_profile: data
      })
    } else {
      return NextResponse.json({ 
        error: 'Set force_reset: true to reset daily usage' 
      }, { status: 400 })
    }
    
  } catch (error: any) {
    console.error('Force reset daily usage error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
