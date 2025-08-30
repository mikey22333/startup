import { BusinessPlan } from '@/lib/exportService'

interface CompetitorData {
  name: string
  description: string
  strengths: string[]
  weaknesses: string[]
  marketShare?: number
  fundingRaised?: number
  employees?: number
  foundedYear?: number
  website?: string
  confidence: number // 0-1 confidence in data accuracy
}

interface CompetitiveAnalysis {
  directCompetitors: CompetitorData[]
  indirectCompetitors: CompetitorData[]
  marketGaps: string[]
  competitiveAdvantages: string[]
  threats: string[]
  opportunities: string[]
}

interface MarketIntelligence {
  marketSize: number
  growthRate: number
  keyTrends: string[]
  barriers: string[]
  successFactors: string[]
}

export async function enhanceCompetitorIntelligence(plan: BusinessPlan): Promise<CompetitiveAnalysis> {
  try {
    const businessType = extractBusinessType(plan.executiveSummary)
    const marketAnalysisText = typeof plan.marketAnalysis === 'string' ? plan.marketAnalysis : JSON.stringify(plan.marketAnalysis) || ''
    const targetMarket = extractTargetMarket(marketAnalysisText || plan.executiveSummary)
    
    // Discover competitors using multiple methods
    const discoveredCompetitors = await discoverCompetitors(businessType, targetMarket, plan.executiveSummary)
    
    // Categorize competitors
    const { directCompetitors, indirectCompetitors } = categorizeCompetitors(discoveredCompetitors, plan.executiveSummary)
    
    // Analyze competitive landscape
    const analysis = analyzeCompetitiveLandscape(directCompetitors, indirectCompetitors, plan)
    
    return {
      directCompetitors,
      indirectCompetitors,
      marketGaps: analysis.gaps,
      competitiveAdvantages: analysis.advantages,
      threats: analysis.threats,
      opportunities: analysis.opportunities
    }
  } catch (error) {
    console.error('Error enhancing competitor intelligence:', error)
    return {
      directCompetitors: [],
      indirectCompetitors: [],
      marketGaps: ['Market analysis data temporarily unavailable'],
      competitiveAdvantages: ['Unique value proposition to be determined'],
      threats: ['Competitive landscape analysis pending'],
      opportunities: ['Market opportunity assessment in progress']
    }
  }
}

function extractBusinessType(businessIdea: string): string {
  const idea = businessIdea.toLowerCase()
  
  // Technology categories
  if (idea.includes('ai') || idea.includes('artificial intelligence')) return 'ai-technology'
  if (idea.includes('fintech') || idea.includes('financial technology')) return 'fintech'
  if (idea.includes('ecommerce') || idea.includes('e-commerce')) return 'ecommerce'
  if (idea.includes('saas') || idea.includes('software as a service')) return 'saas'
  if (idea.includes('mobile app') || idea.includes('app')) return 'mobile-app'
  if (idea.includes('platform')) return 'platform'
  
  // Industry categories
  if (idea.includes('healthcare') || idea.includes('medical')) return 'healthcare'
  if (idea.includes('education') || idea.includes('learning')) return 'education'
  if (idea.includes('retail') || idea.includes('commerce')) return 'retail'
  if (idea.includes('food') || idea.includes('restaurant')) return 'food-service'
  if (idea.includes('transport') || idea.includes('logistics')) return 'transportation'
  
  return 'general-business'
}

function extractTargetMarket(description: string): string {
  const text = description.toLowerCase()
  
  // Demographic targets
  if (text.includes('small business') || text.includes('sme')) return 'small-business'
  if (text.includes('enterprise') || text.includes('large companies')) return 'enterprise'
  if (text.includes('consumer') || text.includes('individual')) return 'consumer'
  if (text.includes('student') || text.includes('education')) return 'education'
  if (text.includes('startup') || text.includes('entrepreneur')) return 'startup'
  
  // Geographic targets
  if (text.includes('global') || text.includes('worldwide')) return 'global'
  if (text.includes('local') || text.includes('neighborhood')) return 'local'
  
  return 'general-market'
}

async function discoverCompetitors(businessType: string, targetMarket: string, businessIdea: string): Promise<CompetitorData[]> {
  const competitors: CompetitorData[] = []
  
  // Add known competitors based on business type and market
  const knownCompetitors = getKnownCompetitors(businessType, targetMarket)
  competitors.push(...knownCompetitors)
  
  // Enhance with real-time data if possible
  try {
    const enhancedCompetitors = await Promise.all(
      competitors.map(competitor => enrichCompetitorData(competitor))
    )
    return enhancedCompetitors
  } catch (error) {
    console.error('Error enriching competitor data:', error)
    return competitors
  }
}

function getKnownCompetitors(businessType: string, targetMarket: string): CompetitorData[] {
  const competitorDatabase: Record<string, CompetitorData[]> = {
    'ai-technology': [
      {
        name: 'OpenAI',
        description: 'Leading AI research and deployment company',
        strengths: ['Advanced AI models', 'Strong brand recognition', 'Developer ecosystem'],
        weaknesses: ['High costs', 'API dependency', 'Limited customization'],
        marketShare: 0.25,
        confidence: 0.9
      },
      {
        name: 'Anthropic',
        description: 'AI safety-focused research company',
        strengths: ['Safety focus', 'Constitutional AI', 'Research backing'],
        weaknesses: ['Newer entrant', 'Limited market presence', 'Smaller model selection'],
        confidence: 0.8
      }
    ],
    'fintech': [
      {
        name: 'Stripe',
        description: 'Payment processing platform',
        strengths: ['Developer-friendly', 'Global reach', 'Comprehensive APIs'],
        weaknesses: ['Transaction fees', 'Complex pricing', 'Account holds'],
        marketShare: 0.15,
        confidence: 0.9
      },
      {
        name: 'Square',
        description: 'Point-of-sale and payment solutions',
        strengths: ['Hardware integration', 'Small business focus', 'Easy setup'],
        weaknesses: ['Limited enterprise features', 'Geographic restrictions'],
        confidence: 0.85
      }
    ],
    'ecommerce': [
      {
        name: 'Shopify',
        description: 'E-commerce platform for businesses',
        strengths: ['Easy setup', 'App ecosystem', 'Scalability'],
        weaknesses: ['Transaction fees', 'Limited customization', 'App dependency'],
        marketShare: 0.10,
        confidence: 0.9
      },
      {
        name: 'WooCommerce',
        description: 'WordPress e-commerce plugin',
        strengths: ['Open source', 'Customizable', 'Large community'],
        weaknesses: ['Technical complexity', 'Security responsibility', 'Performance issues'],
        confidence: 0.8
      }
    ],
    'saas': [
      {
        name: 'Salesforce',
        description: 'Customer relationship management platform',
        strengths: ['Market leader', 'Comprehensive features', 'Integration ecosystem'],
        weaknesses: ['Complex interface', 'High costs', 'Over-engineering'],
        marketShare: 0.20,
        confidence: 0.9
      }
    ],
    'healthcare': [
      {
        name: 'Epic Systems',
        description: 'Electronic health records system',
        strengths: ['Hospital market leader', 'Comprehensive platform', 'Integration capabilities'],
        weaknesses: ['High implementation costs', 'Complex user interface', 'Vendor lock-in'],
        confidence: 0.85
      }
    ]
  }
  
  return competitorDatabase[businessType] || [
    {
      name: 'Market Leader TBD',
      description: 'Established player in the market space',
      strengths: ['Market presence', 'Brand recognition', 'Resource advantage'],
      weaknesses: ['Legacy systems', 'Slower innovation', 'Higher costs'],
      confidence: 0.6
    }
  ]
}

async function enrichCompetitorData(competitor: CompetitorData): Promise<CompetitorData> {
  // In a real implementation, this would call external APIs
  // For now, we'll simulate data enrichment
  try {
    const enrichedData = await enrichSingleCompetitor(competitor)
    return {
      ...competitor,
      ...enrichedData,
      confidence: Math.min(competitor.confidence + 0.1, 1.0)
    }
  } catch (error) {
    return competitor
  }
}

async function enrichSingleCompetitor(competitor: CompetitorData): Promise<Partial<CompetitorData>> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Return simulated enriched data
  return {
    employees: Math.floor(Math.random() * 10000) + 100,
    foundedYear: Math.floor(Math.random() * 20) + 2005,
    fundingRaised: Math.floor(Math.random() * 500000000) + 1000000
  }
}

function categorizeCompetitors(competitors: CompetitorData[], businessIdea: string): {
  directCompetitors: CompetitorData[]
  indirectCompetitors: CompetitorData[]
} {
  const ideaKeywords = extractKeywords(businessIdea)
  
  const directCompetitors = competitors.filter(competitor => {
    const competitorKeywords = extractKeywords(competitor.description)
    const overlap = ideaKeywords.filter(keyword => 
      competitorKeywords.some(ck => ck.includes(keyword) || keyword.includes(ck))
    ).length
    return overlap >= 2 // High keyword overlap = direct competitor
  })
  
  const indirectCompetitors = competitors.filter(competitor => 
    !directCompetitors.includes(competitor)
  )
  
  return { directCompetitors, indirectCompetitors }
}

function extractKeywords(text: string): string[] {
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall', 'a', 'an']
  
  return text.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .slice(0, 10) // Top 10 keywords
}

function analyzeCompetitiveLandscape(
  directCompetitors: CompetitorData[], 
  indirectCompetitors: CompetitorData[], 
  plan: BusinessPlan
): {
  gaps: string[]
  advantages: string[]
  threats: string[]
  opportunities: string[]
} {
  const allCompetitors = [...directCompetitors, ...indirectCompetitors]
  
  // Identify market gaps
  const gaps = identifyMarketGaps(allCompetitors, plan)
  
  // Determine competitive advantages
  const advantages = identifyCompetitiveAdvantages(allCompetitors, plan)
  
  // Assess threats
  const threats = assessThreats(directCompetitors)
  
  // Find opportunities
  const opportunities = findOpportunities(allCompetitors, plan)
  
  return { gaps, advantages, threats, opportunities }
}

function identifyMarketGaps(competitors: CompetitorData[], plan: BusinessPlan): string[] {
  if (!competitors || competitors.length === 0) {
    return [
      'First-mover advantage in underexplored market',
      'Opportunity to establish market standards',
      'Potential for innovative approach without direct competition'
    ]
  }

  const validCompetitors = competitors.filter(c => c.weaknesses && Array.isArray(c.weaknesses))
  if (validCompetitors.length === 0) {
    return [
      'Opportunity for more user-friendly solutions',
      'Potential for cost-effective alternatives',
      'Room for specialized niche offerings'
    ]
  }

  const commonWeaknesses = validCompetitors.flatMap(c => c.weaknesses)
  const weaknessFrequency = commonWeaknesses.reduce((acc, weakness) => {
    acc[weakness] = (acc[weakness] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const significantGaps = Object.entries(weaknessFrequency)
    .filter(([_, count]) => count >= 2)
    .map(([weakness, _]) => `Market gap in addressing: ${weakness}`)
  
  return significantGaps.length > 0 ? significantGaps : [
    'Opportunity for more user-friendly solutions',
    'Potential for cost-effective alternatives',
    'Room for specialized niche offerings'
  ]
}

function identifyCompetitiveAdvantages(competitors: CompetitorData[], plan: BusinessPlan): string[] {
  const advantages = []
  
  // Check for unique positioning
  const businessDescription = plan.executiveSummary.toLowerCase()
  if (businessDescription.includes('ai') && !competitors.some(c => c.description.toLowerCase().includes('ai'))) {
    advantages.push('AI-powered solution in traditional market')
  }
  
  if (businessDescription.includes('affordable') || businessDescription.includes('cost-effective')) {
    advantages.push('Cost-competitive positioning')
  }
  
  if (businessDescription.includes('small business') || businessDescription.includes('sme')) {
    advantages.push('Focused on underserved small business market')
  }
  
  // Default advantages if none identified
  if (advantages.length === 0) {
    advantages.push(
      'Fresh perspective on established market',
      'Opportunity for modern technology stack',
      'Potential for superior user experience'
    )
  }
  
  return advantages
}

function assessThreats(directCompetitors: CompetitorData[]): string[] {
  const threats = []
  
  const establishedCompetitors = directCompetitors.filter(c => (c.marketShare || 0) > 0.1)
  if (establishedCompetitors.length > 0) {
    threats.push('Established competitors with significant market share')
  }
  
  const wellFundedCompetitors = directCompetitors.filter(c => (c.fundingRaised || 0) > 50000000)
  if (wellFundedCompetitors.length > 0) {
    threats.push('Well-funded competitors with resources for rapid scaling')
  }
  
  if (directCompetitors.length > 5) {
    threats.push('Highly competitive market with many players')
  }
  
  // Default threats if none identified
  if (threats.length === 0) {
    threats.push(
      'Potential for new entrants in growing market',
      'Risk of larger companies entering the space',
      'Technology disruption from unexpected sources'
    )
  }
  
  return threats
}

function findOpportunities(competitors: CompetitorData[], plan: BusinessPlan): string[] {
  const opportunities = []
  
  // Check for market consolidation opportunities
  if (competitors.length < 3) {
    opportunities.push('Limited competition allows for market share capture')
  }
  
  // Look for geographic expansion opportunities
  const globalCompetitors = competitors.filter(c => 
    c.description.toLowerCase().includes('global') || 
    c.description.toLowerCase().includes('worldwide')
  )
  if (globalCompetitors.length === 0) {
    opportunities.push('Opportunity for international expansion')
  }
  
  // Technology advancement opportunities
  const techFocusedCompetitors = competitors.filter(c =>
    c.strengths.some(s => s.toLowerCase().includes('technology') || s.toLowerCase().includes('innovation'))
  )
  if (techFocusedCompetitors.length < competitors.length * 0.5) {
    opportunities.push('Room for technological innovation and disruption')
  }
  
  // Default opportunities
  if (opportunities.length === 0) {
    opportunities.push(
      'Growing market with increasing demand',
      'Potential for strategic partnerships',
      'Opportunity to define new market standards'
    )
  }
  
  return opportunities
}
