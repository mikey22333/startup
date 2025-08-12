// Unified Market Data Integration Service
// Orchestrates all market data APIs and provides a single interface

import { marketTrendsAPI, type MarketTrendData } from './marketTrends'
import { competitorLocationsAPI, type MarketAnalysis } from './competitorLocations'
import { consumerSentimentAPI, type ConsumerSentimentAnalysis } from './consumerSentiment'

export interface ComprehensiveMarketData {
  industry: string
  location: string
  marketTrends: MarketTrendData | null
  competitorAnalysis: MarketAnalysis | null
  consumerSentiment: ConsumerSentimentAnalysis | null
  marketScore: number
  opportunityLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  keyFindings: string[]
  riskFactors: string[]
  recommendations: string[]
  dataQuality: {
    trendsAvailable: boolean
    competitorDataAvailable: boolean
    sentimentDataAvailable: boolean
    overallReliability: 'HIGH' | 'MEDIUM' | 'LOW'
  }
  lastUpdated: Date
}

class MarketDataIntegrationService {
  async getComprehensiveMarketData(
    industry: string,
    location: string = 'US',
    options: {
      includeTrends?: boolean
      includeCompetitors?: boolean
      includeSentiment?: boolean
      competitorRadius?: number
    } = {}
  ): Promise<ComprehensiveMarketData> {
    const {
      includeTrends = true,
      includeCompetitors = true,
      includeSentiment = true,
      competitorRadius = 5000
    } = options

    console.log(`🔄 Fetching latest comprehensive market data for ${industry} in ${location}`)
    
    // Force fresh data by logging current timestamp
    const fetchTimestamp = new Date().toISOString()
    console.log(`📅 Data fetch initiated at: ${fetchTimestamp}`)

    // Fetch all data in parallel
    const [trendsResult, competitorResult, sentimentResult] = await Promise.allSettled([
      includeTrends ? marketTrendsAPI.getMarketTrends(industry, location) : Promise.resolve(null),
      includeCompetitors ? competitorLocationsAPI.getCompetitorAnalysis(industry, location, competitorRadius) : Promise.resolve(null),
      includeSentiment ? consumerSentimentAPI.analyzeConsumerSentiment(industry, location) : Promise.resolve(null)
    ])

    const marketTrends = trendsResult.status === 'fulfilled' ? trendsResult.value : null
    const competitorAnalysis = competitorResult.status === 'fulfilled' ? competitorResult.value : null
    const consumerSentiment = sentimentResult.status === 'fulfilled' ? sentimentResult.value : null

    return this.synthesizeMarketData(industry, location, marketTrends, competitorAnalysis, consumerSentiment)
  }

  private synthesizeMarketData(
    industry: string,
    location: string,
    marketTrends: MarketTrendData | null,
    competitorAnalysis: MarketAnalysis | null,
    consumerSentiment: ConsumerSentimentAnalysis | null
  ): ComprehensiveMarketData {
    const marketScore = this.calculateMarketScore(marketTrends, competitorAnalysis, consumerSentiment)
    const opportunityLevel = this.determineOpportunityLevel(marketScore)
    const keyFindings = this.extractKeyFindings(marketTrends, competitorAnalysis, consumerSentiment)
    const riskFactors = this.identifyRiskFactors(marketTrends, competitorAnalysis, consumerSentiment)
    const recommendations = this.generateRecommendations(marketTrends, competitorAnalysis, consumerSentiment)
    const dataQuality = this.assessDataQuality(marketTrends, competitorAnalysis, consumerSentiment)

    return {
      industry,
      location,
      marketTrends,
      competitorAnalysis,
      consumerSentiment,
      marketScore,
      opportunityLevel,
      keyFindings,
      riskFactors,
      recommendations,
      dataQuality,
      lastUpdated: new Date()
    }
  }

  private calculateMarketScore(
    trends: MarketTrendData | null,
    competitors: MarketAnalysis | null,
    sentiment: ConsumerSentimentAnalysis | null
  ): number {
    let score = 50 // Base score

    // Market trends factor (30% weight)
    if (trends) {
      const growthRate = parseFloat(trends.industryMetrics.growthRate.replace('%', '') || '0')
      if (growthRate > 5) score += 15
      else if (growthRate > 2) score += 10
      else if (growthRate < 0) score -= 15

      const gdpGrowth = parseFloat(trends.economicIndicators.gdpGrowth.replace('%', '') || '0')
      if (gdpGrowth > 2) score += 10
      else if (gdpGrowth < 0) score -= 10
    }

    // Competitor analysis factor (40% weight)
    if (competitors) {
      score += competitors.marketScore * 0.3
      
      switch (competitors.marketDensity) {
        case 'Low': score += 15; break
        case 'Medium': score += 5; break
        case 'High': score -= 15; break
      }
    }

    // Consumer sentiment factor (30% weight)
    if (sentiment) {
      score += sentiment.sentimentScore * 15
      
      if (sentiment.totalMentions > 50) {
        score += 10 // High awareness
      } else if (sentiment.totalMentions < 10) {
        score -= 5 // Low awareness
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private determineOpportunityLevel(score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (score >= 70) return 'HIGH'
    if (score >= 50) return 'MEDIUM'
    return 'LOW'
  }

  private extractKeyFindings(
    trends: MarketTrendData | null,
    competitors: MarketAnalysis | null,
    sentiment: ConsumerSentimentAnalysis | null
  ): string[] {
    const findings: string[] = []

    if (trends) {
      const growthRate = trends.industryMetrics.growthRate
      findings.push(`Industry growth rate: ${growthRate}`)
      
      if (trends.industryMetrics.keyDrivers.length > 0) {
        findings.push(`Key market drivers: ${trends.industryMetrics.keyDrivers.slice(0, 2).join(', ')}`)
      }

      const inflation = trends.economicIndicators.inflation
      if (inflation !== 'N/A') {
        findings.push(`Current inflation rate: ${inflation}`)
      }
    }

    if (competitors) {
      findings.push(`${competitors.competitorCount} competitors found in area`)
      findings.push(`Competition density: ${competitors.marketDensity.toLowerCase()}`)
      findings.push(`Average distance to competitors: ${Math.round(competitors.averageDistance)}m`)
      
      if (competitors.opportunities.length > 0) {
        findings.push(`Market opportunity: ${competitors.opportunities[0]}`)
      }
    }

    if (sentiment) {
      findings.push(`Consumer sentiment: ${sentiment.overallSentiment.toLowerCase()} (${sentiment.totalMentions} mentions)`)
      
      if (sentiment.trendingTopics.length > 0) {
        findings.push(`Trending topics: ${sentiment.trendingTopics.slice(0, 3).join(', ')}`)
      }
    }

    return findings.slice(0, 6)
  }

  private identifyRiskFactors(
    trends: MarketTrendData | null,
    competitors: MarketAnalysis | null,
    sentiment: ConsumerSentimentAnalysis | null
  ): string[] {
    const risks: string[] = []

    if (trends) {
      const growthRate = parseFloat(trends.industryMetrics.growthRate.replace('%', '') || '0')
      if (growthRate < 0) {
        risks.push('Industry showing negative growth')
      }

      const inflation = parseFloat(trends.economicIndicators.inflation.replace('%', '') || '0')
      if (inflation > 5) {
        risks.push('High inflation may impact consumer spending')
      }

      const unemployment = parseFloat(trends.economicIndicators.unemployment.replace('%', '') || '0')
      if (unemployment > 6) {
        risks.push('High unemployment may reduce market demand')
      }
    }

    if (competitors) {
      if (competitors.marketDensity === 'High') {
        risks.push('High competition density in area')
      }

      if (competitors.competitorCount > 10) {
        risks.push('High number of established competitors')
      }

      if (competitors.threats.length > 0) {
        risks.push(competitors.threats[0])
      }
    }

    if (sentiment) {
      if (sentiment.overallSentiment === 'NEGATIVE') {
        risks.push('Negative consumer sentiment toward industry')
      }

      if (sentiment.totalMentions < 5) {
        risks.push('Low consumer awareness/discussion about industry')
      }

      if (sentiment.sentimentScore < -0.3) {
        risks.push('Strongly negative public perception')
      }
    }

    return risks.slice(0, 5)
  }

  private generateRecommendations(
    trends: MarketTrendData | null,
    competitors: MarketAnalysis | null,
    sentiment: ConsumerSentimentAnalysis | null
  ): string[] {
    const recommendations: string[] = []

    // Base business recommendations
    recommendations.push('Conduct additional local market research')
    recommendations.push('Develop a strong unique value proposition')

    if (trends) {
      if (trends.industryMetrics.seasonality.length > 0) {
        recommendations.push(`Plan for seasonal patterns: ${trends.industryMetrics.seasonality[0]}`)
      }

      if (trends.governmentData.subsidies.length > 0) {
        recommendations.push('Explore available government subsidies and incentives')
      }
    }

    if (competitors) {
      recommendations.push(...competitors.recommendations.slice(0, 2))
    }

    if (sentiment) {
      recommendations.push(...sentiment.recommendations.slice(0, 2))
    }

    return Array.from(new Set(recommendations)).slice(0, 8)
  }

  private assessDataQuality(
    trends: MarketTrendData | null,
    competitors: MarketAnalysis | null,
    sentiment: ConsumerSentimentAnalysis | null
  ): any {
    const trendsAvailable = trends !== null
    const competitorDataAvailable = competitors !== null && competitors.competitorCount > 0
    const sentimentDataAvailable = sentiment !== null && sentiment.totalMentions > 0

    let overallReliability: 'HIGH' | 'MEDIUM' | 'LOW'
    const availableDataPoints = [trendsAvailable, competitorDataAvailable, sentimentDataAvailable].filter(Boolean).length

    if (availableDataPoints === 3) overallReliability = 'HIGH'
    else if (availableDataPoints === 2) overallReliability = 'MEDIUM'
    else overallReliability = 'LOW'

    return {
      trendsAvailable,
      competitorDataAvailable,
      sentimentDataAvailable,
      overallReliability
    }
  }

  // Utility method to refresh all data for a specific industry/location
  async refreshMarketData(industry: string, location: string): Promise<void> {
    console.log(`🔄 Refreshing all market data for ${industry} in ${location}`)
    
    // Clear any cached data
    // Note: Individual APIs handle their own caching
    
    // Fetch fresh data
    await this.getComprehensiveMarketData(industry, location)
    
    console.log(`✅ Market data refresh completed for ${industry}`)
  }

  // Get market data status and health check
  async getMarketDataStatus(): Promise<{
    status: 'HEALTHY' | 'DEGRADED' | 'DOWN'
    services: {
      marketTrends: boolean
      competitorAnalysis: boolean
      consumerSentiment: boolean
    }
    lastCheck: Date
  }> {
    try {
      // Test each service with a simple call
      const [trendsTest, competitorTest, sentimentTest] = await Promise.allSettled([
        marketTrendsAPI.getMarketTrends('test', 'US'),
        competitorLocationsAPI.getCompetitorAnalysis('test', 'New York, NY', 1000),
        consumerSentimentAPI.analyzeConsumerSentiment('test', 'US', '1d')
      ])

      const services = {
        marketTrends: trendsTest.status === 'fulfilled',
        competitorAnalysis: competitorTest.status === 'fulfilled',
        consumerSentiment: sentimentTest.status === 'fulfilled'
      }

      const activeServices = Object.values(services).filter(Boolean).length
      let status: 'HEALTHY' | 'DEGRADED' | 'DOWN'
      
      if (activeServices === 3) status = 'HEALTHY'
      else if (activeServices >= 1) status = 'DEGRADED'
      else status = 'DOWN'

      return {
        status,
        services,
        lastCheck: new Date()
      }
    } catch (error) {
      console.error('Market data status check failed:', error)
      return {
        status: 'DOWN',
        services: {
          marketTrends: false,
          competitorAnalysis: false,
          consumerSentiment: false
        },
        lastCheck: new Date()
      }
    }
  }
}

export const marketDataIntegration = new MarketDataIntegrationService()
export type { MarketTrendData, MarketAnalysis, ConsumerSentimentAnalysis }
