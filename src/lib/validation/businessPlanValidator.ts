import { BusinessPlan } from '@/lib/exportService'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  score: number // 0-100 quality score
}

interface FinancialValidation {
  revenueConsistency: boolean
  expenseRealism: boolean
  profitabilityLogic: boolean
  marketSizeAlignment: boolean
}

interface MarketValidation {
  targetMarketClarity: boolean
  competitiveAnalysisDepth: boolean
  marketSizeRealistic: boolean
  growthAssumptions: boolean
}

export function validateBusinessPlan(plan: BusinessPlan): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []
  
  try {
    // Validate core sections
    const coreValidation = validateCoreSections(plan)
    errors.push(...coreValidation.errors)
    warnings.push(...coreValidation.warnings)
    
    // Validate financial model
    const financialValidation = validateFinancialModel(plan)
    errors.push(...financialValidation.errors)
    warnings.push(...financialValidation.warnings)
    
    // Validate market analysis
    const marketValidation = validateMarketAnalysis(plan)
    errors.push(...marketValidation.errors)
    warnings.push(...marketValidation.warnings)
    
    // Check data consistency
    const consistencyValidation = validateDataConsistency(plan)
    errors.push(...consistencyValidation.errors)
    warnings.push(...consistencyValidation.warnings)
    
    // Generate improvement suggestions
    const improvementSuggestions = generateImprovementSuggestions(plan)
    suggestions.push(...improvementSuggestions)
    
    // Calculate overall quality score
    const score = calculateQualityScore(plan, errors.length, warnings.length)
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score
    }
  } catch (error) {
    console.error('Error validating business plan:', error)
    return {
      isValid: false,
      errors: ['Validation process encountered an unexpected error'],
      warnings: [],
      suggestions: ['Please review the business plan format and try again'],
      score: 0
    }
  }
}

function validateCoreSections(plan: BusinessPlan): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check required sections
  if (!plan.executiveSummary || plan.executiveSummary.length < 100) {
    errors.push('Executive summary is missing or too short (minimum 100 characters)')
  }
  
  if (!plan.marketAnalysis || plan.marketAnalysis.length < 200) {
    errors.push('Market analysis is insufficient (minimum 200 characters)')
  }
  
  if (!plan.businessModel || plan.businessModel.length < 150) {
    errors.push('Business model description is incomplete (minimum 150 characters)')
  }
  
  if (!plan.financialProjections || plan.financialProjections.length < 100) {
    errors.push('Financial projections are missing or incomplete')
  }
  
  // Check section quality
  if (plan.marketingStrategy && plan.marketingStrategy.length < 200) {
    warnings.push('Marketing strategy could be more detailed')
  }
  
  if (plan.riskAssessment && (!plan.riskAssessment.risks || plan.riskAssessment.risks.length < 3)) {
    warnings.push('Risk assessment should identify more potential risks')
  }
  
  return { errors, warnings }
}

function validateFinancialModel(plan: BusinessPlan): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    // Extract financial data from projections text
    const financialData = extractFinancialData(plan.financialProjections)
    
    // Validate revenue projections
    if (financialData.revenues.length === 0) {
      errors.push('No revenue projections found in financial section')
    } else {
      const revenueValidation = validateRevenueProjections(financialData.revenues)
      errors.push(...revenueValidation.errors)
      warnings.push(...revenueValidation.warnings)
    }
    
    // Validate expense projections
    if (financialData.expenses.length === 0) {
      warnings.push('Expense projections not clearly defined')
    } else {
      const expenseValidation = validateExpenseProjections(financialData.expenses, financialData.revenues)
      warnings.push(...expenseValidation.warnings)
    }
    
    // Check investment requirements
    if (plan.feasibility && plan.feasibility.investmentNeeded) {
      const investmentValidation = validateInvestmentRequirements(plan.feasibility.investmentNeeded, financialData)
      warnings.push(...investmentValidation.warnings)
    }
    
  } catch (error) {
    warnings.push('Financial data format could not be fully validated')
  }
  
  return { errors, warnings }
}

function extractFinancialData(financialProjections: string): {
  revenues: number[]
  expenses: number[]
  profits: number[]
} {
  const revenues: number[] = []
  const expenses: number[] = []
  const profits: number[] = []
  
  // Extract numbers that look like financial figures
  const numberPattern = /\$?[\d,]+(?:\.\d{2})?/g
  const matches = financialProjections.match(numberPattern) || []
  
  // Simple heuristic: first numbers are likely revenues
  matches.forEach((match, index) => {
    const value = parseInt(match.replace(/[\$,]/g, ''))
    if (value > 1000) { // Filter out small numbers that might not be financial
      if (index < matches.length / 3) {
        revenues.push(value)
      } else if (index < 2 * matches.length / 3) {
        expenses.push(value)
      } else {
        profits.push(value)
      }
    }
  })
  
  return { revenues, expenses, profits }
}

function validateRevenueProjections(revenues: number[]): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (revenues.length < 3) {
    warnings.push('Revenue projections should cover at least 3 years')
  }
  
  // Check for unrealistic growth
  for (let i = 1; i < revenues.length; i++) {
    const growthRate = (revenues[i] - revenues[i-1]) / revenues[i-1]
    if (growthRate > 5) { // 500% growth
      warnings.push(`Year ${i+1} shows unrealistic revenue growth (${Math.round(growthRate * 100)}%)`)
    }
    if (growthRate < -0.5) { // 50% decline
      warnings.push(`Year ${i+1} shows concerning revenue decline`)
    }
  }
  
  // Check for zero or negative revenues
  revenues.forEach((revenue, index) => {
    if (revenue <= 0) {
      errors.push(`Year ${index + 1} shows zero or negative revenue`)
    }
  })
  
  return { errors, warnings }
}

function validateExpenseProjections(expenses: number[], revenues: number[]): { warnings: string[] } {
  const warnings: string[] = []
  
  // Check expense-to-revenue ratios
  expenses.forEach((expense, index) => {
    if (revenues[index]) {
      const ratio = expense / revenues[index]
      if (ratio > 0.9) {
        warnings.push(`Year ${index + 1}: Expenses are ${Math.round(ratio * 100)}% of revenue - profitability concern`)
      }
      if (ratio < 0.3) {
        warnings.push(`Year ${index + 1}: Expenses seem too low at ${Math.round(ratio * 100)}% of revenue`)
      }
    }
  })
  
  return { warnings }
}

function validateInvestmentRequirements(investmentNeeded: string, financialData: any): { warnings: string[] } {
  const warnings: string[] = []
  
  // Extract investment amount
  const investmentMatch = investmentNeeded.match(/\$?[\d,]+/)
  if (investmentMatch) {
    const investment = parseInt(investmentMatch[0].replace(/[\$,]/g, ''))
    const firstYearRevenue = financialData.revenues[0] || 0
    
    if (investment > firstYearRevenue * 2) {
      warnings.push('Investment requirement seems high relative to projected first-year revenue')
    }
    
    if (investment < firstYearRevenue * 0.1) {
      warnings.push('Investment requirement might be underestimated')
    }
  }
  
  return { warnings }
}

function validateMarketAnalysis(plan: BusinessPlan): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check market size mentions
  if (plan.marketAnalysis && typeof plan.marketAnalysis === 'string') {
    const marketText = plan.marketAnalysis.toLowerCase()
    if (!marketText.includes('market size') && !marketText.includes('market value') && !marketText.includes('billion') && !marketText.includes('million')) {
      warnings.push('Market analysis should include market size estimates')
    }
    
    // Check for competitor analysis
    if (!marketText.includes('competitor') && !marketText.includes('competition')) {
      warnings.push('Market analysis should include competitive landscape')
    }
    
    // Check for target market definition
    if (!marketText.includes('target') && !marketText.includes('customer') && !marketText.includes('audience')) {
      warnings.push('Target market definition could be clearer')
    }
    
    // Check for growth trends
    if (!marketText.includes('growth') && !marketText.includes('trend') && !marketText.includes('opportunity')) {
      warnings.push('Market growth trends and opportunities should be discussed')
    }
  } else {
    warnings.push('Market analysis should be provided as text content')
  }
  
  return { errors, warnings }
}

function validateDataConsistency(plan: BusinessPlan): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check consistency between executive summary and detailed sections
  const execSummary = plan.executiveSummary.toLowerCase()
  const marketAnalysis = typeof plan.marketAnalysis === 'string' ? plan.marketAnalysis.toLowerCase() : ''
  
  // Look for contradictions in market positioning
  if (execSummary.includes('b2b') && marketAnalysis.includes('consumer')) {
    warnings.push('Potential inconsistency between B2B focus in summary and consumer market in analysis')
  }
  
  if (execSummary.includes('enterprise') && marketAnalysis.includes('small business')) {
    warnings.push('Target market inconsistency between enterprise and small business focus')
  }
  
  // Check timeline consistency
  const timelineInSummary = extractTimeline(execSummary)
  const implementationText = typeof plan.implementation === 'string' ? plan.implementation : ''
  const timelineInImplementation = extractTimeline(implementationText)
  
  if (timelineInSummary && timelineInImplementation && Math.abs(timelineInSummary - timelineInImplementation) > 6) {
    warnings.push('Timeline inconsistency between executive summary and implementation plan')
  }
  
  return { errors, warnings }
}

function extractTimeline(text: string): number | null {
  const monthsMatch = text.match(/(\d+)\s*months?/)
  if (monthsMatch) return parseInt(monthsMatch[1])
  
  const yearsMatch = text.match(/(\d+)\s*years?/)
  if (yearsMatch) return parseInt(yearsMatch[1]) * 12
  
  return null
}

function generateImprovementSuggestions(plan: BusinessPlan): string[] {
  const suggestions: string[] = []
  
  // Suggest improvements based on content analysis
  const allText = `${plan.executiveSummary} ${plan.marketAnalysis} ${plan.businessModel}`.toLowerCase()
  
  if (!allText.includes('unique') && !allText.includes('differentiat')) {
    suggestions.push('Consider highlighting unique selling propositions and competitive differentiators')
  }
  
  if (!allText.includes('scalab') && !allText.includes('growth')) {
    suggestions.push('Include discussion of scalability and growth strategies')
  }
  
  if (!allText.includes('risk') && !allText.includes('challenge')) {
    suggestions.push('Add comprehensive risk assessment and mitigation strategies')
  }
  
  if (!allText.includes('team') && !allText.includes('founder')) {
    suggestions.push('Include information about the founding team and key personnel')
  }
  
  if (!allText.includes('technology') && !allText.includes('innovation')) {
    suggestions.push('Consider discussing technology stack and innovation aspects')
  }
  
  // Financial suggestions
  if (!plan.financialProjections.includes('cash flow')) {
    suggestions.push('Add detailed cash flow projections to financial section')
  }
  
  const marketingText = typeof plan.marketingStrategy === 'string' ? plan.marketingStrategy.toLowerCase() : ''
  if (marketingText && !marketingText.includes('customer acquisition cost') && !marketingText.includes('cac')) {
    suggestions.push('Include customer acquisition cost analysis in marketing strategy')
  }
  
  return suggestions
}

function calculateQualityScore(plan: BusinessPlan, errorCount: number, warningCount: number): number {
  let score = 100
  
  // Deduct points for errors and warnings
  score -= errorCount * 15 // Errors are more serious
  score -= warningCount * 5
  
  // Add points for comprehensiveness
  const sections = [
    plan.executiveSummary,
    plan.marketAnalysis,
    plan.businessModel,
    plan.financialProjections,
    plan.marketingStrategy,
    plan.operationsOverview,
    plan.implementation
  ]
  
  const completedSections = sections.filter(section => 
    section && typeof section === 'string' && section.length > 100
  ).length
  score += completedSections * 2
  
  // Add points for detailed content
  const stringifiedSections = sections.map(section => 
    typeof section === 'string' ? section : JSON.stringify(section) || ''
  )
  const totalLength = stringifiedSections.join('').length
  if (totalLength > 5000) score += 10
  if (totalLength > 10000) score += 10
  
  // Check for specific quality indicators
  const allText = sections.join(' ').toLowerCase()
  if (allText.includes('market research')) score += 5
  if (allText.includes('competitive analysis')) score += 5
  if (allText.includes('financial model')) score += 5
  if (allText.includes('go-to-market')) score += 5
  
  return Math.max(0, Math.min(100, score))
}

export function autoCorrectBusinessPlan(plan: BusinessPlan, validationResult: ValidationResult): BusinessPlan {
  const correctedPlan = { ...plan }
  
  try {
    // Auto-fix common issues
    validationResult.errors.forEach(error => {
      if (error.includes('Executive summary is missing or too short')) {
        if (!correctedPlan.executiveSummary || correctedPlan.executiveSummary.length < 100) {
          correctedPlan.executiveSummary = generateExecutiveSummaryFromOtherSections(correctedPlan)
        }
      }
      
      if (error.includes('Market analysis is insufficient')) {
        const marketAnalysisText = typeof correctedPlan.marketAnalysis === 'string' ? correctedPlan.marketAnalysis : ''
        if (!marketAnalysisText || marketAnalysisText.length < 200) {
          correctedPlan.marketAnalysis = enhanceMarketAnalysis(marketAnalysisText, correctedPlan)
        }
      }
    })
    
    return correctedPlan
  } catch (error) {
    console.error('Error auto-correcting business plan:', error)
    return plan // Return original if correction fails
  }
}

function generateExecutiveSummaryFromOtherSections(plan: BusinessPlan): string {
  const businessModel = typeof plan.businessModel === 'string' ? plan.businessModel : JSON.stringify(plan.businessModel) || ''
  const marketAnalysis = typeof plan.marketAnalysis === 'string' ? plan.marketAnalysis : JSON.stringify(plan.marketAnalysis) || ''
  
  const businessModelPreview = businessModel.substring(0, 200)
  const marketAnalysisPreview = marketAnalysis.substring(0, 200)
  
  return `Executive Summary: ${businessModelPreview}... ${marketAnalysisPreview}... This business plan outlines a comprehensive strategy for market entry and growth.`
}

function enhanceMarketAnalysis(currentAnalysis: string, plan: BusinessPlan): string {
  const enhancement = `
Market Analysis Enhancement:

Target Market: Our primary target market consists of customers seeking innovative solutions in this space.

Market Size: The addressable market represents a significant opportunity with substantial growth potential.

Competitive Landscape: While competition exists, our unique approach provides clear differentiation opportunities.

Market Trends: Current market trends indicate strong demand for solutions that address key customer pain points.

${currentAnalysis}
  `
  
  return enhancement.trim()
}
