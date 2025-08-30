// Enhanced Competitor Intelligence System
// Provides more dynamic and accurate competitor data collection

export interface CompetitorProfile {
  name: string
  description: string
  website?: string
  foundedYear?: number
  employees?: string
  marketShare: {
    percentage?: number
    description: string
    confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  }
  funding: {
    totalRaised?: number
    lastRound?: string
    stage: string
    investors?: string[]
    confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  }
  pricing: {
    model: string
    range: string
    tiers?: Array<{
      name: string
      price: string
      features: string[]
    }>
    confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  }
  strengths: string[]
  weaknesses: string[]
  differentiators: string[]
  keyFeatures: string[]
  customerBase?: string
  recentNews?: Array<{
    headline: string
    date: string
    source: string
  }>
  socialPresence?: {
    linkedin?: number
    twitter?: number
    facebook?: number
  }
  techStack?: string[]
  lastUpdated: Date
  dataQuality: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface CompetitorAnalysis {
  industry: string
  totalCompetitors: number
  marketLeaders: CompetitorProfile[]
  emergingPlayers: CompetitorProfile[]
  directCompetitors: CompetitorProfile[]
  indirectCompetitors: CompetitorProfile[]
  competitiveGaps: string[]
  marketOpportunities: string[]
  threatLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  competitiveLandscape: {
    fragmented: boolean
    dominated: boolean
    emerging: boolean
    mature: boolean
  }
  pricingAnalysis: {
    averagePrice: number
    priceRange: { min: number; max: number }
    dominantModel: string
    pricingTrends: string[]
  }
  lastAnalyzed: Date
}

class EnhancedCompetitorIntelligence {
  
  /**
   * Generate comprehensive competitor analysis with enhanced data collection
   */
  async analyzeCompetitors(
    businessIdea: string, 
    businessType: string, 
    targetMarket: string = 'US'
  ): Promise<CompetitorAnalysis> {
    console.log(`🔍 Enhanced competitor analysis for: ${businessIdea}`)
    
    // Extract key terms for competitor research
    const searchTerms = this.extractCompetitorSearchTerms(businessIdea, businessType)
    
    // Multi-source competitor discovery
    const competitors = await this.discoverCompetitors(searchTerms, targetMarket)
    
    // Enrich competitor data with multiple sources
    const enrichedCompetitors = await this.enrichCompetitorData(competitors)
    
    // Categorize and analyze
    return this.analyzeCompetitiveLandscape(enrichedCompetitors, businessIdea, businessType)
  }

  /**
   * Extract relevant search terms for competitor discovery
   */
  private extractCompetitorSearchTerms(businessIdea: string, businessType: string): string[] {
    const terms: string[] = []
    const lowerIdea = businessIdea.toLowerCase()
    
    // Extract key product/service terms
    const productTerms = lowerIdea.match(/\b(app|platform|service|tool|software|system|solution)\b/g) || []
    const industryTerms = lowerIdea.match(/\b(food|tech|health|fitness|education|finance|retail|travel)\b/g) || []
    const featureTerms = lowerIdea.match(/\b(ai|mobile|cloud|subscription|marketplace|social)\b/g) || []
    
    terms.push(...productTerms, ...industryTerms, ...featureTerms)
    terms.push(businessType.toLowerCase())
    
    // Add specific business model terms
    if (lowerIdea.includes('subscription')) terms.push('saas', 'subscription service')
    if (lowerIdea.includes('delivery')) terms.push('delivery service', 'logistics')
    if (lowerIdea.includes('marketplace')) terms.push('marketplace', 'platform')
    if (lowerIdea.includes('app')) terms.push('mobile app', 'application')
    
    return Array.from(new Set(terms)).filter(term => term.length > 2)
  }

  /**
   * Discover competitors using multiple sources
   */
  private async discoverCompetitors(searchTerms: string[], targetMarket: string): Promise<Partial<CompetitorProfile>[]> {
    const competitors: Partial<CompetitorProfile>[] = []
    
    try {
      // Use Google Custom Search for competitor discovery
      for (const term of searchTerms.slice(0, 3)) { // Limit to top 3 terms
        const searchResults = await this.searchCompetitors(term, targetMarket)
        competitors.push(...searchResults)
      }
      
      // Add industry-specific known competitors
      const knownCompetitors = this.getKnownCompetitors(searchTerms)
      competitors.push(...knownCompetitors)
      
    } catch (error) {
      console.warn('Competitor discovery failed, using fallback data')
    }
    
    // Remove duplicates and limit results
    const uniqueCompetitors = this.deduplicateCompetitors(competitors)
    return uniqueCompetitors.slice(0, 8) // Top 8 competitors
  }

  /**
   * Search for competitors using Google Custom Search
   */
  private async searchCompetitors(searchTerm: string, market: string): Promise<Partial<CompetitorProfile>[]> {
    if (!process.env.GOOGLE_CSE_API_KEY || !process.env.GOOGLE_CSE_ID) {
      return []
    }

    try {
      const query = `${searchTerm} startup company competitors ${market}`
      const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=5`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        console.warn('Google CSE search failed')
        return []
      }
      
      const data = await response.json()
      const items = data.items || []
      
      return items.map((item: any) => ({
        name: this.extractCompanyName(item.title),
        description: item.snippet || '',
        website: item.link,
        lastUpdated: new Date(),
        dataQuality: 'MEDIUM' as const
      }))
      
    } catch (error) {
      console.warn('Competitor search error:', error)
      return []
    }
  }

  /**
   * Get known competitors based on business type and terms
   */
  private getKnownCompetitors(searchTerms: string[]): Partial<CompetitorProfile>[] {
    const competitors: Partial<CompetitorProfile>[] = []
    
    // Tech/SaaS competitors
    if (searchTerms.some(term => ['saas', 'software', 'app', 'platform'].includes(term))) {
      competitors.push({
        name: 'Salesforce',
        description: 'Leading CRM and cloud-based software solutions',
        funding: { stage: 'Public', confidence: 'HIGH' },
        pricing: { model: 'Subscription SaaS', range: '$25-300/user/month', confidence: 'HIGH' },
        dataQuality: 'HIGH'
      })
    }
    
    // Food/Delivery competitors
    if (searchTerms.some(term => ['food', 'delivery', 'restaurant'].includes(term))) {
      competitors.push({
        name: 'DoorDash',
        description: 'Food delivery marketplace connecting customers with restaurants',
        funding: { stage: 'Public', totalRaised: 2500000000, confidence: 'HIGH' },
        pricing: { model: 'Commission + Fees', range: '15-30% commission', confidence: 'HIGH' },
        dataQuality: 'HIGH'
      })
    }
    
    // Fitness/Health competitors
    if (searchTerms.some(term => ['fitness', 'health', 'wellness'].includes(term))) {
      competitors.push({
        name: 'Peloton',
        description: 'Connected fitness platform with hardware and content subscriptions',
        funding: { stage: 'Public', confidence: 'HIGH' },
        pricing: { model: 'Hardware + Subscription', range: '$12.99-44/month', confidence: 'HIGH' },
        dataQuality: 'HIGH'
      })
    }
    
    // Education competitors
    if (searchTerms.some(term => ['education', 'learning', 'training'].includes(term))) {
      competitors.push({
        name: 'Coursera',
        description: 'Online learning platform with university partnerships',
        funding: { stage: 'Public', confidence: 'HIGH' },
        pricing: { model: 'Freemium + Subscriptions', range: '$39-79/month', confidence: 'HIGH' },
        dataQuality: 'HIGH'
      })
    }
    
    return competitors.map(comp => ({
      ...comp,
      lastUpdated: new Date(),
      strengths: ['Market leader', 'Strong brand recognition', 'Extensive resources'],
      weaknesses: ['Large company overhead', 'Less agile', 'Higher prices'],
      differentiators: ['Scale', 'Resources', 'Market presence']
    }))
  }

  /**
   * Enrich competitor data with additional information
   */
  private async enrichCompetitorData(competitors: Partial<CompetitorProfile>[]): Promise<CompetitorProfile[]> {
    const enrichedCompetitors: CompetitorProfile[] = []
    
    for (const competitor of competitors) {
      try {
        const enriched = await this.enrichSingleCompetitor(competitor)
        enrichedCompetitors.push(enriched)
      } catch (error) {
        // Fallback to basic profile
        enrichedCompetitors.push(this.createBasicProfile(competitor))
      }
    }
    
    return enrichedCompetitors
  }

  /**
   * Enrich single competitor with additional data sources
   */
  private async enrichSingleCompetitor(competitor: Partial<CompetitorProfile>): Promise<CompetitorProfile> {
    // For now, create enhanced profiles with realistic data
    // In production, this would integrate with Crunchbase API, LinkedIn API, etc.
    
    const funding = competitor.funding || { stage: 'Unknown', confidence: 'LOW' }
    
    return {
      name: competitor.name || 'Unknown Competitor',
      description: competitor.description || 'Competitive solution in the market',
      website: competitor.website,
      marketShare: competitor.marketShare || {
        description: 'Market share data not available',
        confidence: 'LOW'
      },
      funding,
      pricing: competitor.pricing || {
        model: 'Unknown pricing model',
        range: 'Pricing not publicly available',
        confidence: 'LOW'
      },
      strengths: competitor.strengths || ['Established market presence', 'Customer base'],
      weaknesses: competitor.weaknesses || ['Limited information available'],
      differentiators: competitor.differentiators || ['Market positioning'],
      keyFeatures: ['Core product offering', 'Customer support'],
      lastUpdated: new Date(),
      dataQuality: competitor.dataQuality || 'MEDIUM'
    }
  }

  /**
   * Create basic competitor profile
   */
  private createBasicProfile(competitor: Partial<CompetitorProfile>): CompetitorProfile {
    return {
      name: competitor.name || 'Market Competitor',
      description: competitor.description || 'Existing player in the market space',
      marketShare: { description: 'Market share analysis pending', confidence: 'LOW' },
      funding: { stage: 'Unknown', confidence: 'LOW' },
      pricing: { model: 'Market-rate pricing', range: 'Competitive pricing structure', confidence: 'LOW' },
      strengths: ['Market presence', 'Customer relationships'],
      weaknesses: ['Limited differentiation', 'Market saturation risk'],
      differentiators: ['Established operations'],
      keyFeatures: ['Core service offering'],
      lastUpdated: new Date(),
      dataQuality: 'LOW'
    }
  }

  /**
   * Analyze competitive landscape
   */
  private analyzeCompetitiveLandscape(
    competitors: CompetitorProfile[], 
    businessIdea: string, 
    businessType: string
  ): CompetitorAnalysis {
    
    // Categorize competitors
    const marketLeaders = competitors.filter(c => 
      c.funding?.stage === 'Public' || 
      (c.funding?.totalRaised && c.funding.totalRaised > 100000000)
    )
    
    const emergingPlayers = competitors.filter(c => 
      c.funding?.stage === 'Series A' || c.funding?.stage === 'Series B'
    )
    
    const directCompetitors = competitors.filter(c => 
      c.description.toLowerCase().includes(businessType.toLowerCase()) ||
      this.calculateSimilarity(c.description, businessIdea) > 0.6
    )
    
    const indirectCompetitors = competitors.filter(c => !directCompetitors.includes(c))
    
    // Analyze pricing
    const pricingData = competitors.filter(c => c.pricing?.confidence !== 'LOW')
    const avgPrice = this.calculateAveragePricing(pricingData)
    
    return {
      industry: businessType,
      totalCompetitors: competitors.length,
      marketLeaders: marketLeaders.slice(0, 3),
      emergingPlayers: emergingPlayers.slice(0, 3),
      directCompetitors: directCompetitors.slice(0, 4),
      indirectCompetitors: indirectCompetitors.slice(0, 3),
      competitiveGaps: this.identifyMarketGaps(competitors, businessIdea),
      marketOpportunities: this.identifyOpportunities(competitors, businessIdea),
      threatLevel: this.assessThreatLevel(competitors),
      competitiveLandscape: {
        fragmented: competitors.length > 5 && marketLeaders.length < 2,
        dominated: marketLeaders.length >= 2,
        emerging: emergingPlayers.length > competitors.length * 0.3,
        mature: marketLeaders.length > 0 && competitors.length > 3
      },
      pricingAnalysis: {
        averagePrice: avgPrice,
        priceRange: { min: avgPrice * 0.5, max: avgPrice * 2 },
        dominantModel: this.getDominantPricingModel(competitors),
        pricingTrends: ['Market-rate pricing', 'Subscription models prevalent']
      },
      lastAnalyzed: new Date()
    }
  }

  // Helper methods
  private extractCompanyName(title: string): string {
    // Extract company name from search result title
    const match = title.match(/^([^-|:]+)/)
    return match ? match[1].trim() : title.split(' ').slice(0, 2).join(' ')
  }

  private deduplicateCompetitors(competitors: Partial<CompetitorProfile>[]): Partial<CompetitorProfile>[] {
    const seen = new Set<string>()
    return competitors.filter(comp => {
      const key = comp.name?.toLowerCase() || Math.random().toString()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation
    const words1 = text1.toLowerCase().split(/\s+/)
    const words2 = text2.toLowerCase().split(/\s+/)
    const intersection = words1.filter(word => words2.includes(word))
    return intersection.length / Math.max(words1.length, words2.length)
  }

  private calculateAveragePricing(competitors: CompetitorProfile[]): number {
    // Extract pricing numbers and calculate average
    const prices = competitors.map(c => {
      const range = c.pricing?.range || ''
      const match = range.match(/\$?(\d+(?:\.\d+)?)/g)
      if (match) {
        return parseFloat(match[0].replace('$', ''))
      }
      return 50 // Default fallback
    })
    
    if (prices.length === 0) return 50
    return prices.reduce((sum, price) => sum + price, 0) / prices.length
  }

  private identifyMarketGaps(competitors: CompetitorProfile[], businessIdea: string): string[] {
    return [
      'Underserved customer segments',
      'Pricing gaps in the market',
      'Feature differentiation opportunities',
      'Geographic market gaps'
    ]
  }

  private identifyOpportunities(competitors: CompetitorProfile[], businessIdea: string): string[] {
    return [
      'Market consolidation opportunities',
      'Technology advancement gaps',
      'Customer experience improvements',
      'Niche market specialization'
    ]
  }

  private assessThreatLevel(competitors: CompetitorProfile[]): 'HIGH' | 'MEDIUM' | 'LOW' {
    const strongCompetitors = competitors.filter(c => 
      c.funding?.stage === 'Public' || c.dataQuality === 'HIGH'
    ).length
    
    if (strongCompetitors >= 3) return 'HIGH'
    if (strongCompetitors >= 1) return 'MEDIUM'
    return 'LOW'
  }

  private getDominantPricingModel(competitors: CompetitorProfile[]): string {
    const models = competitors.map(c => c.pricing?.model?.toLowerCase() || 'unknown')
    const modelCounts = models.reduce((acc, model) => {
      acc[model] = (acc[model] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const dominantEntry = Object.entries(modelCounts).sort(([,a], [,b]) => b - a)[0]
    return dominantEntry?.[0] || 'Subscription'
  }
}

export const enhancedCompetitorIntelligence = new EnhancedCompetitorIntelligence()
