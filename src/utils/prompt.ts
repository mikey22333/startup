interface VerifiedFact {
  category: string
  content: string
}

export function detectBusinessType(idea: string, providedType?: string): 'DIGITAL' | 'PHYSICAL/SERVICE' | 'HYBRID' {
  // If user explicitly selected a type, use it
  if (providedType && providedType !== '') {
    return providedType as 'DIGITAL' | 'PHYSICAL/SERVICE' | 'HYBRID'
  }

  // Otherwise, auto-detect from the idea
  const digitalKeywords = [
    'app', 'software', 'website', 'platform', 'digital', 'online', 'saas', 'tech',
    'mobile', 'web', 'ai', 'automation', 'cloud', 'api', 'blockchain', 'cryptocurrency',
    'social media', 'e-commerce', 'marketplace', 'streaming', 'gaming'
  ]
  
  const physicalKeywords = [
    'restaurant', 'store', 'shop', 'cafe', 'gym', 'clinic', 'salon', 'garage',
    'warehouse', 'factory', 'office', 'retail', 'manufacturing', 'construction',
    'real estate', 'transportation', 'logistics', 'food', 'hospitality'
  ]

  const lowerIdea = idea.toLowerCase()
  
  const digitalScore = digitalKeywords.reduce((score, keyword) => 
    lowerIdea.includes(keyword) ? score + 1 : score, 0)
  const physicalScore = physicalKeywords.reduce((score, keyword) => 
    lowerIdea.includes(keyword) ? score + 1 : score, 0)

  if (digitalScore > physicalScore && digitalScore > 0) return 'DIGITAL'
  if (physicalScore > digitalScore && physicalScore > 0) return 'PHYSICAL/SERVICE'
  if (digitalScore > 0 && physicalScore > 0) return 'HYBRID'
  
  return 'PHYSICAL/SERVICE' // default
}

interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
}

export function createAdaptiveSystemPrompt(
  businessType: string,
  verifiedFacts: VerifiedFact[],
  location?: string,
  budget?: string,
  timeline?: string,
  currency?: string,
  marketInsights?: GoogleSearchResult[]
): string {
  const locationContext = location ? `in ${location}` : ''
  const budgetContext = budget ? getBudgetContext(budget, currency) : ''
  const timelineContext = timeline ? getTimelineContext(timeline) : ''
  const currencySymbol = getCurrencySymbol(currency || 'USD')
  
  const verifiedLegalReqs = verifiedFacts
    .filter(fact => fact.category === 'Legal Requirement')
    .map(fact => `- ${fact.content}`)
    .join('\n')

  const verifiedCosts = verifiedFacts
    .filter(fact => fact.category === 'Startup Costs')
    .map(fact => `- ${fact.content}`)
    .join('\n')

  const verifiedTools = verifiedFacts
    .filter(fact => fact.category === 'Business Tools')
    .map(fact => `- ${fact.content}`)
    .join('\n')

  // Format market research insights
  const marketResearch = marketInsights && marketInsights.length > 0 
    ? `\nREAL-TIME MARKET RESEARCH (Use this current data for accurate analysis):
${marketInsights.map(insight => `
• ${insight.title}
  ${insight.snippet}
  Source: ${insight.link}
`).join('')}
` : ''

  return `You are a business consultant. Create a comprehensive business plan using the 8-pillar framework for business success.

CRITICAL: Address ALL 8 areas below for a complete analysis.
${marketResearch ? 'USE THE REAL-TIME MARKET RESEARCH DATA BELOW for accurate competitor analysis, market size, and customer insights.' : ''}

8-PILLAR BUSINESS FRAMEWORK TO ADDRESS:
1. MARKET RESEARCH & DEMAND VALIDATION: Confirm real paying demand, check market size/saturation, map seasonal trends
2. TARGET CUSTOMER CLARITY: Detailed personas, segment by value, find under-served niches
3. VALUE PROPOSITION & DIFFERENTIATION: Clear "Why you?", unique hook, competitive advantage
4. OPERATIONS & DELIVERY: Streamlined fulfillment, SOPs, reliable suppliers/partners
5. MARKETING & SALES: Diversified channels, storytelling, ROI tracking
6. FINANCIAL STRENGTH: Breakeven analysis, cash buffers, pricing optimization
7. RISK & COMPLIANCE: Top 3 risks identified, insurance/protection, legal compliance
8. GROWTH & RETENTION: Loyalty programs, upsell strategies, feedback systems

REQUIRED JSON STRUCTURE (complete and valid):

{
  "summary": "3-4 sentence business overview with market focus and unique value proposition",
  "businessScope": {
    "targetCustomers": "Detailed personas with demographics, pain points, budget, and buying triggers - NOT 'everyone'",
    "competitors": ["Name 2-3 actual competing companies with their key strengths/weaknesses"],
    "growthPotential": "Market size, scalability factors, seasonal trends, and growth timeline",
    "marketReadiness": "Why this solution is needed NOW in 2025 - current market drivers"
  },
  "demandValidation": {
    "validationMethods": ["Pre-order campaign", "Landing page test", "Survey with purchase intent"],
    "marketSize": "TAM/SAM analysis with actual numbers",
    "seasonalTrends": "Peak/low seasons and demand patterns",
    "competitiveLandscape": "Market saturation level and opportunity gaps"
  },
  "valueProposition": {
    "uniqueDifferentiator": "Single clear advantage: cheaper/faster/higher quality/more personalized",
    "competitiveHook": "Signature feature, guarantee, or unique selling point",
    "customerBenefits": ["Specific value delivered to target customers"],
    "pricingStrategy": "How pricing compares to competitors and why"
  },
  "operations": {
    "deliveryProcess": "Step-by-step fulfillment workflow",
    "qualityControl": "SOPs and quality assurance measures", 
    "suppliers": ["Primary supplier", "Backup option 1", "Backup option 2"],
    "scalabilityPlan": "How operations will grow with demand"
  },
  "marketingStrategy": {
    "channels": ["Channel 1", "Channel 2", "Channel 3 - diversified approach"],
    "brandStory": "Compelling narrative that creates emotional connection",
    "customerAcquisitionCost": "Estimated CAC per channel",
    "roiTracking": "Key metrics to measure marketing effectiveness"
  },
  "financialAnalysis": {
    "startupCosts": "${budgetContext || '$10,000-25,000'}",
    "breakEvenPoint": "Units/revenue needed to cover all costs",
    "cashBuffer": "3-6 months expenses reserve amount",
    "pricingElasticity": "Price testing strategy and optimal price point"
  },
  "riskAssessment": {
    "topRisks": ["Risk 1: Market shift", "Risk 2: Supply chain", "Risk 3: Competition"],
    "mitigation": ["Strategy for each risk"],
    "insurance": "Required coverage types",
    "compliance": ["Legal requirements", "Regulations", "Tax obligations"]
  },
  "growthStrategy": {
    "retentionProgram": "Customer loyalty and repeat purchase strategy",
    "upsellOpportunities": ["Additional products/services to offer existing customers"],
    "feedbackLoop": "System for collecting and implementing customer feedback",
    "scalingPlan": "12-month growth roadmap"
  },
  "feasibility": {
    "marketType": "${businessType}",
    "difficultyLevel": "Easy|Moderate|Complex", 
    "estimatedTimeToLaunch": "${timelineContext || '3-6 months'}",
    "estimatedStartupCost": "${budgetContext || '$10,000-25,000'}"
  },
    "difficultyLevel": "Easy|Moderate|Complex", 
    "estimatedTimeToLaunch": "${timelineContext || '3-6 months'}",
    "estimatedStartupCost": "${budgetContext || '$10,000-25,000'}"
  },
  "actionPlan": [
    {
      "stepName": "Market Research & Demand Validation",
      "phase": "Validation",
      "description": "Run small-scale tests (ads, landing pages, pre-orders) to confirm paying demand. Use Google Trends for seasonal patterns.",
      "recommendedTools": ["Google Trends", "Landing page builder", "Survey tools", "Facebook Ads"],
      "estimatedTime": "2-3 weeks",
      "estimatedCost": "$200-800",
      "responsibleRole": "Founder",
      "deliverables": ["Market validation report", "Customer personas", "Demand forecast"]
    },
    {
      "stepName": "Value Proposition Development",
      "phase": "Strategy",
      "description": "Define clear differentiation, create compelling hook, test against top 3 competitors",
      "recommendedTools": ["Competitor analysis tools", "Value proposition canvas"],
      "estimatedTime": "1-2 weeks",
      "estimatedCost": "$100-300",
      "responsibleRole": "Founder",
      "deliverables": ["Value proposition statement", "Competitive analysis", "Pricing strategy"]
    },
    {
      "stepName": "Business Setup & Compliance",
      "phase": "Legal Foundation", 
      "description": "Register business, secure permits, set up legal structure, identify insurance needs",
      "recommendedTools": ["LegalZoom", "State business portal", "Insurance broker"],
      "estimatedTime": "1-2 weeks",
      "estimatedCost": "$300-1,200",
      "responsibleRole": "Founder",
      "deliverables": ["Business registration", "Permits", "Insurance coverage"]
    },
    {
      "stepName": "Operations & Supply Chain Setup",
      "phase": "Development",
      "description": "Create SOPs, secure 2+ suppliers, design quality control processes, plan scalability",
      "recommendedTools": ["Process mapping software", "Supplier databases", "Quality management tools"],
      "estimatedTime": "3-4 weeks", 
      "estimatedCost": "$500-2,000",
      "responsibleRole": "Founder/Operations",
      "deliverables": ["Operations manual", "Supplier agreements", "Quality standards"]
    },
    {
      "stepName": "Product/Service Development & Testing",
      "phase": "Development",
      "description": "Build MVP, implement feedback loops, test with real customers, refine offering",
      "recommendedTools": ["Development platforms", "Testing tools", "Feedback systems"],
      "estimatedTime": "4-8 weeks",
      "estimatedCost": "$1,000-5,000",
      "responsibleRole": "Founder/Developer",
      "deliverables": ["Working MVP", "User testing results", "Product refinements"]
    },
    {
      "stepName": "Multi-Channel Marketing Launch",
      "phase": "Launch",
      "description": "Execute diversified marketing across 3+ channels, track ROI, tell compelling brand story",
      "recommendedTools": ["Google Ads", "Social media platforms", "Analytics tools", "CRM"],
      "estimatedTime": "2-4 weeks",
      "estimatedCost": "$1,000-3,000", 
      "responsibleRole": "Founder/Marketer",
      "deliverables": ["Campaign results", "Customer acquisition metrics", "Brand assets"]
    },
    {
      "stepName": "Financial Optimization & Risk Management",
      "phase": "Optimization",
      "description": "Establish breakeven tracking, build cash reserves, test pricing elasticity, implement risk controls",
      "recommendedTools": ["Accounting software", "Financial modeling tools", "Risk assessment frameworks"],
      "estimatedTime": "2-3 weeks",
      "estimatedCost": "$300-800",
      "responsibleRole": "Founder/CFO",
      "deliverables": ["Financial dashboard", "Cash flow forecast", "Risk mitigation plan"]
    },
    {
      "stepName": "Growth Systems & Retention",
      "phase": "Scale",
      "description": "Launch loyalty program, develop upsell strategies, systematize feedback collection, plan expansion",
      "recommendedTools": ["Loyalty platform", "Customer success tools", "Growth analytics"],
      "estimatedTime": "Ongoing",
      "estimatedCost": "$500-1,500/month",
      "responsibleRole": "Founder/Growth",
      "deliverables": ["Retention metrics", "Growth roadmap", "Customer success program"]
    }
  ],
  "resources": [
    {
      "name": "Resource name",
      "description": "What it provides",
      "link": "https://example.com",
      "type": "GOVERNMENT"
    }
  ]
}

VERIFIED INDUSTRY DATA TO INCORPORATE:
${verifiedLegalReqs ? `Legal Requirements:\n${verifiedLegalReqs}` : ''}
${verifiedTools ? `Recommended Tools:\n${verifiedTools}` : ''}
${verifiedCosts ? `Industry Costs:\n${verifiedCosts}` : ''}
${marketResearch}

MANDATORY REQUIREMENTS (Address ALL 8 pillars):
1. DEMAND VALIDATION: Include specific tests (landing page, pre-orders, surveys with purchase intent) 
2. TARGET CUSTOMERS: Detailed personas with demographics, job titles, budgets, pain points - NOT "everyone"
3. VALUE PROPOSITION: Single clear differentiator (cheaper/faster/better) + unique hook/guarantee
4. OPERATIONS: Streamlined process + 2+ backup suppliers + SOPs + scalability plan
5. MARKETING: 3+ diversified channels + brand story + ROI tracking methods
6. FINANCIALS: Exact breakeven point + cash buffer amount + pricing elasticity strategy  
7. RISK MANAGEMENT: Top 3 specific risks + mitigation strategies + compliance requirements
8. GROWTH SYSTEMS: Retention program + upsell opportunities + feedback collection system

ANALYSIS REQUIREMENTS:
- Use real market research data when available for competitor analysis and market sizing
- Focus on 2025 market conditions: AI adoption, digital transformation, economic factors
- Avoid outdated pandemic references - use current market drivers and timing
- Name actual competing companies and their specific strengths/weaknesses
- Provide actionable, measurable strategies for each pillar

CURRENT DATE: August 2025 - Use current market context and opportunities.

Keep responses comprehensive but concise. Ensure valid JSON format covering all 8 business pillars.`
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
    'SGD': 'S$'
  }
  return currencySymbols[currency] || '$'
}

function getBudgetContext(budget: string, currency?: string): string {
  const currencySymbol = getCurrencySymbol(currency || 'USD')
  const budgetRanges: Record<string, string> = {
    'under-5k': `Under ${currencySymbol}5,000 budget - focus on minimal viable approach`,
    '5k-10k': `${currencySymbol}5,000-${currencySymbol}10,000 budget - lean startup approach`,
    '10k-25k': `${currencySymbol}10,000-${currencySymbol}25,000 budget - moderate investment approach`, 
    '25k-50k': `${currencySymbol}25,000-${currencySymbol}50,000 budget - solid foundation approach`,
    '50k-100k': `${currencySymbol}50,000-${currencySymbol}100,000 budget - comprehensive setup approach`,
    '100k-250k': `${currencySymbol}100,000-${currencySymbol}250,000 budget - well-funded launch approach`,
    '250k+': `${currencySymbol}250,000+ budget - premium launch approach`
  }
  return budgetRanges[budget] || budget
}

function getTimelineContext(timeline: string): string {
  const timelineRanges: Record<string, string> = {
    '1-month': '1 month - aggressive rapid launch',
    '2-3-months': '2-3 months - quick market entry',
    '3-6-months': '3-6 months - balanced preparation',
    '6-12-months': '6-12 months - thorough preparation',
    '12-months+': '12+ months - comprehensive development'
  }
  return timelineRanges[timeline] || timeline
}

function getBudgetMarketingRange(budget: string, currency?: string): string {
  const currencySymbol = getCurrencySymbol(currency || 'USD')
  const marketingBudgets: Record<string, string> = {
    'under-5k': `${currencySymbol}200-500/month`,
    '5k-10k': `${currencySymbol}300-800/month`,
    '10k-25k': `${currencySymbol}500-1,500/month`,
    '25k-50k': `${currencySymbol}1,000-3,000/month`,
    '50k-100k': `${currencySymbol}2,000-5,000/month`,
    '100k-250k': `${currencySymbol}3,000-8,000/month`,
    '250k+': `${currencySymbol}5,000-15,000/month`
  }
  return marketingBudgets[budget] || `${currencySymbol}500-2,000/month`
}
