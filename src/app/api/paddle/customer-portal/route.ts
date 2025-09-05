import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For Paddle, we typically don't have a direct customer portal API
    // Instead, customers would need to contact support or we handle cancellations directly
    // For now, let's return an error suggesting they contact support
    return NextResponse.json({ 
      error: 'To manage your subscription or cancel, please contact our support team.',
      supportEmail: 'support@planspark.co'
    }, { status: 400 })

  } catch (error: any) {
    console.error('Paddle customer portal error:', error)
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 500 }
    )
  }
}
