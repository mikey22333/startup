import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get memory usage information for Render monitoring
    const memoryUsage = process.memoryUsage()
    const memoryMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    }

    // Calculate memory usage percentage (Render Starter has 512MB limit)
    const renderMemoryLimit = process.env.RENDER_MEMORY_LIMIT ? 
      parseInt(process.env.RENDER_MEMORY_LIMIT) : 512
    const memoryUsagePercent = Math.round((memoryMB.rss / renderMemoryLimit) * 100)

    // Get uptime
    const uptimeMinutes = Math.round(process.uptime() / 60)

    // Check if memory is critically high
    const isMemoryCritical = memoryUsagePercent > 85
    const isMemoryWarning = memoryUsagePercent > 70

    const status = isMemoryCritical ? 'critical' : 
                   isMemoryWarning ? 'warning' : 'healthy'

    const healthData = {
      status,
      timestamp: new Date().toISOString(),
      service: 'PlanSpark',
      version: process.env.npm_package_version || '1.0.0',
      uptime: {
        seconds: Math.round(process.uptime()),
        minutes: uptimeMinutes,
        hours: Math.round(uptimeMinutes / 60)
      },
      memory: {
        ...memoryMB,
        usagePercent: memoryUsagePercent,
        limit: renderMemoryLimit,
        status: status
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        renderPlan: 'starter',
        production: process.env.NODE_ENV === 'production'
      },
      performance: {
        memoryOptimized: true,
        garbageCollectionEnabled: typeof global.gc !== 'undefined',
        maxConcurrentGenerations: process.env.NODE_ENV === 'production' ? 2 : 5
      }
    }

    // Return appropriate status code based on health
    const statusCode = isMemoryCritical ? 503 : 200

    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'PlanSpark',
      error: 'Health check failed'
    }, { status: 500 })
  }
}
