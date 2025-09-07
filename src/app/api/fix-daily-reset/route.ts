import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    
    // Find users with daily reset issues
    const { data: problematicUsers, error } = await supabase
      .from('profiles')
      .select('email, subscription_tier, daily_plans_used, daily_plans_reset_date, created_at')
      .or(`daily_plans_reset_date.is.null,daily_plans_reset_date.neq.${today},and(subscription_tier.eq.free,daily_plans_used.gt.1),and(subscription_tier.eq.pro,daily_plans_used.gt.5)`)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      console.error('Error finding problematic users:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Categorize the issues
    const issues = {
      null_reset_date: [] as any[],
      outdated_reset_date: [] as any[],
      free_tier_over_limit: [] as any[],
      pro_tier_over_limit: [] as any[]
    }
    
    problematicUsers?.forEach(user => {
      if (!user.daily_plans_reset_date) {
        issues.null_reset_date.push(user)
      } else if (user.daily_plans_reset_date !== today) {
        issues.outdated_reset_date.push(user)
      }
      
      if (user.subscription_tier === 'free' && user.daily_plans_used > 1) {
        issues.free_tier_over_limit.push(user)
      } else if (user.subscription_tier === 'pro' && user.daily_plans_used > 5) {
        issues.pro_tier_over_limit.push(user)
      }
    })
    
    return NextResponse.json({
      summary: {
        total_problematic_users: problematicUsers?.length || 0,
        null_reset_date: issues.null_reset_date.length,
        outdated_reset_date: issues.outdated_reset_date.length,
        free_tier_over_limit: issues.free_tier_over_limit.length,
        pro_tier_over_limit: issues.pro_tier_over_limit.length
      },
      issues,
      today_date: today
    })
    
  } catch (error: any) {
    console.error('Error in daily reset check:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fix_all } = body
    
    if (!fix_all) {
      return NextResponse.json({ 
        error: 'Set fix_all: true to fix all daily reset issues' 
      }, { status: 400 })
    }
    
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()
    
    // Fix all users with problematic daily reset dates
    const { data, error } = await supabase
      .from('profiles')
      .update({
        daily_plans_used: 0,
        daily_plans_reset_date: today,
        updated_at: now
      })
      .or(`daily_plans_reset_date.is.null,daily_plans_reset_date.neq.${today},and(subscription_tier.eq.free,daily_plans_used.gt.1),and(subscription_tier.eq.pro,daily_plans_used.gt.5)`)
      .select('email, subscription_tier')
    
    if (error) {
      console.error('Error fixing daily reset issues:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Daily reset issues fixed for all problematic users',
      fixed_users: data?.length || 0,
      fixed_user_emails: data?.map(u => u.email) || []
    })
    
  } catch (error: any) {
    console.error('Error fixing daily reset issues:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
