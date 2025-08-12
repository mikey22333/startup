// Market Data Auto-Update System
// This system fetches live market data from multiple sources and caches it for business plan generation

import { supabase } from './supabase'

// Market Data Interfaces
interface MarketDataSource {
  id: string
  name: string
  type: 'API' | 'SCRAPING' | 'GOVERNMENT'
  baseUrl: string
  apiKey?: string
  rateLimit: number // requests per minute
  reliability: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface MarketStat {
  id: string
  industry: string
  metric: string
  value: string | number
  unit: string
  timeframe: string
  source: string
  lastUpdated: Date
  reliability: 'VERIFIED' | 'ESTIMATED' | 'PROJECTED'
  geographicScope: string
}

interface IndustryTrend {
  industry: string
  marketSize: {
    current: string
    projected: string
    cagr: string
    year: number
  }
  competitors: Array<{
    name: string
    marketShare: string
    strengths: string[]
    weaknesses: string[]
    fundingInfo?: {
      totalFunding: string
      lastRound: string
      investors: string[]
    }
  }>
  trends: string[]
  opportunities: string[]
  economicContext: {
    gdpGrowth: string
    inflation: string
    businessEase: string
    region: string
  }
  demandTrends: {
    searchInterest: Array<{
      keyword: string
      trend: 'rising' | 'declining' | 'stable'
      changePercent: string
    }>
    seasonality: string
    peakMonths: string[]
  }
  lastUpdated: Date
}

// Market Data Sources Configuration
const MARKET_DATA_SOURCES: MarketDataSource[] = [
  {
    id: 'google_trends',
    name: 'Google Trends API',
    type: 'API',
    baseUrl: 'https://trends.googleapis.com/trends/api',
    rateLimit: 100,
    reliability: 'HIGH'
  },
  {
    id: 'world_bank',
    name: 'World Bank Open Data',
    type: 'API',
    baseUrl: 'https://api.worldbank.org/v2',
    rateLimit: 120,
    reliability: 'HIGH'
  },
  {
    id: 'oecd_api',
    name: 'OECD Statistics API',
    type: 'API',
    baseUrl: 'https://stats.oecd.org/SDMX-JSON',
    rateLimit: 60,
    reliability: 'HIGH'
  },
  {
    id: 'crunchbase',
    name: 'Crunchbase Basic API',
    type: 'API',
    baseUrl: 'https://api.crunchbase.com/api/v4',
    apiKey: process.env.CRUNCHBASE_API_KEY,
    rateLimit: 200,
    reliability: 'HIGH'
  },
  {
    id: 'rapid_api',
    name: 'RapidAPI Market Data',
    type: 'API',
    baseUrl: 'https://rapidapi.com',
    apiKey: process.env.RAPIDAPI_KEY,
    rateLimit: 500,
    reliability: 'MEDIUM'
  }
]

class MarketDataManager {
  private cache: Map<string, { data: any; expires: Date }> = new Map()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  // Get current market data for an industry
  async getMarketData(industry: string, location?: string): Promise<IndustryTrend | null> {
    const cacheKey = `${industry}_${location || 'global'}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && cached.expires > new Date()) {
      console.log(`📊 Using cached market data for ${industry}`)
      return cached.data
    }

    // Try to fetch from database
    const dbData = await this.fetchFromDatabase(industry, location)
    if (dbData && this.isDataFresh(dbData.lastUpdated)) {
      this.cache.set(cacheKey, { data: dbData, expires: new Date(Date.now() + this.CACHE_DURATION) })
      return dbData
    }

    // Fetch fresh data from APIs
    console.log(`🔄 Fetching fresh market data for ${industry}`)
    const freshData = await this.fetchFreshMarketData(industry, location)
    
    if (freshData) {
      // Cache the fresh data
      this.cache.set(cacheKey, { data: freshData, expires: new Date(Date.now() + this.CACHE_DURATION) })
      
      // Store in database for future use
      await this.saveToDatabase(freshData)
      
      return freshData
    }

    return null
  }

  // Fetch market data from database
  private async fetchFromDatabase(industry: string, location?: string): Promise<IndustryTrend | null> {
    try {
      const { data, error } = await supabase
        .from('market_trends')
        .select('*')
        .eq('industry', industry)
        .eq('geographic_scope', location || 'global')
        .order('last_updated', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error fetching from market_trends table:', error)
        return null
      }

      return data?.[0] || null
    } catch (error) {
      console.error('Database fetch error:', error)
      return null
    }
  }

  // Check if data is fresh (less than 7 days old)
  private isDataFresh(lastUpdated: Date): boolean {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return lastUpdated > sevenDaysAgo
  }

  // Fetch fresh market data from multiple sources
  private async fetchFreshMarketData(industry: string, location?: string): Promise<IndustryTrend | null> {
    const results = await Promise.allSettled([
      this.fetchGoogleTrendsData(industry),
      this.fetchWorldBankData(industry, location),
      this.fetchOECDData(industry, location),
      this.fetchCrunchbaseData(industry),
      this.fetchRapidApiData(industry)
    ])

    // Combine successful results
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value)
      .filter(Boolean)

    if (successfulResults.length === 0) {
      console.warn(`No market data sources returned data for ${industry}`)
      return null
    }

    // Merge data from multiple sources
    return this.mergeMarketData(industry, successfulResults, location)
  }

  // Google Trends data fetcher (enhanced with demand analysis)
  private async fetchGoogleTrendsData(industry: string): Promise<any> {
    try {
      // Use the existing Google Custom Search setup for trends analysis
      if (!process.env.GOOGLE_CSE_API_KEY) return null

      // Generate multiple search queries for comprehensive trend analysis
      const trendQueries = [
        `${industry} market size 2024 2025 growth trends`,
        `${industry} demand rising falling trend`,
        `${industry} consumer interest seasonal patterns`,
        `${industry} business opportunities 2025`
      ]
      
      const searchResults = await Promise.allSettled(
        trendQueries.map(query => {
          const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=5`
          return fetch(url)
        })
      )

      const allResults = []
      for (const result of searchResults) {
        if (result.status === 'fulfilled' && result.value.ok) {
          const data = await result.value.json()
          if (data.items) {
            allResults.push(...data.items)
          }
        }
      }

      if (allResults.length === 0) return null

      // Enhanced parsing for demand trends and market intelligence
      const trendsData = this.parseGoogleSearchForMarketData(allResults)
      
      // Add demand analysis
      const demandAnalysis = this.analyzeDemandTrends(allResults)
      
      return {
        ...trendsData,
        demandTrends: demandAnalysis,
        source: 'Google Trends Enhanced',
        queryCount: allResults.length
      }
    } catch (error) {
      console.error('Google Trends enhanced fetch error:', error)
      return null
    }
  }

  // Analyze demand trends from search results
  private analyzeDemandTrends(searchResults: any[]): any {
    const demandKeywords = []
    let seasonality = 'Year-round demand'
    const peakMonths = []

    for (const result of searchResults) {
      const snippet = result.snippet?.toLowerCase() || ''
      const title = result.title?.toLowerCase() || ''
      const text = `${title} ${snippet}`

      // Detect trend direction
      if (text.match(/(rising|growing|increasing|up\s+\d+%|surge|boom)/)) {
        demandKeywords.push({
          keyword: this.extractKeyword(result.title),
          trend: 'rising' as const,
          changePercent: this.extractPercentage(text) || 'N/A'
        })
      } else if (text.match(/(declining|falling|decreasing|down\s+\d+%|drop|slump)/)) {
        demandKeywords.push({
          keyword: this.extractKeyword(result.title),
          trend: 'declining' as const,
          changePercent: this.extractPercentage(text) || 'N/A'
        })
      } else if (text.match(/(stable|steady|consistent|maintained)/)) {
        demandKeywords.push({
          keyword: this.extractKeyword(result.title),
          trend: 'stable' as const,
          changePercent: '0%'
        })
      }

      // Detect seasonality patterns
      const seasonalMatches = text.match(/(holiday|christmas|summer|winter|spring|fall|q[1-4]|seasonal)/g)
      if (seasonalMatches) {
        seasonality = `Seasonal patterns detected: ${seasonalMatches.slice(0, 3).join(', ')}`
      }

      // Extract peak months
      const monthMatches = text.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/gi)
      if (monthMatches) {
        peakMonths.push(...monthMatches.slice(0, 3))
      }
    }

    return {
      searchInterest: demandKeywords.slice(0, 5),
      seasonality,
      peakMonths: Array.from(new Set(peakMonths)).slice(0, 3)
    }
  }

  // Helper method to extract keywords from titles
  private extractKeyword(title: string): string {
    if (!title) return 'Market'
    
    // Extract the main topic from title
    const words = title.split(' ').filter(word => 
      word.length > 3 && 
      !['market', 'size', 'growth', 'trend', 'analysis', 'report'].includes(word.toLowerCase())
    )
    
    return words[0] || 'Market'
  }

  // Helper method to extract percentage changes
  private extractPercentage(text: string): string | null {
    const percentMatch = text.match(/(\d+\.?\d*%)/g)
    return percentMatch ? percentMatch[0] : null
  }

  // RapidAPI market data fetcher
  private async fetchRapidApiData(industry: string): Promise<any> {
    if (!process.env.RAPIDAPI_KEY) return null

    try {
      // Example: IBISWorld API through RapidAPI
      const response = await fetch(`https://ibisworld-industry-reports.p.rapidapi.com/market-research/${encodeURIComponent(industry)}`, {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'ibisworld-industry-reports.p.rapidapi.com'
        }
      })

      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error('RapidAPI fetch error:', error)
      return null
    }
  }

  // World Bank economic data fetcher (enhanced)
  private async fetchWorldBankData(industry: string, location?: string): Promise<any> {
    try {
      const country = this.getWorldBankCountryCode(location)
      
      // Fetch multiple economic indicators
      const indicators = [
        'NY.GDP.MKTP.KD.ZG',  // GDP growth
        'FP.CPI.TOTL.ZG',     // Inflation
        'IC.BUS.EASE.XQ',     // Ease of doing business
        'NE.CON.PRVT.ZS',     // Private consumption
        'IC.REG.COST.PC.ZS'   // Cost of business start-up procedures
      ]
      
      const responses = await Promise.allSettled(
        indicators.map(indicator =>
          fetch(`https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&date=2020:2024&per_page=5&mrv=1`)
        )
      )
      
      const economicData: any = { region: country, indicators: {} }
      
      for (let i = 0; i < responses.length; i++) {
        const result = responses[i]
        if (result.status === 'fulfilled' && result.value.ok) {
          const data = await result.value.json()
          if (data && data[1] && data[1][0]) {
            const indicator = indicators[i]
            const value = data[1][0].value
            
            switch (indicator) {
              case 'NY.GDP.MKTP.KD.ZG':
                economicData.indicators.gdpGrowth = `${value?.toFixed(1) || 'N/A'}%`
                break
              case 'FP.CPI.TOTL.ZG':
                economicData.indicators.inflation = `${value?.toFixed(1) || 'N/A'}%`
                break
              case 'IC.BUS.EASE.XQ':
                economicData.indicators.businessEase = `${value?.toFixed(0) || 'N/A'}/100`
                break
            }
          }
        }
      }
      
      return economicData
    } catch (error) {
      console.error('World Bank fetch error:', error)
      return null
    }
  }

  // OECD statistics data fetcher
  private async fetchOECDData(industry: string, location?: string): Promise<any> {
    try {
      if (!location) return null
      
      const country = this.getOECDCountryCode(location)
      if (!country) return null
      
      // Fetch business confidence and entrepreneurship data
      const response = await fetch(`https://stats.oecd.org/SDMX-JSON/data/BTS_SME/${country}.ENT.TOT.A/all?startTime=2020&endTime=2024`)
      
      if (!response.ok) return null
      
      const data = await response.json()
      return {
        source: 'OECD',
        businessStats: data,
        region: country
      }
    } catch (error) {
      console.error('OECD fetch error:', error)
      return null
    }
  }

  // Crunchbase competitor and funding data fetcher
  private async fetchCrunchbaseData(industry: string): Promise<any> {
    if (!process.env.CRUNCHBASE_API_KEY) return null

    try {
      // Map industry to Crunchbase categories
      const category = this.mapIndustryCrunchbaseCategory(industry)
      
      // Search for companies in the industry
      const response = await fetch(`https://api.crunchbase.com/api/v4/searches/organizations?user_key=${process.env.CRUNCHBASE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-cb-user-key': process.env.CRUNCHBASE_API_KEY
        },
        body: JSON.stringify({
          field_ids: ['name', 'short_description', 'funding_total', 'last_funding_type', 'investor_identifiers'],
          query: {
            filters: [
              {
                type: 'predicate',
                field_id: 'categories',
                operator_id: 'includes',
                values: [category]
              }
            ],
            order: [
              {
                field_id: 'funding_total',
                sort_id: 'desc'
              }
            ]
          },
          limit: 10
        })
      })

      if (!response.ok) return null

      const data = await response.json()
      
      return {
        competitors: data.entities?.map((entity: any) => ({
          name: entity.properties.name,
          description: entity.properties.short_description,
          totalFunding: entity.properties.funding_total?.value_usd || 0,
          lastRound: entity.properties.last_funding_type,
          investors: entity.properties.investor_identifiers?.slice(0, 3) || []
        })) || [],
        fundingTrends: this.analyzeFundingTrends(data.entities || []),
        source: 'Crunchbase'
      }
    } catch (error) {
      console.error('Crunchbase fetch error:', error)
      return null
    }
  }

  // Statista data scraper (respectful scraping with caching)
  private async fetchStatistaDatna(industry: string): Promise<any> {
    try {
      // Only scrape if we have explicit permission or use public data
      // For now, return null to avoid legal issues
      console.log('Statista scraping disabled - implement only with proper permissions')
      return null
    } catch (error) {
      console.error('Statista fetch error:', error)
      return null
    }
  }

  // Parse Google Search results for market data
  private parseGoogleSearchForMarketData(searchResults: any[]): any {
    const marketData: {
      trends: string[]
      marketSize: string | null
      competitors: string[]
      sources: Array<{ title: string; link: string; snippet: string }>
    } = {
      trends: [],
      marketSize: null,
      competitors: [],
      sources: []
    }

    for (const result of searchResults) {
      const snippet = result.snippet?.toLowerCase() || ''
      const title = result.title?.toLowerCase() || ''
      
      // Extract market size information
      const sizeRegex = /(\$[\d.,]+\s*(?:billion|million|trillion))/gi
      const sizeMatches = snippet.match(sizeRegex)
      if (sizeMatches && !marketData.marketSize) {
        marketData.marketSize = sizeMatches[0]
      }

      // Extract growth rates
      const growthRegex = /(\d+\.?\d*%\s*(?:cagr|growth|annually))/gi
      const growthMatches = snippet.match(growthRegex)
      if (growthMatches) {
        marketData.trends.push(`Growth rate: ${growthMatches[0]}`)
      }

      // Extract company names (basic competitor identification)
      const companyRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+Inc\.?|\s+Corp\.?|\s+LLC)?)\b/g
      const companyMatches = snippet.match(companyRegex)
      if (companyMatches) {
        marketData.competitors.push(...companyMatches.slice(0, 3))
      }

      marketData.sources.push({
        title: result.title,
        link: result.link,
        snippet: result.snippet
      })
    }

    return marketData.trends.length > 0 || marketData.marketSize ? marketData : null
  }

  // Merge data from multiple sources into a unified IndustryTrend
  private mergeMarketData(industry: string, sources: any[], location?: string): IndustryTrend {
    const merged: IndustryTrend = {
      industry,
      marketSize: {
        current: 'Data not available',
        projected: 'Data not available', 
        cagr: 'Data not available',
        year: 2024
      },
      competitors: [],
      trends: [],
      opportunities: [],
      economicContext: {
        gdpGrowth: 'N/A',
        inflation: 'N/A', 
        businessEase: 'N/A',
        region: location || 'Global'
      },
      demandTrends: {
        searchInterest: [],
        seasonality: 'Year-round demand',
        peakMonths: []
      },
      lastUpdated: new Date()
    }

    // Merge data from each source
    for (const source of sources) {
      if (!source) continue
      
      // Market size data
      if (source.marketSize) {
        merged.marketSize.current = source.marketSize
      }
      
      // Trends
      if (source.trends) {
        merged.trends.push(...source.trends)
      }
      
      // Competitors with funding info
      if (source.competitors) {
        source.competitors.forEach((comp: any) => {
          if (typeof comp === 'string') {
            // Basic competitor from Google search
            merged.competitors.push({
              name: comp,
              marketShare: 'Unknown',
              strengths: [],
              weaknesses: []
            })
          } else if (comp.name) {
            // Enhanced competitor from Crunchbase
            merged.competitors.push({
              name: comp.name,
              marketShare: 'Unknown',
              strengths: comp.description ? [comp.description.substring(0, 100)] : [],
              weaknesses: [],
              fundingInfo: comp.totalFunding ? {
                totalFunding: typeof comp.totalFunding === 'number' ? 
                  this.formatCurrency(comp.totalFunding) : comp.totalFunding,
                lastRound: comp.lastRound || 'Unknown',
                investors: comp.investors || []
              } : undefined
            })
          }
        })
      }
      
      // Economic context from World Bank/OECD
      if (source.indicators) {
        merged.economicContext = {
          ...merged.economicContext,
          ...source.indicators
        }
      }
      
      // Demand trends from enhanced Google Trends
      if (source.demandTrends) {
        merged.demandTrends = {
          ...merged.demandTrends,
          ...source.demandTrends
        }
      }
      
      // Add funding trends as opportunities
      if (source.fundingTrends) {
        merged.opportunities.push(
          `Funding Activity: ${source.fundingTrends.activeCompanies} companies, avg ${source.fundingTrends.avgFunding}`
        )
      }
    }

    // Remove duplicates using Array.from to avoid Set spread issues
    merged.trends = Array.from(new Set(merged.trends))
    merged.competitors = merged.competitors.filter((comp, index, self) => 
      index === self.findIndex(c => c.name === comp.name)
    ).slice(0, 5) // Keep top 5

    return merged
  }

  // Helper to format currency
  private formatCurrency(amount: number): string {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`
    return `$${amount.toFixed(0)}`
  }

  // Save market data to database
  private async saveToDatabase(trend: IndustryTrend): Promise<void> {
    try {
      const { error } = await supabase
        .from('market_trends')
        .upsert({
          industry: trend.industry,
          market_size_current: trend.marketSize.current,
          market_size_projected: trend.marketSize.projected,
          cagr: trend.marketSize.cagr,
          competitors: JSON.stringify(trend.competitors),
          trends: JSON.stringify(trend.trends),
          opportunities: JSON.stringify(trend.opportunities),
          economic_context: JSON.stringify(trend.economicContext),
          demand_trends: JSON.stringify(trend.demandTrends),
          geographic_scope: 'global',
          last_updated: trend.lastUpdated,
          source: 'enhanced_multi_source_aggregation',
          reliability: 'VERIFIED'
        })

      if (error) {
        console.error('Error saving market trend to database:', error)
      } else {
        console.log(`✅ Saved enhanced market data for ${trend.industry}`)
      }
    } catch (error) {
      console.error('Database save error:', error)
    }
  }

  // Helper to get OECD country codes
  private getOECDCountryCode(location?: string): string | null {
    const locationMap: Record<string, string> = {
      'United States': 'USA',
      'California': 'USA',
      'New York': 'USA', 
      'Texas': 'USA',
      'United Kingdom': 'GBR',
      'Germany': 'DEU',
      'France': 'FRA',
      'Canada': 'CAN',
      'Australia': 'AUS',
      'Japan': 'JPN',
      'South Korea': 'KOR',
      'Netherlands': 'NLD',
      'Switzerland': 'CHE',
      'Sweden': 'SWE',
      'Denmark': 'DNK'
    }
    
    return locationMap[location || ''] || null
  }

  // Map industry to Crunchbase category
  private mapIndustryCrunchbaseCategory(industry: string): string {
    const categoryMap: Record<string, string> = {
      'Technology': 'information-technology',
      'Food & Restaurant': 'food-and-beverage',
      'Retail & E-commerce': 'e-commerce',
      'Healthcare': 'health-care',
      'Education': 'education',
      'Professional Services': 'professional-services',
      'Manufacturing': 'manufacturing',
      'Real Estate': 'real-estate',
      'Transportation': 'transportation',
      'Entertainment': 'media-and-entertainment',
      'Financial Services': 'financial-services',
      'Automotive': 'automotive'
    }
    
    return categoryMap[industry] || 'other'
  }

  // Analyze funding trends from Crunchbase data
  private analyzeFundingTrends(entities: any[]): any {
    if (!entities || entities.length === 0) return null
    
    const totalFunding = entities.reduce((sum, entity) => 
      sum + (entity.properties.funding_total?.value_usd || 0), 0)
    
    const avgFunding = totalFunding / entities.length
    
    const fundingRounds = entities.map(e => e.properties.last_funding_type).filter(Boolean)
    const mostCommonRound = this.getMostCommon(fundingRounds)
    
    return {
      totalFunding: this.formatCurrency(totalFunding),
      avgFunding: this.formatCurrency(avgFunding),
      mostCommonRound,
      activeCompanies: entities.length
    }
  }

  // Helper to get most common item in array
  private getMostCommon(arr: string[]): string {
    if (arr.length === 0) return 'Unknown'
    
    const counts = arr.reduce((acc: Record<string, number>, item) => {
      acc[item] = (acc[item] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(counts).sort(([,a], [,b]) => b - a)[0][0]
  }

  // Helper to get World Bank country codes  
  private getWorldBankCountryCode(location?: string): string {
    const locationMap: Record<string, string> = {
      'United States': 'US',
      'California': 'US', 
      'New York': 'US',
      'Texas': 'US',
      'United Kingdom': 'GB',
      'Germany': 'DE',
      'France': 'FR',
      'Canada': 'CA',
      'Australia': 'AU',
      'Japan': 'JP',
      'Singapore': 'SG',
      'India': 'IN',
      'China': 'CN',
      'Brazil': 'BR',
      'Mexico': 'MX'
    }
    
    return locationMap[location || ''] || 'WLD' // World average
  }

  // Get quick market insights for AI prompt (enhanced)
  async getMarketInsightsForPrompt(industry: string, location?: string): Promise<string> {
    const marketData = await this.getMarketData(industry, location)
    
    if (!marketData) {
      return `Market data for ${industry} is being updated. Using general industry analysis.`
    }

    const insights = [
      `Market Size: ${marketData.marketSize.current}`,
      `Growth Rate: ${marketData.marketSize.cagr}`,
      `Economic Context (${marketData.economicContext.region}): GDP Growth ${marketData.economicContext.gdpGrowth}, Inflation ${marketData.economicContext.inflation}`,
      marketData.demandTrends.searchInterest.length > 0 ? 
        `Demand Trends: ${marketData.demandTrends.searchInterest.map(t => `${t.keyword} (${t.trend})`).join(', ')}` : null,
      marketData.demandTrends.seasonality !== 'Year-round demand' ? 
        `Seasonality: ${marketData.demandTrends.seasonality}` : null,
      `Key Competitors: ${marketData.competitors.slice(0, 3).map(c => 
        c.fundingInfo ? `${c.name} (${c.fundingInfo.totalFunding} raised)` : c.name
      ).join(', ')}`,
      `Market Trends: ${marketData.trends.slice(0, 2).join(', ')}`
    ].filter(insight => insight && !insight.includes('Data not available') && !insight.includes('N/A'))

    const opportunityInsights = marketData.opportunities.length > 0 ? 
      `Opportunities: ${marketData.opportunities.slice(0, 2).join(', ')}` : null

    const allInsights = [...insights, opportunityInsights].filter(Boolean)

    return `ENHANCED MARKET INTELLIGENCE (${marketData.lastUpdated.toDateString()}): ${allInsights.join(' | ')}`
  }

  // Manual refresh for specific industry (for admin use)
  async refreshMarketData(industry: string, location?: string): Promise<boolean> {
    const cacheKey = `${industry}_${location || 'global'}`
    this.cache.delete(cacheKey) // Clear cache to force refresh
    
    const freshData = await this.getMarketData(industry, location)
    return freshData !== null
  }

  // Get all cached industries (for dashboard)
  getCachedIndustries(): string[] {
    return Array.from(this.cache.keys())
  }

  // Clear all cache (for maintenance)
  clearCache(): void {
    this.cache.clear()
    console.log('🗑️ Market data cache cleared')
  }
}

// Export singleton instance
export const marketDataManager = new MarketDataManager()

// Helper function to detect industry from business idea
export function detectIndustry(businessIdea: string): string {
  const industryKeywords: Record<string, string[]> = {
    'Food & Restaurant': ['restaurant', 'food', 'cafe', 'catering', 'delivery', 'kitchen', 'dining'],
    'Technology': ['software', 'app', 'platform', 'saas', 'tech', 'ai', 'automation', 'digital'],
    'Retail & E-commerce': ['store', 'shop', 'retail', 'ecommerce', 'marketplace', 'selling', 'products'],
    'Healthcare': ['health', 'medical', 'clinic', 'wellness', 'therapy', 'fitness', 'nutrition'],
    'Education': ['education', 'training', 'course', 'learning', 'school', 'tutoring', 'teaching'],
    'Professional Services': ['consulting', 'legal', 'accounting', 'marketing', 'agency', 'services'],
    'Manufacturing': ['manufacturing', 'production', 'factory', 'assembly', 'industrial'],
    'Real Estate': ['real estate', 'property', 'construction', 'renovation', 'housing'],
    'Transportation': ['transportation', 'logistics', 'shipping', 'delivery', 'moving'],
    'Entertainment': ['entertainment', 'media', 'gaming', 'events', 'music', 'sports']
  }

  const lowerIdea = businessIdea.toLowerCase()
  
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => lowerIdea.includes(keyword))) {
      return industry
    }
  }

  return 'General Business' // Default fallback
}

// Database schema for market trends table (run this SQL in Supabase)
export const MARKET_TRENDS_SCHEMA = `
CREATE TABLE IF NOT EXISTS market_trends (
  id SERIAL PRIMARY KEY,
  industry VARCHAR(100) NOT NULL,
  market_size_current TEXT,
  market_size_projected TEXT,
  cagr VARCHAR(20),
  competitors JSONB,
  trends JSONB,
  opportunities JSONB,
  economic_context JSONB DEFAULT '{}',
  demand_trends JSONB DEFAULT '{}',
  geographic_scope VARCHAR(50) DEFAULT 'global',
  last_updated TIMESTAMP DEFAULT NOW(),
  source VARCHAR(100),
  reliability VARCHAR(20) DEFAULT 'VERIFIED',
  UNIQUE(industry, geographic_scope)
);

CREATE INDEX IF NOT EXISTS idx_market_trends_industry ON market_trends(industry);
CREATE INDEX IF NOT EXISTS idx_market_trends_updated ON market_trends(last_updated);
CREATE INDEX IF NOT EXISTS idx_market_trends_scope ON market_trends(geographic_scope);

-- Add comment for documentation
COMMENT ON TABLE market_trends IS 'Auto-updating market intelligence with economic context, demand trends, and competitor funding data';
`
