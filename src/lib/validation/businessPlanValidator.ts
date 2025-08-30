// Business Plan Data Validation and Consistency Checking
// Ensures data integrity and realistic projections across all plan sections

export interface ValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  suggestions: string[]
}

export interface FinancialMetrics {
  monthlyRevenue: number
  monthlyCosts: number
  cac: number
  ltv: number
  churnRate: number
  breakEvenMonths: number
  initialInvestment: number
  monthlyBurnRate: number
}

export interface BusinessPlanData {
  executiveSummary: {
    investmentNeeded: string
    timeToLaunch: string
    marketingBudget: string
  }
  financialProjections: {
    revenue: number[]
    costs: number[]
    customers: number[]
  }
  metrics: FinancialMetrics
  marketData: {
    tam: string
    sam: string
    som: string
    growthRate: string
  }
  competitors: Array<{
    name: string
    marketShare: string
    pricing: string
    revenue?: string
  }>
}

export class BusinessPlanValidator {
  
  /**
   * Comprehensive validation of business plan data consistency
   */
  validateBusinessPlan(data: BusinessPlanData): ValidationResult {
    const warnings: string[] = []
    const errors: string[] = []
    const suggestions: string[] = []

    // 1. Financial Model Validation
    const financialValidation = this.validateFinancialModel(data.metrics, data.financialProjections)
    warnings.push(...financialValidation.warnings)
    errors.push(...financialValidation.errors)
    suggestions.push(...financialValidation.suggestions)

    // 2. Market Size Consistency
    const marketValidation = this.validateMarketSizes(data.marketData)
    warnings.push(...marketValidation.warnings)
    errors.push(...marketValidation.errors)
    suggestions.push(...marketValidation.suggestions)

    // 3. Competitive Analysis Validation
    const competitorValidation = this.validateCompetitorData(data.competitors)
    warnings.push(...competitorValidation.warnings)
    suggestions.push(...competitorValidation.suggestions)

    // 4. Cross-Section Consistency
    const consistencyValidation = this.validateCrossSectionConsistency(data)
    warnings.push(...consistencyValidation.warnings)
    errors.push(...consistencyValidation.errors)
    suggestions.push(...consistencyValidation.suggestions)

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      suggestions
    }
  }

  /**
   * Validate financial model for realistic projections and consistency
   */
  private validateFinancialModel(metrics: FinancialMetrics, projections: any): ValidationResult {
    const warnings: string[] = []
    const errors: string[] = []
    const suggestions: string[] = []

    // Check break-even analysis
    if (metrics.breakEvenMonths < 1) {
      errors.push('Break-even period less than 1 month is unrealistic for most businesses')
      suggestions.push('Recalculate break-even based on realistic revenue ramp-up and cost structure')
    }

    if (metrics.breakEvenMonths > 48) {
      warnings.push('Break-even period over 4 years indicates high risk - consider reducing costs or improving revenue model')
    }

    // Validate LTV:CAC ratio with division by zero protection
    if (metrics.cac > 0) {
      const ltvCacRatio = metrics.ltv / metrics.cac
      if (ltvCacRatio < 2) {
        errors.push(`LTV:CAC ratio of ${ltvCacRatio.toFixed(1)} is below healthy threshold of 3:1`)
        suggestions.push('Improve customer lifetime value or reduce acquisition costs')
      } else if (ltvCacRatio > 10) {
        warnings.push(`LTV:CAC ratio of ${ltvCacRatio.toFixed(1)} seems optimistic - validate assumptions`)
      }
    } else {
      warnings.push('Customer acquisition cost is zero or invalid - validate marketing budget')
    }

    // Check churn rate reasonableness
    if (metrics.churnRate > 20) {
      warnings.push('Monthly churn rate above 20% indicates poor product-market fit')
      suggestions.push('Focus on customer retention and product improvement')
    }

    if (metrics.churnRate < 1) {
      warnings.push('Churn rate below 1% monthly is extremely optimistic')
    }

    // Validate burn rate vs revenue
    if (metrics.monthlyBurnRate > metrics.monthlyRevenue * 3) {
      warnings.push('Monthly burn rate is more than 3x monthly revenue - unsustainable long-term')
    }

    // Check pricing consistency
    const customerCount = projections.customers?.[0] || 1
    const avgRevenuePerCustomer = customerCount > 0 ? metrics.monthlyRevenue / customerCount : 0
    if (avgRevenuePerCustomer < 10) {
      warnings.push('Average revenue per customer seems very low - validate pricing strategy')
    }

    return { isValid: errors.length === 0, warnings, errors, suggestions }
  }

  /**
   * Validate market size hierarchy (TAM > SAM > SOM)
   */
  private validateMarketSizes(marketData: any): ValidationResult {
    const warnings: string[] = []
    const errors: string[] = []
    const suggestions: string[] = []

    try {
      const tam = this.parseMarketSize(marketData.tam)
      const sam = this.parseMarketSize(marketData.sam)
      const som = this.parseMarketSize(marketData.som)

      if (sam >= tam) {
        errors.push('SAM cannot be equal to or larger than TAM')
        suggestions.push('SAM should be 5-20% of TAM for most markets')
      }

      if (som >= sam) {
        errors.push('SOM cannot be equal to or larger than SAM')
        suggestions.push('SOM should be 1-10% of SAM for realistic market capture')
      }

      // Check reasonableness of SOM with division by zero protection
      if (sam > 0) {
        const somPercent = (som / sam) * 100
        if (somPercent > 15) {
          warnings.push(`SOM represents ${somPercent.toFixed(1)}% of SAM - very ambitious for most businesses`)
        }

        if (somPercent < 0.5) {
          warnings.push(`SOM represents only ${somPercent.toFixed(2)}% of SAM - may be too conservative`)
        }
      } else {
        warnings.push('SAM value is zero or invalid - cannot validate SOM percentage')
      }

    } catch (error) {
      warnings.push('Unable to parse market size values for validation')
    }

    return { isValid: errors.length === 0, warnings, errors, suggestions }
  }

  /**
   * Validate competitor data for completeness and realism
   */
  private validateCompetitorData(competitors: any[]): ValidationResult {
    const warnings: string[] = []
    const suggestions: string[] = []

    if (competitors.length === 0) {
      warnings.push('No competitors identified - most markets have competition')
      suggestions.push('Research direct and indirect competitors more thoroughly')
    }

    if (competitors.length > 10) {
      warnings.push('Too many competitors listed - focus on top 3-5 most relevant ones')
    }

    let hasMarketShareData = false
    let hasFundingData = false
    let hasPricingData = false

    competitors.forEach((competitor, index) => {
      if (competitor.marketShare && !competitor.marketShare.includes('Difficult')) {
        hasMarketShareData = true
      }
      if (competitor.funding && competitor.funding !== 'Unknown') {
        hasFundingData = true
      }
      if (competitor.pricing && competitor.pricing !== 'Unknown') {
        hasPricingData = true
      }

      // Check for generic descriptions
      if (competitor.name.includes('Competitor') || competitor.name.includes('Unknown')) {
        warnings.push(`Generic competitor name detected: ${competitor.name}`)
      }
    })

    if (!hasMarketShareData) {
      suggestions.push('Try to find more specific market share data for key competitors')
    }

    if (!hasFundingData) {
      suggestions.push('Research competitor funding rounds for better competitive intelligence')
    }

    if (!hasPricingData) {
      suggestions.push('Gather more specific pricing information from competitor websites')
    }

    return { isValid: true, warnings, errors: [], suggestions }
  }

  /**
   * Validate consistency across different sections of the business plan
   */
  private validateCrossSectionConsistency(data: BusinessPlanData): ValidationResult {
    const warnings: string[] = []
    const errors: string[] = []
    const suggestions: string[] = []

    // Check investment vs costs consistency
    const investmentAmount = this.parseInvestmentAmount(data.executiveSummary.investmentNeeded)
    const initialCosts = data.metrics.initialInvestment

    if (investmentAmount > 0 && Math.abs(investmentAmount - initialCosts) / investmentAmount > 0.3) {
      warnings.push('Investment needed in summary differs significantly from detailed cost breakdown')
      suggestions.push('Ensure investment amounts are consistent across all sections')
    }

    // Check time to launch vs business complexity
    const timeToLaunch = data.executiveSummary.timeToLaunch
    if (timeToLaunch.includes('1-2') && data.metrics.initialInvestment > 50000) {
      warnings.push('1-2 month launch timeline seems aggressive for high-investment business')
    }

    // Check marketing budget vs CAC with proper validation
    const marketingBudget = this.parseMarketingBudget(data.executiveSummary.marketingBudget)
    const expectedCustomers = data.financialProjections.customers?.[11] || 0 // Month 12
    
    if (marketingBudget > 0 && expectedCustomers > 0) {
      const impliedCAC = (marketingBudget * 12) / expectedCustomers
      
      if (data.metrics.cac > 0 && Math.abs(impliedCAC - data.metrics.cac) / data.metrics.cac > 0.5) {
        warnings.push('Marketing budget and CAC projections are inconsistent')
        suggestions.push('Align marketing spend with customer acquisition cost assumptions')
      }
    } else {
      warnings.push('Unable to validate marketing budget consistency due to missing data')
    }

    return { isValid: errors.length === 0, warnings, errors, suggestions }
  }

  /**
   * Helper function to parse market size strings
   */
  private parseMarketSize(sizeString: string): number {
    const cleanString = sizeString.replace(/[^0-9.]/g, '')
    const number = parseFloat(cleanString)
    
    if (sizeString.toLowerCase().includes('billion')) {
      return number * 1000 // Convert to millions
    }
    return number // Already in millions
  }

  /**
   * Helper function to parse investment amount
   */
  private parseInvestmentAmount(investmentString: string): number {
    const match = investmentString.match(/\$?([\d,]+)/)
    if (match) {
      return parseInt(match[1].replace(/,/g, ''))
    }
    return 0
  }

  /**
   * Helper function to parse marketing budget
   */
  private parseMarketingBudget(budgetString: string): number {
    const match = budgetString.match(/\$?([\d,]+)/)
    if (match) {
      return parseInt(match[1].replace(/,/g, ''))
    }
    return 0
  }

  /**
   * Auto-correct common validation issues
   */
  correctValidationIssues(data: BusinessPlanData, validationResult: ValidationResult): BusinessPlanData {
    const correctedData = { ...data }

    // Fix unrealistic break-even if detected
    if (correctedData.metrics.breakEvenMonths < 1) {
      const monthlyProfit = correctedData.metrics.monthlyRevenue - correctedData.metrics.monthlyCosts
      if (monthlyProfit > 0) {
        correctedData.metrics.breakEvenMonths = Math.ceil(correctedData.metrics.initialInvestment / monthlyProfit)
      } else {
        correctedData.metrics.breakEvenMonths = 12 // Default to 12 months if no positive cash flow
      }
    }

    // Adjust SOM if it's too high relative to SAM
    const som = this.parseMarketSize(correctedData.marketData.som)
    const sam = this.parseMarketSize(correctedData.marketData.sam)
    if (som >= sam) {
      const adjustedSOM = sam * 0.05 // Set to 5% of SAM
      correctedData.marketData.som = adjustedSOM < 1 
        ? `$${adjustedSOM.toFixed(1)} million` 
        : `$${Math.round(adjustedSOM)} million`
    }

    return correctedData
  }
}

export const businessPlanValidator = new BusinessPlanValidator()
