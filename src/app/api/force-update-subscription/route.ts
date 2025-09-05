import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, forceUpdate } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    const supabase = createClient()
    
    if (forceUpdate) {
      // Force update the subscription to pro for the specified email
      const { data, error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'pro',
          subscription_status: 'active',
          paddle_customer_id: 'ctm_01k4cv0smt4jr7nnbce8ns2xvc', // From the webhook logs
          updated_at: new Date().toISOString(),
          subscription_tier_changed_at: new Date().toISOString()
        })
        .eq('email', email)
        .select()
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Subscription forcefully updated',
        updated_profile: data
      })
    } else {
      // Just refresh/check the current status
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Current subscription status',
        profile: data
      })
    }
    
  } catch (error: any) {
    console.error('Force update subscription error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
