// API endpoint for market data updates
// This endpoint can be called by cron jobs, GitHub Actions, or Vercel Cron

import { NextRequest, NextResponse } from 'next/server'
import { marketUpdateService } from '@/lib/marketUpdateService'
import { marketDataManager } from '@/lib/marketData'

// Security: Only allow updates from authorized sources
const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret-key'

export async function POST(request: NextRequest) {
  try {
    // Verify authorization for scheduled updates
    const authHeader = request.headers.get('authorization')
    const cronSecret = request.headers.get('x-cron-secret')
    
    if (!authHeader && !cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (cronSecret && cronSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Invalid cron secret' }, { status: 401 })
    }

    const body = await request.json()
    const { action, industry, location, force = false } = body

    console.log(`📊 Market data API called: ${action}`, { industry, location, force })

    switch (action) {
      case 'update_all': {
        const results = await marketUpdateService.runScheduledUpdates()
        return NextResponse.json({ 
          success: true, 
          message: 'Scheduled updates completed',
          results
        })
      }

      case 'update_industry': {
        if (!industry) {
          return NextResponse.json({ error: 'Industry parameter required' }, { status: 400 })
        }
        
        if (force) {
          await marketUpdateService.updateHighPriorityIndustry(industry, location)
        } else {
          await marketDataManager.refreshMarketData(industry, location)
        }

        return NextResponse.json({ 
          success: true, 
          message: `Updated market data for ${industry}` 
        })
      }

      case 'force_update_all': {
        await marketUpdateService.forceUpdateAll()
        return NextResponse.json({ 
          success: true, 
          message: 'Force update completed for all industries' 
        })
      }

      case 'get_stats': {
        const stats = await marketUpdateService.getUpdateStats()
        const cachedIndustries = marketDataManager.getCachedIndustries()
        
        return NextResponse.json({ 
          success: true, 
          stats,
          cached_industries: cachedIndustries.length,
          cached_list: cachedIndustries
        })
      }

      case 'clear_cache': {
        marketDataManager.clearCache()
        return NextResponse.json({ 
          success: true, 
          message: 'Cache cleared successfully' 
        })
      }

      default: {
        return NextResponse.json({ 
          error: 'Invalid action. Available: update_all, update_industry, force_update_all, get_stats, clear_cache' 
        }, { status: 400 })
      }
    }
  } catch (error) {
    console.error('Market data update API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint for health check and stats
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'health') {
      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'market-data-updater'
      })
    }

    if (action === 'stats') {
      const stats = await marketUpdateService.getUpdateStats()
      const cachedIndustries = marketDataManager.getCachedIndustries()
      
      return NextResponse.json({
        success: true,
        stats,
        cache: {
          industries_count: cachedIndustries.length,
          industries: cachedIndustries
        },
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      message: 'Market Data Update API',
      endpoints: {
        'POST /': 'Run market data updates',
        'GET /?action=health': 'Health check',
        'GET /?action=stats': 'Get update statistics'
      },
      actions: [
        'update_all - Run scheduled updates for stale data',
        'update_industry - Update specific industry (requires industry param)',
        'force_update_all - Force refresh all industries',
        'get_stats - Get update statistics',
        'clear_cache - Clear in-memory cache'
      ]
    })
  } catch (error) {
    console.error('Market data API GET error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
