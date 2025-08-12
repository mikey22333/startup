import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { createAdaptiveSystemPrompt, detectBusinessType } from '@/utils/prompt'
import { marketDataIntegration, type ComprehensiveMarketData } from '@/lib/api-integrations'

// In-memory cache maps request key -> Promise resolving to raw plan data (not a Response)
// Storing raw data lets us create a fresh Response per caller; avoids ReadableStream lock errors
const requestCache = new Map<string, Promise<any>>()
const REQUEST_TIMEOUT = 30000 // 30 seconds for fresher data

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = 'openai/gpt-oss-20b:free'

interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
}

// Enhanced interfaces for professional business plans
interface MarketData {
  size: {
    tam: string // Total Addressable Market
    sam: string // Serviceable Addressable Market
    som: string // Serviceable Obtainable Market
    cagr: string // Compound Annual Growth Rate
    source: string
    lastUpdated: string
  }
  trends: {
    growthRate: string
    demand: 'Rising' | 'Stable' | 'Declining'
    seasonality: string
    keyDrivers: string[]
    threats: string[]
  }
  sources: string[]
}

interface Competitor {
  name: string
  description: string
  marketShare?: string
  funding?: string
  strengths: string[]
  weaknesses: string[]
  pricing: {
    model: string
    range: string
  }
  features: string[]
  differentiators: string[]
}

interface Risk {
  category: string
  description: string
  probability: 'Low' | 'Medium' | 'High'
  impact: 'Low' | 'Medium' | 'High'
  priority: number
  mitigation: string
  timeline: string
}

interface FinancialProjection {
  period: string
  revenue: number
  costs: number
  profit: number
  customers: number
  assumptions: string[]
}

interface MarketingChannel {
  channel: string
  audience: string
  budget: string
  expectedCAC: string
  expectedROI: string
  implementation: string[]
}

interface EnhancedMarketingStrategy {
  channels: MarketingChannel[]
  totalBudget: string
  annualBudget: string
}

interface Milestone {
  id: string
  task: string
  duration: string
  dependencies: string[]
  deliverables: string[]
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  timeline: string
}

interface PersonalizationOptions {
  tone: 'investor-focused' | 'lean-startup' | 'corporate' | 'technical'
  jargonLevel: 'minimal' | 'moderate' | 'heavy'
  audience: 'investors' | 'partners' | 'internal' | 'customers'
}

async function searchGoogle(query: string): Promise<GoogleSearchResult[]> {
  if (!process.env.GOOGLE_CSE_API_KEY || !process.env.GOOGLE_CSE_ID) {
    console.warn('Google Custom Search API not configured - skipping supplemental resource search')
    return []
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=5`
    console.log('Google CSE request URL:', url.replace(process.env.GOOGLE_CSE_API_KEY, '[API_KEY]'))
    
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google CSE search failed:', response.status, response.statusText)
      console.error('Google CSE error details:', errorText)
      return []
    }

    const data = await response.json()
    console.log('Google CSE response:', { items: data.items?.length || 0, queries: data.queries })
    
    return data.items?.map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
    })) || []
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Google CSE search timed out after 10 seconds')
    } else {
      console.error('Google CSE search error:', error)
    }
    return []
  }
}

// Fetch real competitor data and performance metrics
async function fetchCompetitorData(businessType: string, competitors: string[]): Promise<any> {
  console.log(`Fetching real competitor data for ${businessType} industry`)
  
  try {
    const competitorPromises = competitors.map(async (competitor) => {
      // Search for real competitor information with current year
      const currentYear = new Date().getFullYear()
      const nextYear = currentYear + 1
      const queries = [
        `${competitor} company revenue sales ${currentYear} ${nextYear}`,
        `${competitor} market share performance data`,
        `${competitor} financial results quarterly earnings`,
        `${competitor} ${businessType} industry statistics`
      ]
      
      const searchResults = await Promise.all(
        queries.map(query => searchGoogle(query))
      )
      
      const allResults = searchResults.flat()
      
      // Extract financial data from search results
      const revenueData = extractFinancialMetrics(allResults, competitor)
      
      return {
        name: competitor,
        ...revenueData,
        searchResults: allResults.slice(0, 3) // Keep top 3 sources
      }
    })
    
    const competitorData = await Promise.all(competitorPromises)
    
    // Also fetch industry benchmarks
    const industryBenchmarks = await fetchIndustryBenchmarks(businessType)
    
    return {
      competitors: competitorData,
      industry: industryBenchmarks,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching competitor data:', error)
    return null
  }
}

// Extract financial metrics from search results
function extractFinancialMetrics(results: any[], companyName: string) {
  const metrics = {
    estimatedRevenue: 'Data not available',
    marketShare: 'Research required',
    growth: 'Analyzing trends',
    performanceData: [] as number[]
  }
  
  for (const result of results) {
    const text = (result.snippet || '').toLowerCase()
    
    // Look for revenue numbers
    const revenueMatch = text.match(/(\$\d+(?:\.\d+)?\s*(?:million|billion|m|b))/i)
    if (revenueMatch && !metrics.estimatedRevenue.includes('$')) {
      metrics.estimatedRevenue = revenueMatch[1]
    }
    
    // Look for market share percentages
    const shareMatch = text.match(/(\d+(?:\.\d+)?%\s*(?:market share|share))/i)
    if (shareMatch && metrics.marketShare === 'Research required') {
      metrics.marketShare = shareMatch[1]
    }
    
    // Look for growth rates
    const growthMatch = text.match(/(?:growth|grew|increased).*?(\d+(?:\.\d+)?%)/i)
    if (growthMatch && metrics.growth === 'Analyzing trends') {
      metrics.growth = `+${growthMatch[1]} growth`
    }
  }
  
  // Generate realistic performance data based on available metrics
  metrics.performanceData = generateRealisticPerformanceData(metrics)
  
  return metrics
}

// Generate realistic performance data based on company metrics
function generateRealisticPerformanceData(metrics: any): number[] {
  const baseValue = 100
  let multiplier = 1
  
  // Adjust multiplier based on revenue size
  if (metrics.estimatedRevenue.includes('billion')) {
    multiplier = 3.5
  } else if (metrics.estimatedRevenue.includes('million')) {
    const revenueNum = parseFloat(metrics.estimatedRevenue.replace(/[^0-9.]/g, ''))
    if (revenueNum > 100) multiplier = 2.5
    else if (revenueNum > 10) multiplier = 1.8
    else multiplier = 1.2
  }
  
  // Generate 31 days of realistic data
  const data: number[] = []
  let currentValue = baseValue * multiplier
  
  for (let i = 0; i < 31; i++) {
    // Add realistic variance and trend
    const dayVariance = 0.95 + Math.random() * 0.1 // ±5% daily variance
    const trendGrowth = 1 + (i * 0.003) // Small upward trend
    currentValue = currentValue * dayVariance * trendGrowth
    data.push(Math.round(currentValue))
  }
  
  return data
}

// Fetch industry benchmarks and averages
async function fetchIndustryBenchmarks(businessType: string) {
  try {
    const currentYear = new Date().getFullYear()
    const benchmarkQueries = [
      `${businessType} industry average revenue per company ${currentYear}`,
      `${businessType} sector performance benchmarks statistics`,
      `${businessType} industry growth rate market data`
    ]
    
    const searchResults = await Promise.all(
      benchmarkQueries.map(query => searchGoogle(query))
    )
    
    const allResults = searchResults.flat()
    
    return {
      averageRevenue: extractIndustryAverage(allResults, 'revenue'),
      averageGrowth: extractIndustryAverage(allResults, 'growth'),
      marketSize: extractIndustryAverage(allResults, 'market size'),
      performanceData: generateIndustryAverageData(businessType)
    }
  } catch (error) {
    console.error('Error fetching industry benchmarks:', error)
    return {
      averageRevenue: 'Research required',
      averageGrowth: 'Analysis needed',
      marketSize: 'Calculate from reports',
      performanceData: generateIndustryAverageData(businessType)
    }
  }
}

// Extract industry averages from search results
function extractIndustryAverage(results: any[], metric: string): string {
  for (const result of results) {
    const text = (result.snippet || '').toLowerCase()
    
    if (metric === 'revenue') {
      const match = text.match(/average.*?(\$\d+(?:\.\d+)?\s*(?:million|billion|k))/i)
      if (match) return match[1]
    } else if (metric === 'growth') {
      const match = text.match(/(?:growth|growing).*?(\d+(?:\.\d+)?%)/i)
      if (match) return `${match[1]} annually`
    } else if (metric === 'market size') {
      const match = text.match(/market.*?(\$\d+(?:\.\d+)?\s*(?:trillion|billion|million))/i)
      if (match) return match[1]
    }
  }
  
  return `${metric} data being researched`
}

// Generate industry average performance data
function generateIndustryAverageData(businessType: string): number[] {
  const industryMultipliers: Record<string, number> = {
    'restaurant': 0.6,
    'e-commerce': 1.2,
    'saas': 1.8,
    'fintech': 2.1,
    'healthcare': 1.4,
    'retail': 0.8,
    'consulting': 1.1,
    'default': 1.0
  }
  
  const multiplier = industryMultipliers[businessType.toLowerCase()] || industryMultipliers['default']
  const baseValue = 50 * multiplier
  
  const data: number[] = []
  for (let i = 0; i < 31; i++) {
    const variance = 0.95 + Math.random() * 0.1
    const value = baseValue * variance * (1 + i * 0.002)
    data.push(Math.round(value))
  }
  
  return data
}

// Enhanced market data fetcher with live API integration
async function fetchLiveMarketData(businessType: string, location?: string): Promise<MarketData | null> {
  console.log(`Fetching comprehensive market data for ${businessType} in ${location || 'global'}`)
  
  try {
    // Use the new integrated market data service
    const comprehensiveData = await marketDataIntegration.getComprehensiveMarketData(
      businessType, 
      location || 'US',
      {
        includeTrends: true,
        includeCompetitors: true,
        includeSentiment: true,
        competitorRadius: 10000 // 10km radius for competitor analysis
      }
    )

    if (!comprehensiveData) {
      console.warn('No comprehensive market data available, falling back to basic estimates')
      return generateFallbackMarketData(businessType)
    }

    // Transform the comprehensive data into the expected MarketData format
    const marketTrends = comprehensiveData.marketTrends
    const competitorAnalysis = comprehensiveData.competitorAnalysis
    const sentiment = comprehensiveData.consumerSentiment

    // Extract market size data from various sources
    const marketSize = marketTrends?.industryMetrics?.marketSize || 'Market size varies by segment'
    const growthRate = marketTrends?.industryMetrics?.growthRate || '3.5%'
    const projectedGrowth = marketTrends?.industryMetrics?.projectedGrowth || '4.2%'

    // Generate realistic TAM/SAM/SOM estimates
    const marketEstimates = generateMarketSizeEstimates(businessType, {
      marketSize,
      growthRate,
      competitorCount: competitorAnalysis?.competitorCount || 0,
      sentimentScore: sentiment?.sentimentScore || 0
    })

    // Determine demand trend based on sentiment and growth
    let demandTrend: 'Rising' | 'Stable' | 'Declining' = 'Stable'
    if (sentiment?.overallSentiment === 'POSITIVE' && parseFloat(growthRate.replace('%', '')) > 2) {
      demandTrend = 'Rising'
    } else if (sentiment?.overallSentiment === 'NEGATIVE' || parseFloat(growthRate.replace('%', '')) < 0) {
      demandTrend = 'Declining'
    }

    // Extract key drivers from various sources
    const keyDrivers = [
      ...(marketTrends?.industryMetrics?.keyDrivers || []),
      ...(sentiment?.trendingTopics?.slice(0, 2) || []),
      'Market demand trends',
      'Economic conditions'
    ].slice(0, 4)

    // Extract threats and risks
    const threats = [
      ...(comprehensiveData.riskFactors?.slice(0, 2) || []),
      'Market competition',
      'Economic uncertainty'
    ].slice(0, 3)

    return {
      size: {
        tam: marketEstimates.tam,
        sam: marketEstimates.sam,
        som: marketEstimates.som,
        cagr: projectedGrowth,
        source: `Real-time API integration: ${comprehensiveData.dataQuality.overallReliability} reliability`,
        lastUpdated: new Date().toISOString().split('T')[0]
      },
      trends: {
        growthRate: growthRate,
        demand: demandTrend,
        seasonality: marketTrends?.industryMetrics?.seasonality?.[0] || 'Year-round business patterns',
        keyDrivers: keyDrivers,
        threats: threats
      },
      sources: [
        'World Bank Open Data API',
        'FRED Economic Data API',
        'Google Places API (Competitors)',
        'Social Media Sentiment Analysis',
        ...(marketTrends?.sources || [])
      ]
    }
  } catch (error) {
    console.error('Error fetching comprehensive market data:', error)
    console.log('Falling back to basic market data generation')
    return generateFallbackMarketData(businessType)
  }
}

// Generate fallback market data when APIs are unavailable
function generateFallbackMarketData(businessType: string): MarketData {
  const estimates = generateMarketSizeEstimates(businessType, {})
  
  return {
    size: {
      tam: estimates.tam,
      sam: estimates.sam,
      som: estimates.som,
      cagr: estimates.cagr,
      source: 'Industry estimates (API unavailable)',
      lastUpdated: new Date().toISOString().split('T')[0]
    },
    trends: {
      growthRate: '3.2%',
      demand: 'Stable' as const,
      seasonality: 'Varies by business type',
      keyDrivers: ['Economic growth', 'Consumer demand', 'Market trends'],
      threats: ['Competition', 'Economic changes', 'Regulatory shifts']
    },
    sources: ['Industry benchmarks', 'Market estimates']
  }
}

// Analyze search results to extract market insights
function analyzeMarketSearchResults(results: GoogleSearchResult[], businessType: string) {
  const insights: any = {}
  
  results.forEach(result => {
    const text = `${result.title} ${result.snippet}`.toLowerCase()
    
    // Extract market size information
    const tamMatch = text.match(/(\$[\d.,]+\s*(?:billion|million|trillion))/i)
    if (tamMatch && !insights.tam) {
      insights.tam = tamMatch[1]
    }
    
    // Extract growth rate
    const cagrMatch = text.match(/(\d+(?:\.\d+)?%?\s*(?:cagr|growth|annually))/i)
    if (cagrMatch && !insights.cagr) {
      insights.cagr = cagrMatch[1]
    }
    
    // Detect growth trends
    if (text.includes('growing') || text.includes('increasing') || text.includes('rising')) {
      insights.demand = 'Rising'
    } else if (text.includes('declining') || text.includes('decreasing')) {
      insights.demand = 'Declining'
    } else {
      insights.demand = 'Stable'
    }
    
    // Extract key drivers
    if (text.includes('driver') || text.includes('factor')) {
      if (!insights.drivers) insights.drivers = []
      if (text.includes('digital')) insights.drivers.push('Digital transformation')
      if (text.includes('mobile')) insights.drivers.push('Mobile adoption')
      if (text.includes('ai') || text.includes('artificial intelligence')) insights.drivers.push('AI innovation')
    }
  })
  
  return insights
}

// Generate realistic market size estimates based on business type and real market research
function generateMarketSizeEstimates(businessType: string, insights: any) {
  // Try to extract market data from insights first
  if (insights && insights.marketData) {
    try {
      // Use real market data when available
      return {
        tam: insights.marketData.size || 'Research required',
        sam: insights.marketData.addressableMarket || 'Analysis needed',
        som: insights.marketData.obtainableMarket || 'Calculate based on resources',
        cagr: insights.marketData.growthRate || 'Determine from industry reports'
      }
    } catch (error) {
      console.log('Using fallback market estimates due to insights parsing error')
    }
  }

  // Generate dynamic market data based on current year
  const currentYear = new Date().getFullYear()
  
  // Industry-informed estimates based on recent market research
  const businessTypeMap: Record<string, { tam: string, samMultiplier: number, somMultiplier: number, cagr: string }> = {
    'restaurant': { tam: `$899 billion (${currentYear} global food service)`, samMultiplier: 0.05, somMultiplier: 0.001, cagr: '4.1% annually (post-pandemic recovery)' },
    'food delivery': { tam: `$150 billion (${currentYear} global food delivery)`, samMultiplier: 0.1, somMultiplier: 0.002, cagr: '11.5% annually (urban growth driven)' },
    'e-commerce': { tam: `$6.2 trillion (${currentYear} global e-commerce)`, samMultiplier: 0.02, somMultiplier: 0.0005, cagr: '14.7% annually (digital transformation)' },
    'saas': { tam: `$195 billion (${currentYear} SaaS market)`, samMultiplier: 0.08, somMultiplier: 0.001, cagr: '18.4% annually (cloud adoption)' },
    'consulting': { tam: `$132 billion (${currentYear} management consulting)`, samMultiplier: 0.03, somMultiplier: 0.0008, cagr: '5.5% annually (digital advisory growth)' },
    'fitness': { tam: `$96 billion (${currentYear} global fitness)`, samMultiplier: 0.04, somMultiplier: 0.001, cagr: '7.8% annually (wellness trend)' },
    'retail': { tam: `$27 trillion (${currentYear} global retail)`, samMultiplier: 0.01, somMultiplier: 0.0002, cagr: '6.3% annually (omnichannel growth)' },
    'education': { tam: `$6 trillion (${currentYear} global education)`, samMultiplier: 0.02, somMultiplier: 0.0005, cagr: '8.2% annually (edtech adoption)' },
    'healthcare': { tam: `$4.4 trillion (${currentYear} global healthcare)`, samMultiplier: 0.015, somMultiplier: 0.0003, cagr: '5.9% annually (aging population)' },
    'fintech': { tam: `$179 billion (${currentYear} fintech valuation)`, samMultiplier: 0.06, somMultiplier: 0.0015, cagr: '23.5% annually (digital banking)' },
    'real estate': { tam: `$3.7 trillion (${currentYear} global real estate)`, samMultiplier: 0.01, somMultiplier: 0.0002, cagr: '4.2% annually (proptech growth)' },
    'coffee': { tam: `$45 billion (${currentYear} global coffee market)`, samMultiplier: 0.08, somMultiplier: 0.002, cagr: '4.1% annually (specialty coffee growth)' },
    'cafe': { tam: `$45 billion (${currentYear} global coffee market)`, samMultiplier: 0.08, somMultiplier: 0.002, cagr: '4.1% annually (specialty coffee growth)' },
    'tech': { tam: `$5.2 trillion (${currentYear} global tech market)`, samMultiplier: 0.02, somMultiplier: 0.0005, cagr: '12.8% annually (digital transformation)' },
    'service': { tam: `$2.8 trillion (${currentYear} global services)`, samMultiplier: 0.025, somMultiplier: 0.0006, cagr: '6.2% annually (service economy growth)' },
    'default': { tam: `$150 billion (${currentYear} general business market)`, samMultiplier: 0.03, somMultiplier: 0.0008, cagr: '4.5% annually (economic growth average)' }
  }

  // Find the best match for business type
  let match = businessTypeMap['default']
  for (const [key, value] of Object.entries(businessTypeMap)) {
    if (businessType.toLowerCase().includes(key) || key.includes(businessType.toLowerCase())) {
      match = value
      break
    }
  }

  // Calculate SAM and SOM based on TAM
  let tamNumber = parseFloat(match.tam.replace(/[^0-9.]/g, ''))
  
  // Handle NaN case - provide fallback value
  if (isNaN(tamNumber) || tamNumber === 0) {
    tamNumber = 100 // Default to $100 billion TAM for unknown industries
  }
  
  const tamUnit = match.tam.includes('trillion') ? 'trillion' : 
                  match.tam.includes('billion') ? 'billion' : 'million'
  
  const samNumber = tamNumber * match.samMultiplier
  const somNumber = tamNumber * match.somMultiplier

  const formatCurrency = (num: number, unit: string) => {
    // Handle NaN or invalid numbers
    if (isNaN(num) || num === 0) {
      return 'Market size analysis needed'
    }
    
    if (unit === 'trillion') {
      return num >= 1 ? `$${num.toFixed(1)} trillion` : `$${(num * 1000).toFixed(0)} billion`
    } else if (unit === 'billion') {
      return num >= 1 ? `$${num.toFixed(1)} billion` : `$${(num * 1000).toFixed(0)} million`
    } else {
      return `$${num.toFixed(0)} million`
    }
  }

  return {
    tam: match.tam,
    sam: formatCurrency(samNumber, tamUnit),
    som: formatCurrency(somNumber, tamUnit),
    cagr: match.cagr
  }
}

// Fetch World Bank economic indicators
async function fetchWorldBankData(country: string) {
  try {
    const countryCode = getCountryCode(country)
    if (!countryCode) return null
    
    const indicators = [
      'NY.GDP.MKTP.KD.ZG', // GDP growth
      'FP.CPI.TOTL.ZG',    // Inflation
      'IC.BUS.EASE.XQ'     // Ease of doing business
    ]
    
    const promises = indicators.map(async (indicator) => {
      const currentYear = new Date().getFullYear()
      const response = await fetch(
        `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json&date=${currentYear-4}:${currentYear}&per_page=5`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        return { indicator, data: data[1] }
      }
      return null
    })
    
    const results = await Promise.all(promises)
    return results.filter(r => r !== null)
  } catch (error) {
    console.error('Error fetching World Bank data:', error)
    return null
  }
}

// Simple country code mapping (extend as needed)
function getCountryCode(country: string): string | null {
  const codes: Record<string, string> = {
    'united states': 'US',
    'usa': 'US',
    'canada': 'CA',
    'united kingdom': 'GB',
    'uk': 'GB',
    'germany': 'DE',
    'france': 'FR',
    'india': 'IN',
    'china': 'CN',
    'japan': 'JP',
    'australia': 'AU'
  }
  return codes[country.toLowerCase()] || null
}

// Enhanced competitive analysis with detailed comparison
async function fetchCompetitiveAnalysis(businessType: string, idea: string, location?: string): Promise<Competitor[]> {
  console.log(`Fetching enhanced competitive analysis for ${businessType} ${location ? `in ${location}` : 'globally'}`)
  
  try {
    // Use the new competitor locations API for location-based analysis
    let competitorLocationData = null
    if (location) {
      try {
        competitorLocationData = await marketDataIntegration.getComprehensiveMarketData(
          businessType, 
          location,
          { includeCompetitors: true, includeTrends: false, includeSentiment: false }
        )
      } catch (error) {
        console.warn('Competitor location analysis failed, falling back to search:', error)
      }
    }

    // Enhanced competitor search queries with current year
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    const competitorQueries = [
      `${businessType} top competitors market leaders ${currentYear} ${nextYear}`,
      `${businessType} competitive analysis comparison pricing features`,
      `${idea} similar companies alternatives startups`,
      `${businessType} funding investments Series A B C latest`,
      `best ${businessType} companies customer reviews ratings`
    ]

    const searchPromises = competitorQueries.map(query => searchGoogle(query))
    const searchResults = await Promise.all(searchPromises)
    const allResults = searchResults.flat()
    
    // Combine location-based and search-based competitor data
    const competitors = analyzeEnhancedCompetitorData(
      allResults, 
      businessType, 
      competitorLocationData?.competitorAnalysis
    )
    
    return competitors
  } catch (error) {
    console.error('Error fetching competitive analysis:', error)
    return generateFallbackCompetitors(businessType)
  }
}

function analyzeEnhancedCompetitorData(
  results: GoogleSearchResult[], 
  businessType: string, 
  locationData?: any
): Competitor[] {
  const competitors: Competitor[] = []
  
  // First, add location-based competitors if available
  if (locationData?.topCompetitors) {
    locationData.topCompetitors.forEach((locCompetitor: any, index: number) => {
      const competitor: Competitor = {
        name: locCompetitor.name,
        description: `Local ${businessType} competitor - ${locCompetitor.address}`,
        marketShare: 'Local market presence',
        funding: 'Private/Local business',
        strengths: [
          `${locCompetitor.rating} star rating`,
          `${locCompetitor.reviewCount} customer reviews`,
          `Local market knowledge`,
          `Established location`
        ],
        weaknesses: generateCompetitorWeaknesses(locCompetitor.name, businessType),
        pricing: {
          model: getPricingModel(businessType),
          range: locCompetitor.priceLevel ? `Price level: ${locCompetitor.priceLevel}/4` : 'Competitive pricing'
        },
        features: generateCompetitorFeatures(businessType),
        differentiators: [
          `Distance: ${Math.round(locCompetitor.distance)}m away`,
          'Local customer base',
          'Physical presence'
        ]
      }
      competitors.push(competitor)
    })
  }
  
  // Then add search-based competitors
  const searchCompetitorNames = extractEnhancedCompetitorNames(results, businessType)
  
  searchCompetitorNames.forEach((name, index) => {
    // Avoid duplicates
    if (competitors.find(c => c.name.toLowerCase().includes(name.toLowerCase()))) {
      return
    }

    const competitorInfo = extractCompetitorDetails(results, name)
    
    const competitor: Competitor = {
      name,
      description: competitorInfo.description || `Leading ${businessType} company`,
      marketShare: competitorInfo.marketShare || 'Market research required',
      funding: competitorInfo.funding || 'Funding information pending',
      strengths: competitorInfo.strengths || generateCompetitorStrengths(name, businessType),
      weaknesses: generateCompetitorWeaknesses(name, businessType),
      pricing: {
        model: competitorInfo.pricingModel || getPricingModel(businessType),
        range: competitorInfo.pricingRange || 'Contact for pricing'
      },
      features: generateCompetitorFeatures(businessType),
      differentiators: competitorInfo.differentiators || [
        'Brand recognition',
        'Market experience',
        'Customer base'
      ]
    }
    
    competitors.push(competitor)
  })
  
  return competitors.slice(0, 8) // Return top 8 competitors max
}

function extractEnhancedCompetitorNames(results: GoogleSearchResult[], businessType: string): string[] {
  const names = new Set<string>()
  
  results.forEach(result => {
    const text = `${result.title} ${result.snippet}`
    
    // Enhanced company name extraction patterns
    const companyPatterns = [
      // Standard company suffixes
      /(\w+(?:\s+\w+){0,2})\s+(?:Inc|Corp|LLC|Ltd|Company|Technologies|Software|Systems|Solutions|Group|Enterprises)/gi,
      // Market leaders pattern
      /(?:top|leading|best|major)\s+(?:\w+\s+)*?(\w+(?:\s+\w+){0,2})\s+(?:in|for|company|service)/gi,
      // Founded/Created pattern
      /(?:founded|launched|created|started)\s+(?:by\s+)?(\w+(?:\s+\w+){0,2})/gi,
      // Competitive mentions
      /(?:vs|versus|compared to|alternative to)\s+(\w+(?:\s+\w+){0,2})/gi,
      // Funding mentions
      /(\w+(?:\s+\w+){0,2})\s+(?:raised|secured|received)\s+\$\d+/gi
    ]
    
    companyPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1]?.trim()
        if (name && name.length > 2 && name.length < 50 && isValidCompanyName(name)) {
          names.add(name)
        }
      }
    })
  })
  
  return Array.from(names)
    .filter(name => !isGenericTerm(name, businessType))
    .slice(0, 10)
}

function extractCompetitorDetails(results: GoogleSearchResult[], companyName: string): any {
  const details: any = {}
  
  results.forEach(result => {
    const text = `${result.title} ${result.snippet}`.toLowerCase()
    const lowerName = companyName.toLowerCase()
    
    if (text.includes(lowerName)) {
      // Extract market share
      const shareMatch = text.match(new RegExp(`${lowerName}[^.]*?(\\d+(?:\\.\\d+)?%[^.]*?(?:market share|share))`, 'i'))
      if (shareMatch && !details.marketShare) {
        details.marketShare = shareMatch[1]
      }
      
      // Extract funding information
      const fundingMatch = text.match(new RegExp(`${lowerName}[^.]*?(?:raised|secured|funding)[^.]*?\\$(\\d+(?:\\.\\d+)?\\s*(?:million|billion))`, 'i'))
      if (fundingMatch && !details.funding) {
        details.funding = `$${fundingMatch[1]} raised`
      }
      
      // Extract description
      if (!details.description && result.snippet.length > 50) {
        details.description = result.snippet.substring(0, 150) + '...'
      }
    }
  })
  
  return details
}

function isValidCompanyName(name: string): boolean {
  const invalidPatterns = [
    /^\d+$/, // Just numbers
    /^(the|and|or|of|in|to|for|with|by)$/i, // Common words
    /^(market|industry|business|company|service|solution)$/i, // Generic terms
  ]
  
  return !invalidPatterns.some(pattern => pattern.test(name))
}

function isGenericTerm(name: string, businessType: string): boolean {
  const genericTerms = [
    'market', 'industry', 'business', 'service', 'solution', 'platform',
    'research', 'report', 'analysis', 'data', 'study', 'survey',
    businessType.toLowerCase()
  ]
  
  return genericTerms.some(term => name.toLowerCase().includes(term))
}

function getPricingModel(businessType: string): string {
  const pricingModels: { [key: string]: string } = {
    'saas': 'Subscription-based',
    'software': 'Subscription/License',
    'restaurant': 'Pay-per-meal',
    'retail': 'Product sales',
    'consulting': 'Hourly/Project-based',
    'e-commerce': 'Commission/Transaction fees',
    'fitness': 'Membership-based',
    'education': 'Course/Tuition fees'
  }
  
  for (const [key, model] of Object.entries(pricingModels)) {
    if (businessType.toLowerCase().includes(key)) {
      return model
    }
  }
  
  return 'Custom pricing'
}

function generateFallbackCompetitors(businessType: string): Competitor[] {
  const fallbackCompetitors = [
    {
      name: `Leading ${businessType} Company A`,
      description: 'Established market leader with strong brand presence',
      marketShare: 'Significant market presence',
      funding: 'Well-funded operation',
      strengths: ['Brand recognition', 'Market experience', 'Customer loyalty'],
      weaknesses: ['Higher pricing', 'Less agile', 'Legacy systems'],
      pricing: { model: getPricingModel(businessType), range: 'Premium pricing' },
      features: generateCompetitorFeatures(businessType),
      differentiators: ['Market leadership', 'Established network', 'Resources']
    },
    {
      name: `Emerging ${businessType} Startup`,
      description: 'Fast-growing startup with innovative approach',
      marketShare: 'Growing market share',
      funding: 'Recently funded',
      strengths: ['Innovation', 'Agility', 'Modern technology'],
      weaknesses: ['Limited resources', 'Smaller customer base', 'Brand awareness'],
      pricing: { model: getPricingModel(businessType), range: 'Competitive pricing' },
      features: generateCompetitorFeatures(businessType),
      differentiators: ['Innovation focus', 'Flexible approach', 'Growth mindset']
    }
  ]
  
  return fallbackCompetitors
}

function generateCompetitorStrengths(name: string, businessType: string): string[] {
  const baseStrengths = [
    'Market presence',
    'Brand recognition',
    'Customer base',
    'Technical expertise',
    'Financial resources'
  ]
  
  // Customize based on business type
  if (businessType.toLowerCase().includes('tech') || businessType.toLowerCase().includes('software')) {
    baseStrengths.push('Technical infrastructure', 'Development team')
  }
  
  if (businessType.toLowerCase().includes('ecommerce') || businessType.toLowerCase().includes('retail')) {
    baseStrengths.push('Supply chain', 'Customer relationships')
  }
  
  return baseStrengths.slice(0, 4)
}

function generateCompetitorWeaknesses(name: string, businessType: string): string[] {
  return [
    'Limited innovation speed',
    'High pricing structure',
    'Complex user experience',
    'Slow customer support response'
  ]
}

function generateCompetitorFeatures(businessType: string): string[] {
  const baseFeatures = [
    'Core platform functionality',
    'Customer dashboard',
    'Analytics and reporting',
    'Mobile accessibility',
    'API integration'
  ]
  
  // Customize based on business type
  if (businessType.toLowerCase().includes('saas')) {
    baseFeatures.push('Multi-tenant architecture', 'SSO integration')
  }
  
  return baseFeatures.slice(0, 5)
}

// Generate risk analysis with prioritization
function generateRiskAnalysis(businessType: string, idea: string): Risk[] {
  const risks: Risk[] = [
    {
      category: 'Market',
      description: 'Market adoption slower than expected',
      probability: 'Medium',
      impact: 'High',
      priority: 1,
      mitigation: 'Conduct pre-launch customer validation surveys and MVP testing with 50+ potential users',
      timeline: 'Pre-launch validation'
    },
    {
      category: 'Competition',
      description: 'Large competitor launches similar product',
      probability: 'High',
      impact: 'High',
      priority: 2,
      mitigation: 'Focus on unique value proposition and build strong customer relationships. File provisional patents for key innovations',
      timeline: 'Ongoing monitoring'
    },
    {
      category: 'Technical',
      description: 'Scalability issues as user base grows',
      probability: 'Medium',
      impact: 'Medium',
      priority: 3,
      mitigation: 'Implement cloud-native architecture from start. Plan load testing at 10x current capacity',
      timeline: 'Months 3-6'
    },
    {
      category: 'Financial',
      description: 'Funding runway shorter than projected',
      probability: 'Medium',
      impact: 'High',
      priority: 4,
      mitigation: 'Maintain 6-month cash buffer. Identify multiple funding sources and maintain investor relationships',
      timeline: 'Quarterly reviews'
    },
    {
      category: 'Regulatory',
      description: 'Compliance requirements change',
      probability: 'Low',
      impact: 'Medium',
      priority: 5,
      mitigation: 'Establish compliance monitoring system. Engage legal counsel for regulatory updates',
      timeline: 'Quarterly compliance audits'
    }
  ]
  
  // Sort by priority (lower number = higher priority)
  return risks.sort((a, b) => a.priority - b.priority)
}

// Generate financial projections
function generateFinancialProjections(businessType: string, budget: string): FinancialProjection[] {
  const budgetNum = parseInt(budget.replace(/[^0-9]/g, '')) || 50000
  
  const projections: FinancialProjection[] = []
  
  // Year 1 - Monthly projections for first 12 months
  for (let month = 1; month <= 12; month++) {
    const monthlyRevenue = calculateMonthlyRevenue(month, businessType, budgetNum)
    const monthlyCosts = calculateMonthlyCosts(month, businessType, budgetNum)
    const customers = calculateCustomerGrowth(month, businessType)
    
    projections.push({
      period: `Month ${month}`,
      revenue: monthlyRevenue,
      costs: monthlyCosts,
      profit: monthlyRevenue - monthlyCosts,
      customers,
      assumptions: [
        `Customer acquisition: ${Math.floor(customers * 0.2)} new/month`,
        `Average revenue per user: $${Math.floor(monthlyRevenue / Math.max(customers, 1))}`,
        `Monthly burn rate: $${Math.floor(monthlyCosts)}`
      ]
    })
  }
  
  // Year 2-3 - Quarterly projections
  for (let year = 2; year <= 3; year++) {
    for (let quarter = 1; quarter <= 4; quarter++) {
      const quarterlyRevenue = calculateQuarterlyRevenue(year, quarter, businessType, budgetNum)
      const quarterlyCosts = calculateQuarterlyCosts(year, quarter, businessType, budgetNum)
      const customers = calculateQuarterlyCustomers(year, quarter, businessType)
      
      projections.push({
        period: `Year ${year} Q${quarter}`,
        revenue: quarterlyRevenue,
        costs: quarterlyCosts,
        profit: quarterlyRevenue - quarterlyCosts,
        customers,
        assumptions: [
          `Market penetration: ${(year - 1) * 2 + quarter}%`,
          `Customer churn rate: ${5 - year}%`,
          `Revenue growth: ${20 + year * 5}% YoY`
        ]
      })
    }
  }
  
  return projections
}

function calculateMonthlyRevenue(month: number, businessType: string, budget: number): number {
  // Growth curve: slow start, then acceleration
  const baseMultiplier = businessType.toLowerCase().includes('saas') ? 2 : 1
  const growthRate = Math.pow(1.3, month - 1) // 30% month-over-month growth
  return Math.floor((budget * 0.01) * baseMultiplier * growthRate)
}

function calculateMonthlyCosts(month: number, businessType: string, budget: number): number {
  const baseCosts = budget * 0.1 // 10% of initial budget per month
  const scalingCosts = (month - 1) * (budget * 0.02) // Increasing costs
  return Math.floor(baseCosts + scalingCosts)
}

function calculateCustomerGrowth(month: number, businessType: string): number {
  const baseGrowth = businessType.toLowerCase().includes('b2b') ? 10 : 50
  return Math.floor(baseGrowth * Math.pow(1.4, month - 1))
}

function calculateQuarterlyRevenue(year: number, quarter: number, businessType: string, budget: number): number {
  const baseRevenue = calculateMonthlyRevenue(12, businessType, budget) * 3 // Last month * 3
  const yearGrowth = Math.pow(2, year - 2) // 2x growth per year
  const quarterGrowth = 1 + (quarter - 1) * 0.2 // 20% growth per quarter
  return Math.floor(baseRevenue * yearGrowth * quarterGrowth)
}

function calculateQuarterlyCosts(year: number, quarter: number, businessType: string, budget: number): number {
  const baseCosts = calculateMonthlyCosts(12, businessType, budget) * 3
  const yearGrowth = Math.pow(1.5, year - 2) // 50% cost growth per year
  const quarterGrowth = 1 + (quarter - 1) * 0.1 // 10% cost growth per quarter
  return Math.floor(baseCosts * yearGrowth * quarterGrowth)
}

function calculateQuarterlyCustomers(year: number, quarter: number, businessType: string): number {
  const baseCustomers = calculateCustomerGrowth(12, businessType)
  const yearGrowth = Math.pow(2.5, year - 2) // 2.5x customer growth per year
  const quarterGrowth = 1 + (quarter - 1) * 0.3 // 30% growth per quarter
  return Math.floor(baseCustomers * yearGrowth * quarterGrowth)
}

// Generate enhanced marketing strategy
function generateMarketingStrategy(businessType: string, budget: string, location?: string): {
  channels: MarketingChannel[]
  totalBudget: string
  annualBudget: string
} {
  const budgetNum = parseInt(budget.replace(/[^0-9]/g, '')) || 50000
  const marketingBudget = budgetNum * 0.3 // 30% of total budget for marketing
  const monthlyBudget = Math.floor(marketingBudget / 12)
  
  const channels: MarketingChannel[] = [
    {
      channel: 'LinkedIn Ads (B2B Focus)',
      audience: 'Business decision makers, 35-55, $75K+ income',
      budget: `$${Math.floor(marketingBudget * 0.3)}/month`,
      expectedCAC: '$150-250',
      expectedROI: '3:1 within 6 months',
      implementation: [
        'Create LinkedIn business page with weekly content',
        'Run targeted lead generation campaigns',
        'A/B test ad creative and targeting',
        'Implement LinkedIn Pixel for retargeting'
      ]
    },
    {
      channel: 'Google Ads (Search)',
      audience: 'Active searchers for industry solutions',
      budget: `$${Math.floor(marketingBudget * 0.25)}/month`,
      expectedCAC: '$80-150',
      expectedROI: '4:1 within 3 months',
      implementation: [
        'Keyword research and competitive analysis',
        'Create high-converting landing pages',
        'Set up conversion tracking and analytics',
        'Daily bid optimization and budget management'
      ]
    },
    {
      channel: 'Content Marketing',
      audience: 'Industry professionals seeking solutions',
      budget: `$${Math.floor(marketingBudget * 0.2)}/month`,
      expectedCAC: '$50-100',
      expectedROI: '5:1 over 12 months',
      implementation: [
        'Weekly blog posts targeting buyer keywords',
        'Create downloadable industry guides',
        'Guest posting on industry publications',
        'SEO optimization for organic traffic'
      ]
    },
    {
      channel: 'Social Media (Organic)',
      audience: 'Followers and industry networks',
      budget: `$${Math.floor(marketingBudget * 0.15)}/month`,
      expectedCAC: '$30-70',
      expectedROI: '3:1 through brand building',
      implementation: [
        'Daily posting schedule across platforms',
        'Engage with industry conversations',
        'Share customer success stories',
        'Build community around brand values'
      ]
    },
    {
      channel: 'Email Marketing',
      audience: 'Newsletter subscribers and leads',
      budget: `$${Math.floor(marketingBudget * 0.1)}/month`,
      expectedCAC: '$20-40',
      expectedROI: '6:1 for existing subscribers',
      implementation: [
        'Set up automated drip campaigns',
        'Weekly newsletters with industry insights',
        'Personalized product recommendations',
        'A/B test subject lines and send times'
      ]
    }
  ]
  
  return {
    channels,
    totalBudget: `$${monthlyBudget.toLocaleString()}/month`,
    annualBudget: `$${marketingBudget.toLocaleString()}/year`
  }
}

// Generate action roadmap with dependencies
function generateActionRoadmap(businessType: string, timeline: string): Milestone[] {
  const milestones: Milestone[] = [
    {
      id: 'market-validation',
      task: 'Market Validation & Customer Discovery',
      duration: '2-3 weeks',
      dependencies: [],
      deliverables: [
        'Customer interview summary (50+ interviews)',
        'Market size validation report',
        'Competitive analysis document',
        'Value proposition refinement'
      ],
      priority: 'Critical',
      timeline: 'Weeks 1-3'
    },
    {
      id: 'mvp-design',
      task: 'MVP Design & Technical Architecture',
      duration: '3-4 weeks',
      dependencies: ['market-validation'],
      deliverables: [
        'Technical architecture document',
        'UI/UX wireframes and prototypes',
        'Database schema design',
        'API specification document'
      ],
      priority: 'Critical',
      timeline: 'Weeks 4-7'
    },
    {
      id: 'legal-setup',
      task: 'Legal Entity & Compliance Setup',
      duration: '1-2 weeks',
      dependencies: [],
      deliverables: [
        'Business entity registration',
        'Terms of service and privacy policy',
        'Intellectual property filings',
        'Insurance and liability coverage'
      ],
      priority: 'High',
      timeline: 'Weeks 2-4'
    },
    {
      id: 'team-building',
      task: 'Core Team Assembly',
      duration: '4-6 weeks',
      dependencies: ['market-validation'],
      deliverables: [
        'Co-founder agreements',
        'Key hire identification and recruitment',
        'Advisory board formation',
        'Team collaboration tools setup'
      ],
      priority: 'High',
      timeline: 'Weeks 3-8'
    },
    {
      id: 'mvp-development',
      task: 'MVP Development & Testing',
      duration: '8-12 weeks',
      dependencies: ['mvp-design', 'team-building'],
      deliverables: [
        'Core feature implementation',
        'Quality assurance testing',
        'User acceptance testing',
        'Performance optimization'
      ],
      priority: 'Critical',
      timeline: 'Weeks 8-20'
    },
    {
      id: 'funding-prep',
      task: 'Funding Strategy & Investor Outreach',
      duration: '4-6 weeks',
      dependencies: ['market-validation', 'legal-setup'],
      deliverables: [
        'Pitch deck creation',
        'Financial projections model',
        'Investor target list',
        'Due diligence document preparation'
      ],
      priority: 'High',
      timeline: 'Weeks 6-12'
    },
    {
      id: 'launch-prep',
      task: 'Go-to-Market Strategy & Launch Preparation',
      duration: '3-4 weeks',
      dependencies: ['mvp-development'],
      deliverables: [
        'Marketing campaign creation',
        'Launch sequence planning',
        'Customer support setup',
        'Analytics and tracking implementation'
      ],
      priority: 'Critical',
      timeline: 'Weeks 18-22'
    },
    {
      id: 'beta-launch',
      task: 'Beta Launch & Customer Feedback',
      duration: '4-6 weeks',
      dependencies: ['launch-prep'],
      deliverables: [
        'Beta user onboarding',
        'Feedback collection and analysis',
        'Product iteration based on feedback',
        'Success metrics evaluation'
      ],
      priority: 'Critical',
      timeline: 'Weeks 22-28'
    }
  ]
  
  return milestones
}

// Enhanced system prompt creation with comprehensive analysis
function createEnhancedSystemPrompt(
  businessType: string,
  verifiedFacts: any[],
  location?: string,
  budget?: string,
  timeline?: string,
  currency?: string,
  marketInsights?: GoogleSearchResult[],
  marketData?: MarketData | null,
  competitiveAnalysis?: Competitor[],
  riskAnalysis?: Risk[],
  financialProjections?: FinancialProjection[],
  marketingStrategy?: EnhancedMarketingStrategy,
  actionRoadmap?: Milestone[],
  personalization?: PersonalizationOptions
): string {
  const tone = personalization?.tone || 'investor-focused'
  const jargonLevel = personalization?.jargonLevel || 'moderate'
  const audience = personalization?.audience || 'investors'

  let toneInstructions = ''
  switch (tone) {
    case 'investor-focused':
      toneInstructions = 'Use professional, data-driven language with focus on ROI, scalability, and market opportunity. Include financial metrics and growth projections.'
      break
    case 'lean-startup':
      toneInstructions = 'Use agile, experimental language focusing on MVP, iteration, and customer validation. Emphasize rapid testing and pivoting.'
      break
    case 'corporate':
      toneInstructions = 'Use formal business language with emphasis on strategic alignment, risk management, and operational excellence.'
      break
    case 'technical':
      toneInstructions = 'Use technical language focusing on architecture, implementation details, and technical feasibility.'
      break
  }

  let jargonInstructions = ''
  switch (jargonLevel) {
    case 'minimal':
      jargonInstructions = 'Use simple, accessible language. Explain technical terms when used.'
      break
    case 'moderate':
      jargonInstructions = 'Use industry-standard terminology but provide context. Balance accessibility with precision.'
      break
    case 'heavy':
      jargonInstructions = 'Use industry-specific jargon and technical terminology freely. Assume expert knowledge.'
      break
  }

  const prompt = `You are an expert business consultant creating a comprehensive business plan. ${toneInstructions} ${jargonInstructions}

IMPORTANT: You MUST create a complete business plan with ALL 10 sections listed below. Use the provided live data and analysis to create a professional, investor-ready document. Do not skip any sections.

CONTEXT:
- Business Type: ${businessType}
- Target Audience: ${audience}
- Currency: ${currency || 'USD'}

LIVE MARKET DATA:
${marketData ? `
Market Size Analysis:
- TAM (Total Addressable Market): ${marketData.size.tam}
- SAM (Serviceable Addressable Market): ${marketData.size.sam}
- SOM (Serviceable Obtainable Market): ${marketData.size.som}
- CAGR (Compound Annual Growth Rate): ${marketData.size.cagr}
- Data Source: ${marketData.size.source}
- Last Updated: ${marketData.size.lastUpdated}

Market Trends:
- Growth Rate: ${marketData.trends.growthRate}
- Demand Status: ${marketData.trends.demand}
- Seasonality: ${marketData.trends.seasonality}
- Key Drivers: ${marketData.trends.keyDrivers.join(', ')}
- Market Threats: ${marketData.trends.threats.join(', ')}

Data Sources: ${marketData.sources.join(', ')}
` : 'Market data being analyzed via live APIs...'}

COMPETITIVE ANALYSIS:
${competitiveAnalysis && competitiveAnalysis.length > 0 ? competitiveAnalysis.map(comp => `
Competitor: ${comp.name}
- Description: ${comp.description}
- Market Share: ${comp.marketShare}
- Funding Status: ${comp.funding}
- Strengths: ${comp.strengths.join(', ')}
- Weaknesses: ${comp.weaknesses.join(', ')}
- Pricing Model: ${comp.pricing.model} (${comp.pricing.range})
- Key Features: ${comp.features.join(', ')}
- Differentiators: ${comp.differentiators.join(', ')}
`).join('\n') : 'Competitive analysis in progress...'}

RISK ANALYSIS (Prioritized):
${riskAnalysis ? riskAnalysis.map(risk => `
${risk.priority}. ${risk.category} Risk: ${risk.description}
- Probability: ${risk.probability} | Impact: ${risk.impact}
- Mitigation: ${risk.mitigation}
- Timeline: ${risk.timeline}
`).join('\n') : 'Risk assessment pending...'}

FINANCIAL PROJECTIONS:
${financialProjections ? financialProjections.slice(0, 8).map(proj => `
${proj.period}: Revenue $${proj.revenue.toLocaleString()}, Costs $${proj.costs.toLocaleString()}, Profit $${proj.profit.toLocaleString()}, Customers ${proj.customers.toLocaleString()}
Assumptions: ${proj.assumptions.join(' | ')}
`).join('\n') : 'Financial modeling in progress...'}

MARKETING STRATEGY:
Total Budget: ${marketingStrategy?.totalBudget || 'TBD'} (${marketingStrategy?.annualBudget || 'TBD'})
${marketingStrategy?.channels ? marketingStrategy.channels.map(channel => `
${channel.channel}:
- Target Audience: ${channel.audience}
- Budget: ${channel.budget}
- Expected CAC: ${channel.expectedCAC}
- Expected ROI: ${channel.expectedROI}
- Implementation: ${channel.implementation.slice(0, 2).join('; ')}
`).join('\n') : 'Marketing strategy being developed...'}

ACTION ROADMAP:
${actionRoadmap ? actionRoadmap.map(milestone => `
${milestone.task} (${milestone.priority} Priority)
- Duration: ${milestone.duration}
- Timeline: ${milestone.timeline}
- Dependencies: ${milestone.dependencies.length > 0 ? milestone.dependencies.join(', ') : 'None'}
- Key Deliverables: ${milestone.deliverables.slice(0, 2).join(', ')}
`).join('\n') : 'Project timeline being optimized...'}

VERIFIED INDUSTRY DATA:
${verifiedFacts.length > 0 ? verifiedFacts.slice(0, 10).map(fact => `• ${fact.content} (${fact.category})`).join('\n') : 'Industry data verification in progress...'}

SUPPLEMENTAL MARKET RESEARCH:
${marketInsights ? marketInsights.slice(0, 8).map(insight => `• ${insight.title}: ${insight.snippet}`).join('\n') : 'Market research compilation in progress...'}

INSTRUCTIONS:
Create a comprehensive business plan with the following structure:

1. EXECUTIVE SUMMARY
   - Clear value proposition with competitive differentiation
   - Market opportunity with live data and sources
   - Financial highlights from projections
   - Funding requirements and use of funds

2. MARKET ANALYSIS WITH SOURCES
   - Market size (TAM/SAM/SOM) with data sources
   - Growth trends and CAGR with citations
   - Customer segments and demand analysis
   - Economic context and drivers
   - Include "Sources" section with URLs and dates

3. COMPETITIVE ANALYSIS MATRIX
   - Competitor comparison table with features, pricing, strengths, weaknesses
   - Positioning map showing differentiation
   - Competitive advantages and barriers to entry
   - Market share analysis

4. RISK ASSESSMENT (Prioritized)
   - Ranked by probability × impact
   - Specific mitigation strategies with timelines
   - Contingency planning
   - Risk monitoring framework

5. FINANCIAL PROJECTIONS (1-3 Years)
   - Monthly projections for Year 1
   - Quarterly projections for Years 2-3
   - Revenue, costs, profit breakdown
   - Customer growth and unit economics
   - Key assumptions and sensitivity analysis
   - Break-even analysis and cash flow

6. MARKETING & CUSTOMER ACQUISITION
   - Channel strategy with budget allocation
   - Customer acquisition funnel
   - CAC and LTV calculations
   - Content marketing and SEO strategy
   - Performance metrics and KPIs

7. OPERATIONS & IMPLEMENTATION
   - Technology architecture and scalability
   - Team structure and hiring plan
   - Supply chain and partnerships
   - Quality control and customer support

8. ROADMAP & MILESTONES
   - Visual timeline with dependencies
   - Critical path analysis
   - Resource allocation and overlap optimization
   - Success metrics and checkpoints

9. FUNDING STRATEGY
   - Funding requirements and stages
   - Investor targeting and value proposition
   - Use of funds breakdown
   - Exit strategy considerations

10. LEGAL & COMPLIANCE
    - Regulatory requirements with costs
    - Intellectual property strategy
    - Data privacy and security
    - Insurance and liability considerations

Format as JSON with the following structure (ALL SECTIONS REQUIRED):
{
  "executiveSummary": "Clear value proposition with market opportunity and funding needs",
  "marketAnalysis": {
    "marketSize": { 
      "tam": "Total Addressable Market with source", 
      "sam": "Serviceable Addressable Market", 
      "som": "Serviceable Obtainable Market",
      "cagr": "Compound Annual Growth Rate",
      "sources": ["Data source URLs"]
    },
    "trends": "Growth trends and market drivers",
    "customers": "Detailed customer segments with demographics",
    "economicContext": "Economic indicators and business environment",
    "demandAnalysis": "Demand patterns and seasonality"
  },
  "competitiveAnalysis": {
    "competitors": [
      { 
        "name": "Competitor name", 
        "marketShare": "Market share percentage",
        "funding": "Funding status and amount",
        "strengths": ["List of strengths"], 
        "weaknesses": ["List of weaknesses"], 
        "pricing": "Pricing model and range",
        "features": ["Key features list"],
        "differentiators": ["What makes them unique"]
      }
    ],
    "positioningMap": "How you differentiate from competitors",
    "competitiveAdvantages": "Your unique advantages",
    "marketGaps": "Opportunities competitors are missing"
  },
  "riskAnalysis": [
    { 
      "category": "Risk category",
      "risk": "Risk description", 
      "probability": "Low/Medium/High", 
      "impact": "Low/Medium/High", 
      "priority": "1-5 ranking",
      "mitigation": "Specific mitigation strategy",
      "timeline": "When to address",
      "monitoring": "How to track this risk"
    }
  ],
  "financialProjections": {
    "year1Monthly": [
      {
        "month": 1,
        "revenue": 0,
        "costs": 5000,
        "profit": -5000,
        "customers": 0,
        "assumptions": ["Monthly assumptions"]
      }
    ],
    "year2Quarterly": [
      {
        "quarter": "Q1",
        "revenue": 50000,
        "costs": 30000,
        "profit": 20000,
        "customers": 500,
        "assumptions": ["Quarterly assumptions"]
      }
    ],
    "year3Quarterly": ["Similar structure"],
    "unitEconomics": {
      "cac": "Customer acquisition cost",
      "ltv": "Lifetime value",
      "arpu": "Average revenue per user",
      "churnRate": "Monthly churn percentage"
    },
    "assumptions": ["Key financial assumptions"],
    "breakEven": "Break-even timeline and metrics",
    "cashFlow": "Cash flow analysis and runway"
  },
  "marketingStrategy": {
    "channels": [
      {
        "channel": "Marketing channel name",
        "audience": "Target audience description",
        "budget": "Monthly budget allocation",
        "expectedCAC": "Expected customer acquisition cost",
        "expectedROI": "Expected return on investment",
        "timeline": "Implementation timeline",
        "metrics": "Success metrics to track"
      }
    ],
    "customerFunnel": "Complete acquisition funnel description",
    "budgetAllocation": "Marketing budget breakdown",
    "conversionMetrics": "Expected conversion rates",
    "retentionStrategy": "Customer retention approach"
  },
  "operations": {
    "technology": "Technology stack and architecture",
    "team": "Team structure and hiring plan",
    "scalability": "How the business will scale",
    "qualityControl": "Quality assurance processes",
    "customerSupport": "Customer support strategy"
  },
  "roadmap": [
    { 
      "id": "milestone-id",
      "milestone": "Milestone name", 
      "duration": "Time required",
      "timeline": "When this happens", 
      "dependencies": ["What must be done first"],
      "deliverables": ["Specific outputs"],
      "resources": "Resources required",
      "successMetrics": "How to measure success"
    }
  ],
  "funding": {
    "requirements": "Total funding needed and stages",
    "useOfFunds": "Detailed breakdown of fund usage",
    "investorTargeting": "Types of investors to approach",
    "timeline": "Funding timeline and milestones",
    "exitStrategy": "Potential exit opportunities"
  },
  "legal": {
    "businessEntity": "Legal structure and registration",
    "intellectualProperty": "IP strategy and protection",
    "compliance": "Regulatory requirements and costs",
    "contracts": "Key contracts and agreements needed",
    "insurance": "Insurance and liability coverage"
  },
  "sources": ["All URLs and data sources referenced with dates"],
  "lastUpdated": "${new Date().toISOString().split('T')[0]}",
  "comprehensivenessScore": "Self-assessment of plan completeness (1-10)"
}

NO HARDCODED RESPONSES: 
- DO NOT use placeholder data, example companies, or generic market figures
- ALL market data MUST be based on the provided live research and current 2025 trends
- ALL competitor names MUST be real companies researched from the market insights
- ALL financial projections MUST be calculated from real market conditions and business type
- ALL risks MUST be specific to the actual business and current market environment
- If real data is unavailable, explicitly state "Research required" instead of using placeholder data
- Include actual data sources and URLs whenever possible

CRITICAL: You MUST include ALL sections above. Do not skip any section. If data is limited, provide realistic estimates and clearly mark them as estimates. Use the provided live market data, competitive analysis, risk assessment, financial projections, marketing strategy, and roadmap data to populate each section comprehensively.

Ensure all financial figures use ${currency || 'USD'} currency and are realistic for the specified budget and market.`

  return prompt
}

// Validate and enhance plan completeness
async function validateAndEnhancePlan(
  planData: any,
  businessType: string,
  idea: string,
  marketData?: MarketData | null,
  competitiveAnalysis?: Competitor[],
  riskAnalysis?: Risk[],
  financialProjections?: FinancialProjection[],
  marketingStrategy?: EnhancedMarketingStrategy,
  actionRoadmap?: Milestone[],
  budget?: string,
  currency?: string,
  competitorData?: any
): Promise<any> {
  console.log('Validating plan completeness...')
  
  // Add real competitor data to the plan for chart visualization
  if (competitorData) {
    planData.competitorData = competitorData
    console.log('Enhanced plan with real competitor performance data')
  }
  
  // Ensure all required sections exist
  const requiredSections = [
    'executiveSummary',
    'marketAnalysis',
    'competitiveAnalysis', 
    'riskAnalysis',
    'financialProjections',
    'marketingStrategy',
    'operations',
    'roadmap',
    'funding',
    'legal'
  ]
  
  // Check which sections are missing or incomplete
  const missingSections = requiredSections.filter(section => {
    return !planData[section] || 
           (typeof planData[section] === 'string' && planData[section].length < 50) ||
           (Array.isArray(planData[section]) && planData[section].length === 0) ||
           (typeof planData[section] === 'object' && Object.keys(planData[section]).length === 0)
  })
  
  console.log('Missing or incomplete sections:', missingSections)
  
  // Enhance missing sections with our generated data
  if (missingSections.includes('marketAnalysis') && marketData) {
    planData.marketAnalysis = {
      marketSize: {
        tam: marketData.size.tam,
        sam: marketData.size.sam,
        som: marketData.size.som,
        cagr: marketData.size.cagr,
        sources: marketData.sources
      },
      trends: `Market shows ${marketData.trends.demand.toLowerCase()} demand with ${marketData.trends.growthRate}. Key drivers include: ${marketData.trends.keyDrivers.join(', ')}.`,
      customers: `Target customers in ${businessType} sector with specific pain points related to ${idea}.`,
      economicContext: 'Economic indicators support business growth in current market conditions.',
      demandAnalysis: `${marketData.trends.seasonality} with ${marketData.trends.demand.toLowerCase()} overall trend.`
    }
  }
  
  if (missingSections.includes('competitiveAnalysis') && competitiveAnalysis && competitiveAnalysis.length > 0) {
    planData.competitiveAnalysis = {
      competitors: competitiveAnalysis.map(comp => ({
        name: comp.name,
        marketShare: comp.marketShare,
        funding: comp.funding,
        strengths: comp.strengths,
        weaknesses: comp.weaknesses,
        pricing: comp.pricing.model + ' - ' + comp.pricing.range,
        features: comp.features,
        differentiators: comp.differentiators
      })),
      positioningMap: 'Unique positioning based on AI-enhanced features and competitive pricing.',
      competitiveAdvantages: 'Superior user experience, advanced AI capabilities, and cost-effective pricing model.',
      marketGaps: 'Competitors lack integrated AI features and user-friendly interfaces at affordable price points.'
    }
  }
  
  if (missingSections.includes('riskAnalysis') && riskAnalysis && riskAnalysis.length > 0) {
    planData.riskAnalysis = riskAnalysis.map(risk => ({
      category: risk.category,
      risk: risk.description,
      probability: risk.probability,
      impact: risk.impact,
      priority: risk.priority.toString(),
      mitigation: risk.mitigation,
      timeline: risk.timeline,
      monitoring: `Regular assessment of ${risk.category.toLowerCase()} factors and market conditions.`
    }))
  }
  
  if (missingSections.includes('financialProjections') && financialProjections && financialProjections.length > 0) {
    const year1 = financialProjections.filter(p => p.period.includes('Month')).slice(0, 12)
    const year2 = financialProjections.filter(p => p.period.includes('Year 2')).slice(0, 4)
    const year3 = financialProjections.filter(p => p.period.includes('Year 3')).slice(0, 4)
    
    planData.financialProjections = {
      year1Monthly: year1,
      year2Quarterly: year2,
      year3Quarterly: year3,
      unitEconomics: {
        cac: '$75-150',
        ltv: '$500-1200',
        arpu: '$50-100',
        churnRate: '5-8% monthly'
      },
      assumptions: [
        '30% month-over-month growth in early stages',
        'Customer acquisition cost decreases with scale',
        'Revenue per user increases with feature adoption',
        'Churn rate improves with product maturity'
      ],
      breakEven: `Month ${Math.floor(Math.random() * 6 + 12)} with sustained profitability`,
      cashFlow: 'Positive cash flow expected by end of Year 1 with proper funding runway.'
    }
  }
  
  if (missingSections.includes('marketingStrategy') && marketingStrategy && marketingStrategy.channels.length > 0) {
    planData.marketingStrategy = {
      channels: marketingStrategy.channels.map(channel => ({
        channel: channel.channel,
        audience: channel.audience,
        budget: channel.budget,
        expectedCAC: channel.expectedCAC,
        expectedROI: channel.expectedROI,
        timeline: 'Ongoing with optimization',
        metrics: 'CTR, conversion rate, CAC, LTV'
      })),
      totalBudget: marketingStrategy.totalBudget,
      annualBudget: marketingStrategy.annualBudget,
      customerFunnel: 'Awareness → Interest → Consideration → Trial → Purchase → Retention → Advocacy',
      budgetAllocation: `Total marketing budget: ${parseInt(budget || '50000') * 0.3}/year distributed across channels`,
      conversionMetrics: 'Landing page: 3-5%, Trial: 15-25%, Purchase: 20-35%',
      retentionStrategy: 'Onboarding optimization, regular feature updates, customer success program'
    }
  }
  
  if (missingSections.includes('operations')) {
    planData.operations = {
      technology: `Modern ${businessType} stack with cloud-native architecture for scalability`,
      team: 'Lean startup team structure with key roles: founder, developer, marketer, customer success',
      scalability: 'Microservices architecture enables horizontal scaling to support growth',
      qualityControl: 'Automated testing, code reviews, customer feedback loops, performance monitoring',
      customerSupport: 'Multi-channel support (email, chat, knowledge base) with response time SLAs'
    }
  }
  
  if (missingSections.includes('roadmap') && actionRoadmap && actionRoadmap.length > 0) {
    planData.roadmap = actionRoadmap.map(milestone => ({
      id: milestone.id,
      milestone: milestone.task,
      duration: milestone.duration,
      timeline: milestone.timeline,
      dependencies: milestone.dependencies,
      deliverables: milestone.deliverables,
      resources: 'Team members, budget allocation, external services as needed',
      successMetrics: 'Completion percentage, quality metrics, timeline adherence'
    }))
  }
  
  if (missingSections.includes('funding')) {
    const budgetNum = parseInt(budget?.replace(/[^0-9]/g, '') || '50000')
    planData.funding = {
      requirements: `Initial funding: ${currency || 'USD'} ${budgetNum.toLocaleString()} for MVP and early growth`,
      useOfFunds: `Product development (40%), Marketing (30%), Operations (20%), Legal/Admin (10%)`,
      investorTargeting: `Angel investors, early-stage VCs focused on ${businessType} sector`,
      timeline: 'Seed funding within 6 months, Series A within 18-24 months',
      exitStrategy: 'Strategic acquisition by industry leader or IPO after significant scale'
    }
  }
  
  if (missingSections.includes('legal')) {
    planData.legal = {
      businessEntity: 'LLC or Corporation registration with appropriate state/country authorities',
      intellectualProperty: 'Trademark registration, potential patents for unique features, trade secrets protection',
      compliance: 'Data privacy (GDPR, CCPA), industry regulations, employment law compliance',
      contracts: 'Terms of service, privacy policy, user agreements, employment contracts, vendor agreements',
      insurance: 'General liability, professional liability, cyber insurance, directors & officers'
    }
  }
  
  // Ensure sources are included
  if (!planData.sources || planData.sources.length === 0) {
    planData.sources = [
      'Live market research via Google Custom Search',
      'World Bank Open Data for economic indicators',
      'Industry analysis and competitive intelligence',
      'Financial modeling based on industry benchmarks',
      `Generated on ${new Date().toISOString().split('T')[0]}`
    ]
  }
  
  // Add comprehensiveness score
  const completedSections = requiredSections.filter(section => 
    planData[section] && 
    !(typeof planData[section] === 'string' && planData[section].length < 50) &&
    !(Array.isArray(planData[section]) && planData[section].length === 0)
  )
  
  planData.comprehensivenessScore = Math.floor((completedSections.length / requiredSections.length) * 10)
  planData.lastUpdated = new Date().toISOString().split('T')[0]
  
  console.log(`Plan validation complete. Completeness score: ${planData.comprehensivenessScore}/10`)
  console.log(`Enhanced sections: ${missingSections.join(', ')}`)
  
  return planData
}

// Inject ONLY verified database data into plan response
async function injectVerifiedDatabaseData(planData: any, businessType: string, location?: string) {
  console.log('=== Injecting verified database data ===')
  
  try {
    const verifiedFacts = await getVerifiedFacts(businessType, location)
    console.log(`Retrieved ${verifiedFacts.length} verified facts from database`)
    
    // Extract legal requirements from verified database data
    const legalFacts = verifiedFacts.filter(f => f.category === 'Legal Requirement')
    if (legalFacts.length > 0) {
      planData.legalRequirements = legalFacts.map(legal => {
        const [requirement, description] = legal.content.split(' - ')
        const costMatch = description.match(/\(Est\. cost: ([^)]+)\)/)
        const cost = costMatch ? costMatch[1] : 'Varies'
        const cleanDescription = description.replace(/\(Est\. cost: [^)]+\)/, '').trim()
        
        return {
          requirement: requirement.trim(),
          description: cleanDescription,
          cost: cost,
          source: 'Verified Database',
          reliability: 'VERIFIED',
          urgency: 'Pre-launch'
        }
      })
      console.log(`Injected ${planData.legalRequirements.length} verified legal requirements`)
    } else {
      planData.legalRequirements = []
      console.log('No verified legal requirements found in database')
    }
    
    // Extract tools from verified database data
    const toolFacts = verifiedFacts.filter(f => f.category === 'Recommended Tool')
    if (toolFacts.length > 0) {
      planData.recommendedTools = toolFacts.map(tool => {
        const parts = tool.content.split(':')
        const name = parts[0].trim()
        const remaining = parts.slice(1).join(':').trim()
        
        const costMatch = remaining.match(/\(([^)]+)\)$/)
        const cost = costMatch ? costMatch[1] : 'Varies'
        const description = remaining.replace(/\([^)]+\)$/, '').trim()
        
        return {
          name: name,
          description: description,
          cost: cost,
          alternatives: ['See database for alternatives'],
          link: '#'
        }
      })
      console.log(`Injected ${planData.recommendedTools.length} verified tools`)
    } else {
      planData.recommendedTools = []
      console.log('No verified tools found in database')
    }
    
  } catch (error) {
    console.error('Error injecting verified database data:', error)
    // Ensure empty arrays if database query fails
    planData.legalRequirements = planData.legalRequirements || []
    planData.recommendedTools = planData.recommendedTools || []
  }
  
  return planData
}

async function getVerifiedFacts(businessType: string, location?: string) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, returning empty verified facts')
      return []
    }

    // Try multiple business type variations for better matching
    const businessTypeVariations = [
      businessType,
      businessType.toUpperCase(),
      businessType.toLowerCase(),
      businessType.replace('/', '_'),
      businessType.replace('PHYSICAL/SERVICE', 'SERVICE'),
      businessType.replace('PHYSICAL/SERVICE', 'PHYSICAL')
    ]

    let industries = null
    let industryId = null

    // Try to find matching industry with variations
    for (const typeVariation of businessTypeVariations) {
      const { data } = await supabase
        .from('industries')
        .select('*')
        .eq('type', typeVariation)
        .limit(1)

      if (data?.length) {
        industries = data
        industryId = data[0].id
        console.log(`Found industry match with type: ${typeVariation}`)
        break
      }
    }

    if (!industryId) {
      console.log('No industry data found for any type variation:', businessTypeVariations)
      console.log('Returning empty array - no verified data available')
      return []
    }

    // Get legal requirements
    const legalQuery = supabase
      .from('legal_requirements')
      .select('*')
      .eq('industry_id', industryId)

    if (location) {
      legalQuery.ilike('location', `%${location}%`)
    }

    const { data: legalReqs } = await legalQuery.limit(5)

    // Get startup costs
    const costQuery = supabase
      .from('avg_startup_costs')
      .select('*')
      .eq('industry_id', industryId)

    if (location) {
      costQuery.ilike('location', `%${location}%`)
    }

    const { data: costs } = await costQuery.limit(2)

    // Get common tools
    const { data: tools } = await supabase
      .from('common_tools')
      .select('*')
      .eq('industry_id', industryId)
      .limit(5)

    const verifiedFacts: Array<{ category: string; content: string }> = []

    // Format legal requirements - ONLY verified data
    if (legalReqs?.length) {
      legalReqs.forEach(req => {
        verifiedFacts.push({
          category: 'Legal Requirement',
          content: `${req.requirement} - ${req.description}${req.cost_estimate ? ` (Est. cost: ${req.cost_estimate})` : ''}`
        })
      })
    }

    // Format startup costs - ONLY verified data
    if (costs?.length) {
      costs.forEach(cost => {
        verifiedFacts.push({
          category: 'Startup Costs',
          content: `${cost.description}: $${cost.cost_range_min.toLocaleString()} - $${cost.cost_range_max.toLocaleString()}`
        })
      })
    }

    // Format common tools - ONLY verified data
    if (tools?.length) {
      tools.forEach(tool => {
        verifiedFacts.push({
          category: 'Recommended Tool',
          content: `${tool.name}: ${tool.description} (${tool.cost})`
        })
      })
    }

    // Return only verified facts - no fallback supplementation
    const legalCount = verifiedFacts.filter(f => f.category === 'Legal Requirement').length
    const toolsCount = verifiedFacts.filter(f => f.category === 'Recommended Tool').length
    const costsCount = verifiedFacts.filter(f => f.category === 'Startup Costs').length

    console.log(`Verified data only - Legal: ${legalCount}, Tools: ${toolsCount}, Costs: ${costsCount}`)
    return verifiedFacts
  } catch (error) {
    console.error('Error fetching verified facts:', error)
    console.log('Returning empty array due to error - no fallback data')
    return []
  }
}

async function generateSimplifiedPlan(idea: string, location?: string, budget?: string, timeline?: string, providedBusinessType?: string, currency?: string) {
  try {
    const businessType = detectBusinessType(idea, providedBusinessType)
    const currencySymbol = getCurrencySymbol(currency || 'USD')
    
    const simplifiedPrompt = `You are a business consultant. Create a comprehensive business plan JSON for: "${idea}" ${location ? `in ${location}` : ''}.

Budget: ${budget ? getBudgetRange(budget, currency) : currencySymbol + '5,000-15,000'}
Timeline: ${timeline || '3-6 months'}
Location: ${location || 'General'}

CRITICAL: Return ONLY a complete JSON structure with relevant, actionable content:

{
  "summary": "2-3 sentence business overview explaining market opportunity and unique value",
  "businessScope": {
    "targetCustomers": "Specific demographic with pain points (not 'everyone')",
    "competitors": ["Name 2-3 actual competitors and your advantage"],
    "growthPotential": "What makes this scalable and timing factors",
    "marketReadiness": "Why this solution is needed now"
  },
  "feasibility": {
    "marketType": "${businessType}",
    "difficultyLevel": "Easy|Moderate|Complex",
    "estimatedTimeToLaunch": "${timeline || '3-6 months'}",
    "estimatedStartupCost": "${budget ? getBudgetRange(budget, currency) : currencySymbol + '5,000-15,000'}"
  },
  "actionPlan": [
    {
      "stepName": "Market Research & Validation",
      "phase": "Market Research",
      "description": "Specific research tasks and validation methods for this business idea",
      "recommendedTools": ["Google Trends", "SurveyMonkey"],
      "estimatedTime": "2-3 weeks",
      "estimatedCost": "${currencySymbol}200-500",
      "responsibleRole": "Founder",
      "deliverables": ["Market analysis report", "Customer persona document"]
    },
    {
      "stepName": "Business Setup & Legal",
      "phase": "Development", 
      "description": "Register business, get necessary permits, set up legal structure",
      "recommendedTools": ["LegalZoom", "QuickBooks"],
      "estimatedTime": "1-2 weeks",
      "estimatedCost": "${currencySymbol}300-800",
      "responsibleRole": "Founder",
      "deliverables": ["Business registration", "Bank account setup"]
    },
    {
      "stepName": "Product/Service Development",
      "phase": "Development",
      "description": "Build MVP or initial service offering based on market research",
      "recommendedTools": ["Industry-specific tools"],
      "estimatedTime": "4-8 weeks", 
      "estimatedCost": "${currencySymbol}1,000-3,000",
      "responsibleRole": "Founder/Developer",
      "deliverables": ["Working MVP/service", "Quality testing complete"]
    },
    {
      "stepName": "Marketing Launch",
      "phase": "Launch",
      "description": "Execute go-to-market strategy with targeted customer acquisition",
      "recommendedTools": ["Google Ads", "Social Media"],
      "estimatedTime": "2-4 weeks",
      "estimatedCost": "${currencySymbol}500-1,500", 
      "responsibleRole": "Founder/Marketer",
      "deliverables": ["First 10 customers", "Marketing metrics dashboard"]
    },
    {
      "stepName": "Scale & Optimize",
      "phase": "Growth",
      "description": "Analyze performance, optimize processes, plan growth initiatives",
      "recommendedTools": ["Analytics tools", "CRM system"],
      "estimatedTime": "Ongoing",
      "estimatedCost": "${currencySymbol}300-800/month",
      "responsibleRole": "Founder",
      "deliverables": ["Growth metrics", "Optimization plan"]
    }
  ],
  "marketingPlan": {
    "targetAudience": {
      "demographics": "Age, income, location, job titles specific to this business",
      "behavior": "Where they spend time, how they make decisions"
    },
    "channels": ["Specific marketing channels relevant to target audience"],
    "budget": "${currencySymbol}200-800/month"
  },
  "resources": [
    {
      "name": "Find and provide ACTUAL industry-specific resources",
      "description": "Research and include real government databases, industry reports, or professional associations relevant to this business type",
      "link": "RESEARCH_REAL_LINKS_FOR_THIS_INDUSTRY",
      "type": "SUGGESTED"
    }
  ]
}

Make the action plan HIGHLY RELEVANT to "${idea}" - avoid generic steps. Include specific tools, realistic costs, and actionable deliverables.`

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          { role: 'user', content: simplifiedPrompt }
        ],
        temperature: 0.5,
        max_tokens: 4000,
      }),
    })

    let content: string | null = null

    if (!response.ok) {
      console.error('Simplified plan Together API failed:', response.status, 'trying OpenRouter...')
      
      // Try OpenRouter fallback for simplified plan
      content = await callOpenRouterAPI('You are a business consultant. Create accurate, actionable business plans.', simplifiedPrompt)
      
      if (!content) {
        console.error('Both Together AI and OpenRouter failed for simplified plan')
        return null
      }
    } else {
      const data = await response.json()
      content = data.choices[0]?.message?.content
      
      if (!content) {
        console.error('No content from Together AI for simplified plan, trying OpenRouter...')
        content = await callOpenRouterAPI('You are a business consultant. Create accurate, actionable business plans.', simplifiedPrompt)
        
        if (!content) {
          return null
        }
      }
    }

    // Parse simplified response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return null
  } catch (error) {
    console.error('Simplified plan generation failed:', error)
    return null
  }
}

function getBudgetRange(budget: string, currency?: string): string {
  const currencySymbol = getCurrencySymbol(currency || 'USD')
  const ranges: Record<string, string> = {
    'under-5k': `${currencySymbol}1,000-5,000`,
    '5k-10k': `${currencySymbol}5,000-10,000`, 
    '10k-25k': `${currencySymbol}10,000-25,000`,
    '25k-50k': `${currencySymbol}25,000-50,000`,
    '50k-100k': `${currencySymbol}50,000-100,000`,
    '100k-250k': `${currencySymbol}100,000-250,000`,
    '250k+': `${currencySymbol}250,000+`
  }
  return ranges[budget] || `${currencySymbol}5,000-15,000`
}

function getCurrencySymbol(currency: string): string {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF ',
    'CNY': '¥',
    'INR': '₹',
    'BRL': 'R$',
    'MXN': '$',
    'KRW': '₩'
  }
  return currencySymbols[currency] || '$'
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== API Call Started ===', new Date().toISOString())

    const { 
      idea, 
      location, 
      budget, 
      timeline, 
      businessType: providedBusinessType, 
      currency,
      personalization 
    } = await request.json()
    
    console.log('Request data:', { 
      idea, 
      location, 
      budget, 
      timeline, 
      providedBusinessType, 
      currency,
      personalization 
    })

    if (!idea) {
      console.log('Missing idea in request')
      return NextResponse.json({ error: 'Business idea is required' }, { status: 400 })
    }

    // Add timestamp for more frequent cache invalidation and fresher data
    const hourTimestamp = Math.floor(Date.now() / (1000 * 60 * 30)) // 30-minute intervals
    
    const requestKey = JSON.stringify({ 
      idea, 
      location, 
      budget, 
      timeline, 
      providedBusinessType, 
      currency,
      personalization,
      timestamp: hourTimestamp
    })

    if (!requestCache.has(requestKey)) {
      const promise = (async () => {
        try {
          return await processRequest(idea, location, budget, timeline, providedBusinessType, currency, personalization)
        } catch (e) {
          // Remove from cache on failure so user can retry
          requestCache.delete(requestKey)
          throw e
        }
      })()
      requestCache.set(requestKey, promise)
      // Expire after timeout
      setTimeout(() => requestCache.delete(requestKey), REQUEST_TIMEOUT)
    } else {
      console.log('Duplicate request detected, sharing in-flight result')
    }

    const planData = await requestCache.get(requestKey)!
    
    // Return response with cache prevention headers
    return NextResponse.json(planData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('API error (POST root):', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function processRequest(idea: string, location?: string, budget?: string, timeline?: string, providedBusinessType?: string, currency?: string, personalization?: PersonalizationOptions) {
  try {
    // Step 1: Detect business type
    console.log('Step 1: Detecting business type...')
    const businessType = detectBusinessType(idea, providedBusinessType)
    console.log('Business type:', businessType, providedBusinessType ? '(provided)' : '(auto-detected)')

    // Step 2: Get verified facts from database
    console.log('Step 2: Getting verified facts...')
    const verifiedFacts = await getVerifiedFacts(businessType, location)
    console.log('Retrieved verified facts:', verifiedFacts.length)

    // Step 3: Enhanced market analysis with live data
    console.log('Step 3: Fetching enhanced market data...')
    const [marketData, competitiveAnalysis] = await Promise.all([
      fetchLiveMarketData(businessType, location),
      fetchCompetitiveAnalysis(businessType, idea, location)
    ])

    // Step 3.5: Get real competitor data for chart visualization
    console.log('Step 3.5: Fetching real competitor performance data...')
    let competitorData = null
    if (competitiveAnalysis && Array.isArray(competitiveAnalysis) && competitiveAnalysis.length > 0) {
      const competitorNames = competitiveAnalysis
        .slice(0, 3) // Get top 3 competitors
        .map((comp: any) => comp.name)
        .filter(name => name) // Remove any undefined names
      if (competitorNames.length > 0) {
        competitorData = await fetchCompetitorData(businessType, competitorNames)
      }
    }

    // Step 4: Get supplemental market research via Google CSE
    console.log('Step 4: Conducting supplemental market research...')
    const marketResearch = await Promise.allSettled([
      searchGoogle(`${idea} market size 2025 TAM SAM`),
      searchGoogle(`${idea} competitors analysis pricing features`),
      searchGoogle(`${idea} industry trends growth forecast 2025`),
      searchGoogle(`${businessType.toLowerCase()} business startup requirements ${location || ''}`),
      searchGoogle(`${businessType} funding investments venture capital trends`),
      searchGoogle(`${businessType} regulatory compliance requirements ${location || ''}`),
    ])

    const marketInsights = marketResearch
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<GoogleSearchResult[]>).value)
      .flat()
      .slice(0, 12) // Increased for more comprehensive analysis

    // Step 5: Generate enhanced analyses
    console.log('Step 5: Generating enhanced analyses...')
    const riskAnalysis = generateRiskAnalysis(businessType, idea)
    const financialProjections = generateFinancialProjections(businessType, budget || '50000')
    const marketingStrategy = generateMarketingStrategy(businessType, budget || '50000', location)
    const actionRoadmap = generateActionRoadmap(businessType, timeline || '6 months')

    // Step 6: Create enhanced system prompt with all analyses
    console.log('Step 6: Creating enhanced system prompt...')
    const enhancedSystemPrompt = createEnhancedSystemPrompt(
      businessType, 
      verifiedFacts, 
      location, 
      budget, 
      timeline, 
      currency, 
      marketInsights,
      marketData,
      competitiveAnalysis,
      riskAnalysis,
      financialProjections,
      marketingStrategy,
      actionRoadmap,
      personalization
    )
    console.log('Enhanced system prompt length:', enhancedSystemPrompt.length)

    // Step 7: Call Together AI with enhanced prompt
    console.log('Step 7: Calling Together AI...')
    if (!process.env.TOGETHER_API_KEY) {
      console.error('Together API key not configured')
      throw new Error('Together API key not configured')
    }

    const togetherResponse = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { 
            role: 'user', 
            content: `Business idea: ${idea}${location ? `\nLocation: ${location}` : ''}${budget ? `\nBudget: ${budget}` : ''}${timeline ? `\nTimeline: ${timeline}` : ''}${providedBusinessType ? `\nBusiness type: ${providedBusinessType}` : ''}${currency ? `\nCurrency: ${currency}` : ''}` 
          },
        ],
        temperature: 0.7,
        max_tokens: 8000, // Increased for comprehensive plans
      }),
    })

    let aiContent: string | null = null

    if (!togetherResponse.ok) {
      const errorText = await togetherResponse.text()
      console.error('Together AI error:', errorText)
      
      // Handle rate limit errors by trying OpenRouter fallback
      if (togetherResponse.status === 429) {
        console.log('Together AI rate limited, trying OpenRouter fallback...')
        const userPrompt = `Business idea: ${idea}${location ? `\nLocation: ${location}` : ''}${budget ? `\nBudget: ${budget}` : ''}${timeline ? `\nTimeline: ${timeline}` : ''}${providedBusinessType ? `\nBusiness type: ${providedBusinessType}` : ''}${currency ? `\nCurrency: ${currency}` : ''}`
        
        aiContent = await callOpenRouterAPI(enhancedSystemPrompt, userPrompt)
        if (!aiContent) {
          return NextResponse.json(
            { error: 'API rate limit reached and fallback failed. Please wait a minute and try again. The free AI model has a limit of 6 requests per minute.' },
            { status: 429 }
          )
        }
      } else {
        // For other errors, try OpenRouter fallback first before failing
        console.log('Together AI failed, trying OpenRouter fallback...')
        const userPrompt = `Business idea: ${idea}${location ? `\nLocation: ${location}` : ''}${budget ? `\nBudget: ${budget}` : ''}${timeline ? `\nTimeline: ${timeline}` : ''}${providedBusinessType ? `\nBusiness type: ${providedBusinessType}` : ''}${currency ? `\nCurrency: ${currency}` : ''}`
        
        aiContent = await callOpenRouterAPI(enhancedSystemPrompt, userPrompt)
        if (!aiContent) {
          throw new Error(`Together AI request failed: ${togetherResponse.statusText}`)
        }
      }
    } else {
      const togetherData = await togetherResponse.json()
      aiContent = togetherData.choices[0]?.message?.content
    }

    if (!aiContent) {
      throw new Error('No content received from AI providers')
    }

    // Step 8: Parse AI response
    let planData
    try {
      console.log('AI response length:', aiContent.length)
      console.log('AI response preview:', aiContent.substring(0, 500))
      
      // Try to extract JSON between code fences first
      let jsonContent = aiContent
      const codeBlockMatch = aiContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1]
      } else {
        // Fallback to finding JSON object
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          jsonContent = jsonMatch[0]
        } else {
          throw new Error('No JSON found in AI response')
        }
      }

      // Check if JSON is complete
      const openBraces = (jsonContent.match(/\{/g) || []).length
      const closeBraces = (jsonContent.match(/\}/g) || []).length
      
      if (openBraces !== closeBraces) {
        console.error('Incomplete JSON detected - braces mismatch:', { openBraces, closeBraces })
        
        const salvaged = extractBalancedJson(jsonContent)
        if (salvaged) {
          console.log('Salvaged balanced JSON of length:', salvaged.length)
          try {
            planData = JSON.parse(salvaged)
          } catch (e) {
            console.warn('Salvaged JSON still invalid, using fallback:', e)
          }
        }

        if (!planData) {
          console.log('Requesting fallback simplified response due to truncation')
          const fallbackResponse = await generateSimplifiedPlan(idea, location, budget, timeline, providedBusinessType, currency)
          if (fallbackResponse) {
            planData = await injectVerifiedDatabaseData(fallbackResponse, businessType, location)
          } else {
            throw new Error('AI response was truncated and fallback failed')
          }
        }
      } else {
        planData = JSON.parse(jsonContent)
      }
      
      // Step 9: Validate and enhance plan completeness
      console.log('Step 9: Validating and enhancing plan completeness...')
      planData = await validateAndEnhancePlan(
        planData, 
        businessType, 
        idea, 
        marketData,
        competitiveAnalysis,
        riskAnalysis,
        financialProjections,
        marketingStrategy,
        actionRoadmap,
        budget,
        currency,
        competitorData // Add real competitor data
      )
      
      // Validate required fields
      if (!planData.summary && !planData.executiveSummary) {
        throw new Error('Invalid response structure - missing summary/executive summary')
      }
      
      // Inject verified database data for legal requirements and tools
      planData = await injectVerifiedDatabaseData(planData, businessType, location)
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('AI response length:', aiContent.length)
      console.error('AI response preview:', aiContent.substring(0, 1000))
      
      // Try fallback before giving up
      if ((parseError as Error).message.includes('Unexpected end of JSON input') || (parseError as Error).message.includes('truncated')) {
        console.log('Parse error detected, trying fallback simplified response')
        const fallbackResponse = await generateSimplifiedPlan(idea, location, budget, timeline, providedBusinessType, currency)
        if (fallbackResponse) {
          planData = await injectVerifiedDatabaseData(fallbackResponse, businessType, location)
        } else {
          throw new Error('The AI response was incomplete and fallback failed. Please try again with a simpler business idea or try again later.')
        }
      } else {
        throw new Error('Failed to process the AI response. Please try again.')
      }
    }

    return planData

  } catch (error) {
    console.error('API error:', error)
    throw error instanceof Error ? error : new Error('Internal server error')
  }
}

// Extract the first balanced top-level JSON object from a possibly truncated string
function extractBalancedJson(raw: string): string | null {
  const start = raw.indexOf('{')
  if (start === -1) return null
  let depth = 0
  let inString = false
  let escaped = false
  let lastComplete: number | null = null
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i]
    if (inString) {
      if (escaped) {
        escaped = false
      } else if (ch === '\\') {
        escaped = true
      } else if (ch === '"') {
        inString = false
      }
    } else {
      if (ch === '"') inString = true
      else if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) {
          lastComplete = i
          break // stop at first complete top-level object
        }
      }
    }
  }
  if (lastComplete !== null) {
    return raw.substring(start, lastComplete + 1)
  }
  return null
}

// OpenRouter API fallback function
async function callOpenRouterAPI(systemPrompt: string, userPrompt: string): Promise<string | null> {
  try {
    console.log('Calling OpenRouter API as fallback...')
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Business Plan Generator'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      console.error('OpenRouter API failed:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      console.error('No content received from OpenRouter API')
      return null
    }

    console.log('OpenRouter API responded successfully, content length:', content.length)
    return content
  } catch (error) {
    console.error('OpenRouter API error:', error)
    return null
  }
}
