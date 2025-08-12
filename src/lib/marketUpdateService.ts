// Market Data Update Service
// This service runs periodically to refresh market data for all tracked industries

import { marketDataManager } from './marketData'
import { supabase } from './supabase'

interface UpdateJob {
  id: string
  industry: string
  location?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  lastUpdated: Date
  nextUpdate: Date
  retryCount: number
}

class MarketDataUpdateService {
  private readonly MAX_RETRIES = 3
  private readonly UPDATE_INTERVALS = {
    HIGH: 6 * 60 * 60 * 1000,    // 6 hours for high-demand industries
    MEDIUM: 24 * 60 * 60 * 1000, // 24 hours for medium-demand industries  
    LOW: 7 * 24 * 60 * 60 * 1000  // 7 days for low-demand industries
  }

  // Get all industries that need updating
  async getUpdateQueue(): Promise<UpdateJob[]> {
    try {
      const { data, error } = await supabase
        .from('market_trends')
        .select('industry, geographic_scope, last_updated')
        .lt('last_updated', new Date(Date.now() - this.UPDATE_INTERVALS.MEDIUM).toISOString())
        .order('last_updated', { ascending: true })
        .limit(50)

      if (error) {
        console.error('Error fetching update queue:', error)
        return []
      }

      return data.map(item => ({
        id: `${item.industry}_${item.geographic_scope}`,
        industry: item.industry,
        location: item.geographic_scope === 'global' ? undefined : item.geographic_scope,
        priority: this.getIndustryPriority(item.industry),
        lastUpdated: new Date(item.last_updated),
        nextUpdate: this.calculateNextUpdate(item.industry, new Date(item.last_updated)),
        retryCount: 0
      }))
    } catch (error) {
      console.error('Database error fetching update queue:', error)
      return []
    }
  }

  // Run a single update job
  async runUpdateJob(job: UpdateJob): Promise<boolean> {
    console.log(`🔄 Updating market data for ${job.industry} ${job.location ? `(${job.location})` : '(global)'}`)
    
    try {
      const success = await marketDataManager.refreshMarketData(job.industry, job.location)
      
      if (success) {
        console.log(`✅ Successfully updated ${job.industry}`)
        await this.recordUpdateSuccess(job)
        return true
      } else {
        console.warn(`⚠️ Failed to update ${job.industry} - no data returned`)
        await this.recordUpdateFailure(job)
        return false
      }
    } catch (error) {
      console.error(`❌ Error updating ${job.industry}:`, error)
      await this.recordUpdateFailure(job)
      return false
    }
  }

  // Run all pending updates (for scheduled job)
  async runScheduledUpdates(): Promise<{ success: number; failed: number }> {
    console.log('🚀 Starting scheduled market data updates...')
    
    const updateQueue = await this.getUpdateQueue()
    console.log(`📊 Found ${updateQueue.length} industries to update`)

    const results = { success: 0, failed: 0 }

    // Process updates in batches to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < updateQueue.length; i += batchSize) {
      const batch = updateQueue.slice(i, i + batchSize)
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updateQueue.length / batchSize)}`)
      
      const batchResults = await Promise.allSettled(
        batch.map(job => this.runUpdateJob(job))
      )

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          results.success++
        } else {
          results.failed++
          console.error(`Batch job ${i + index} failed:`, result.status === 'rejected' ? result.reason : 'Unknown error')
        }
      })

      // Wait between batches to respect rate limits
      if (i + batchSize < updateQueue.length) {
        console.log('⏳ Waiting 30 seconds before next batch...')
        await new Promise(resolve => setTimeout(resolve, 30000))
      }
    }

    console.log(`📈 Update complete: ${results.success} success, ${results.failed} failed`)
    return results
  }

  // Update high-priority industries (called when user generates plan)
  async updateHighPriorityIndustry(industry: string, location?: string): Promise<void> {
    const job: UpdateJob = {
      id: `${industry}_${location || 'global'}`,
      industry,
      location,
      priority: 'HIGH',
      lastUpdated: new Date(0), // Force immediate update
      nextUpdate: new Date(),
      retryCount: 0
    }

    await this.runUpdateJob(job)
  }

  // Get industry priority based on demand
  private getIndustryPriority(industry: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const highPriorityIndustries = [
      'Technology',
      'Food & Restaurant', 
      'Retail & E-commerce',
      'Healthcare',
      'Professional Services'
    ]

    const mediumPriorityIndustries = [
      'Education',
      'Real Estate',
      'Manufacturing',
      'Transportation'
    ]

    if (highPriorityIndustries.includes(industry)) return 'HIGH'
    if (mediumPriorityIndustries.includes(industry)) return 'MEDIUM'
    return 'LOW'
  }

  // Calculate next update time based on priority
  private calculateNextUpdate(industry: string, lastUpdated: Date): Date {
    const priority = this.getIndustryPriority(industry)
    const interval = this.UPDATE_INTERVALS[priority]
    return new Date(lastUpdated.getTime() + interval)
  }

  // Record successful update
  private async recordUpdateSuccess(job: UpdateJob): Promise<void> {
    try {
      await supabase
        .from('market_update_log')
        .insert({
          industry: job.industry,
          location: job.location || 'global',
          status: 'SUCCESS',
          updated_at: new Date(),
          retry_count: job.retryCount
        })
    } catch (error) {
      console.error('Error recording update success:', error)
    }
  }

  // Record failed update  
  private async recordUpdateFailure(job: UpdateJob): Promise<void> {
    try {
      await supabase
        .from('market_update_log')
        .insert({
          industry: job.industry,
          location: job.location || 'global',
          status: 'FAILED',
          updated_at: new Date(),
          retry_count: job.retryCount + 1,
          error_message: `Failed after ${job.retryCount + 1} attempts`
        })
    } catch (error) {
      console.error('Error recording update failure:', error)
    }
  }

  // Get update statistics (for dashboard)
  async getUpdateStats(): Promise<{
    totalIndustries: number
    recentUpdates: number
    failedUpdates: number
    avgUpdateAge: number
  }> {
    try {
      const [trendsResult, logResult] = await Promise.all([
        supabase.from('market_trends').select('last_updated'),
        supabase.from('market_update_log')
          .select('status, updated_at')
          .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ])

      const totalIndustries = trendsResult.data?.length || 0
      const recentLogs = logResult.data || []
      
      const recentUpdates = recentLogs.filter(log => log.status === 'SUCCESS').length
      const failedUpdates = recentLogs.filter(log => log.status === 'FAILED').length

      const avgUpdateAge = trendsResult.data && trendsResult.data.length > 0
        ? trendsResult.data.reduce((sum, trend) => {
            const age = Date.now() - new Date(trend.last_updated).getTime()
            return sum + age
          }, 0) / trendsResult.data.length / (1000 * 60 * 60) // Convert to hours
        : 0

      return {
        totalIndustries,
        recentUpdates,
        failedUpdates,
        avgUpdateAge: Math.round(avgUpdateAge)
      }
    } catch (error) {
      console.error('Error fetching update stats:', error)
      return { totalIndustries: 0, recentUpdates: 0, failedUpdates: 0, avgUpdateAge: 0 }
    }
  }

  // Manual trigger for immediate updates (admin function)
  async forceUpdateAll(): Promise<void> {
    console.log('🔥 Force updating ALL market data...')
    
    // Clear cache to force fresh fetches
    marketDataManager.clearCache()
    
    // Get all tracked industries
    const { data, error } = await supabase
      .from('market_trends')
      .select('industry, geographic_scope')
      .limit(100)

    if (error || !data) {
      console.error('Error fetching industries for force update:', error)
      return
    }

    // Create update jobs for all industries
    const jobs: UpdateJob[] = data.map(item => ({
      id: `${item.industry}_${item.geographic_scope}`,
      industry: item.industry,
      location: item.geographic_scope === 'global' ? undefined : item.geographic_scope,
      priority: 'HIGH',
      lastUpdated: new Date(0),
      nextUpdate: new Date(),
      retryCount: 0
    }))

    console.log(`Forcing update for ${jobs.length} industries...`)
    
    // Process in smaller batches for force updates
    const batchSize = 3
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize)
      
      await Promise.allSettled(
        batch.map(job => this.runUpdateJob(job))
      )

      // Longer wait between batches for force updates
      if (i + batchSize < jobs.length) {
        console.log('⏳ Waiting 60 seconds before next batch...')
        await new Promise(resolve => setTimeout(resolve, 60000))
      }
    }

    console.log('✅ Force update complete')
  }
}

// Export singleton instance
export const marketUpdateService = new MarketDataUpdateService()

// Database schema for update logging
export const UPDATE_LOG_SCHEMA = `
CREATE TABLE IF NOT EXISTS market_update_log (
  id SERIAL PRIMARY KEY,
  industry VARCHAR(100) NOT NULL,
  location VARCHAR(50) DEFAULT 'global',
  status VARCHAR(20) NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_update_log_industry ON market_update_log(industry);
CREATE INDEX IF NOT EXISTS idx_update_log_status ON market_update_log(status);
CREATE INDEX IF NOT EXISTS idx_update_log_updated ON market_update_log(updated_at);
`
