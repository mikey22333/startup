// Test script to verify usage limits implementation
// Run this with: npm run dev, then visit http://localhost:3000/api/test-limits

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()
    
    console.log('=== Testing Usage Limits ===')
    
    // Get all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(10)
    
    if (error) {
      throw error
    }
    
    const results = {
      totalProfiles: profiles.length,
      profiles: profiles.map(profile => ({
        email: profile.email,
        tier: profile.subscription_tier,
        dailyUsed: profile.daily_plans_used,
        resetDate: profile.daily_plans_reset_date,
        dailyLimit: profile.subscription_tier === 'free' ? 1 
                   : profile.subscription_tier === 'pro' ? 5 
                   : 'unlimited',
        canGenerate: profile.subscription_tier === 'free' ? profile.daily_plans_used < 1
                   : profile.subscription_tier === 'pro' ? profile.daily_plans_used < 5
                   : true
      })),
      needsReset: profiles.filter(p => p.daily_plans_reset_date !== new Date().toISOString().split('T')[0]),
      summary: {
        free: profiles.filter(p => p.subscription_tier === 'free').length,
        pro: profiles.filter(p => p.subscription_tier === 'pro').length,
        proPlus: profiles.filter(p => p.subscription_tier === 'pro+').length
      }
    }
    
    return NextResponse.json(results, { status: 200 })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
