import { NextRequest, NextResponse } from 'next/server'

// This is a simple utility endpoint to reset API failure counters
// Useful for development and debugging

export async function POST(request: NextRequest) {
  try {
    // Import the reset function - we'll need to make it accessible
    console.log('Manual reset of API failure counters requested')
    
    // For now, just return success - the actual reset will be handled
    // when we make the reset function accessible from this module
    
    return NextResponse.json({ 
      message: 'API failure counters reset requested',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error resetting failure counters:', error)
    return NextResponse.json({ error: 'Failed to reset counters' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Use POST to reset API failure counters',
    usage: 'POST /api/reset-failures'
  })
}
