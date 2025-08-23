import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get the email from query params
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Get user profile by email
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message, profile: null }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Debug profile error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
