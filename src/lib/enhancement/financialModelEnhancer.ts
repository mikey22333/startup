// Financial Model Enhancement and Cross-Validation System
// Ensures realistic and consistent financial projections

export interface FinancialModel {
  revenue: {
    monthly: number[]
    annual: number
    growthRate: number
    revenueStreams: string[]
  }
  costs: {
    monthly: number[]
    annual: number
    fixedCosts: number
    variableCosts: number
    breakdown: Record<string, number>
  }
  metrics: {
    cac: number
    ltv: number
    ltvCacRatio: number
    churnRate: number
    arpu: number
    grossMargin: number
    contributionMargin: number
  }
  cashFlow: {
    monthly: number[]
    cumulativeCashFlow: number[]
    breakEvenMonth: number
    runwayMonths: number
  }
  fundingRequirement: {
    initialInvestment: number
    workingCapital: number
    growthCapital: number
    totalRequired: number
  }
}

export interface ModelValidation {
  isRealistic: boolean
  consistencyScore: number
  issues: Array<{
    type: 'ERROR' | 'WARNING' | 'SUGGESTION'
    category: 'REVENUE' | 'COSTS' | 'METRICS' | 'CASHFLOW' | 'FUNDING'
    message: string
    impact: 'HIGH' | 'MEDIUM' | 'LOW'
    recommendation: string
  }>
  improvements: FinancialModel
}

class FinancialModelEnhancer {

  /**
   * Enhance and validate financial model for realism and consistency
   */
  enhanceFinancialModel(
    businessType: string,
    businessIdea: string,
    initialProjections: any,
    marketData: any
  ): { model: FinancialModel, validation: ModelValidation } {
    
    console.log('🔧 Enhancing financial model for', businessType)
    
    // Create enhanced model
    const enhancedModel = this.buildEnhancedModel(businessType, businessIdea, initialProjections, marketData)
    
    // Validate the model
    const validation = this.validateModel(enhancedModel, businessType, businessIdea)
    
    // Apply improvements
    const improvedModel = this.applyImprovements(enhancedModel, validation)
    
    return {
      model: improvedModel,
      validation: {
        ...validation,
        improvements: improvedModel
      }
    }
  }

  /**
   * Build enhanced financial model with industry benchmarks
   */
  private buildEnhancedModel(
    businessType: string,
    businessIdea: string,
    projections: any,
    marketData: any
  ): FinancialModel {
    
    // Get industry benchmarks
    const benchmarks = this.getIndustryBenchmarks(businessType, businessIdea)
    
    // Build revenue model
    const revenue = this.buildRevenueModel(projections, benchmarks, marketData)
    
    // Build cost model
    const costs = this.buildCostModel(projections, benchmarks, revenue.monthly)
    
    // Calculate metrics
    const metrics = this.calculateMetrics(revenue, costs, projections)
    
    // Build cash flow
    const cashFlow = this.buildCashFlowModel(revenue.monthly, costs.monthly, projections.initialInvestment)
    
    // Calculate funding requirement
    const fundingRequirement = this.calculateFundingRequirement(cashFlow, costs, projections)
    
    return {
      revenue,
      costs,
      metrics,
      cashFlow,
      fundingRequirement
    }
  }

  /**
   * Get industry-specific benchmarks
   */
  private getIndustryBenchmarks(businessType: string, businessIdea: string) {
    const lowerType = businessType.toLowerCase()
    const lowerIdea = businessIdea.toLowerCase()
    
    // SaaS/Software benchmarks
    if (lowerType.includes('digital') || lowerIdea.includes('saas') || lowerIdea.includes('app')) {
      return {
        grossMargin: 0.75,
        churnRate: 0.05,
        ltvCacRatio: 4,
        paybackPeriod: 12,
        growthRate: 0.15,
        operatingMargin: 0.20
      }
    }
    
    // E-commerce benchmarks
    if (lowerType.includes('retail') || lowerIdea.includes('ecommerce') || lowerIdea.includes('online store')) {
      return {
        grossMargin: 0.45,
        churnRate: 0.10,
        ltvCacRatio: 3,
        paybackPeriod: 6,
        growthRate: 0.12,
        operatingMargin: 0.15
      }
    }
    
    // Service business benchmarks
    if (lowerType.includes('service') || lowerIdea.includes('consulting') || lowerIdea.includes('coaching')) {
      return {
        grossMargin: 0.60,
        churnRate: 0.08,
        ltvCacRatio: 5,
        paybackPeriod: 3,
        growthRate: 0.10,
        operatingMargin: 0.25
      }
    }
    
    // Food & Beverage benchmarks
    if (lowerIdea.includes('food') || lowerIdea.includes('restaurant') || lowerIdea.includes('delivery')) {
      return {
        grossMargin: 0.35,
        churnRate: 0.15,
        ltvCacRatio: 2.5,
        paybackPeriod: 9,
        growthRate: 0.08,
        operatingMargin: 0.10
      }
    }
    
    // Default benchmarks
    return {
      grossMargin: 0.50,
      churnRate: 0.10,
      ltvCacRatio: 3,
      paybackPeriod: 8,
      growthRate: 0.10,
      operatingMargin: 0.15
    }
  }

  /**
   * Build realistic revenue model
   */
  private buildRevenueModel(projections: any, benchmarks: any, marketData: any) {
    const monthly: number[] = []
    let currentRevenue = projections.monthlyRevenue || 1000
    
    // Apply realistic growth curve
    for (let month = 0; month < 12; month++) {
      if (month === 0) {
        monthly.push(currentRevenue * 0.3) // Start slow
      } else if (month < 3) {
        monthly.push(monthly[month - 1] * 1.15) // Rapid early growth
      } else if (month < 6) {
        monthly.push(monthly[month - 1] * 1.10) // Moderate growth
      } else {
        monthly.push(monthly[month - 1] * (1 + benchmarks.growthRate)) // Steady growth
      }
    }
    
    const annual = monthly.reduce((sum, rev) => sum + rev, 0)
    
    return {
      monthly,
      annual,
      growthRate: benchmarks.growthRate,
      revenueStreams: this.identifyRevenueStreams(projections.businessIdea || '')
    }
  }

  /**
   * Build realistic cost model
   */
  private buildCostModel(projections: any, benchmarks: any, revenueMonthly: number[]) {
    const monthly: number[] = []
    const baseCosts = projections.monthlyCosts || 2000
    
    // Calculate costs based on revenue (variable) + fixed costs
    for (let month = 0; month < 12; month++) {
      const variableCosts = revenueMonthly[month] * (1 - benchmarks.grossMargin)
      const fixedCosts = baseCosts * 0.7 // 70% fixed costs
      monthly.push(variableCosts + fixedCosts)
    }
    
    const annual = monthly.reduce((sum, cost) => sum + cost, 0)
    
    return {
      monthly,
      annual,
      fixedCosts: baseCosts * 0.7,
      variableCosts: annual * (1 - benchmarks.grossMargin),
      breakdown: {
        personnel: baseCosts * 0.4,
        marketing: baseCosts * 0.2,
        operations: baseCosts * 0.15,
        overhead: baseCosts * 0.15,
        technology: baseCosts * 0.1
      }
    }
  }

  /**
   * Calculate key financial metrics
   */
  private calculateMetrics(revenue: any, costs: any, projections: any) {
    const grossMargin = (revenue.annual - costs.variableCosts) / revenue.annual
    const arpu = revenue.monthly[11] / (projections.customers || 100)
    const cac = projections.cac || arpu * 0.3 // CAC should be ~30% of ARPU
    const ltv = arpu * 24 * (1 - 0.05) // 24 months * retention rate
    const churnRate = 0.05 // 5% monthly churn
    
    return {
      cac,
      ltv,
      ltvCacRatio: ltv / cac,
      churnRate,
      arpu,
      grossMargin,
      contributionMargin: grossMargin
    }
  }

  /**
   * Build cash flow model
   */
  private buildCashFlowModel(revenueMonthly: number[], costsMonthly: number[], initialInvestment: number) {
    const monthly: number[] = []
    const cumulativeCashFlow: number[] = []
    let cumulative = -initialInvestment
    let breakEvenMonth = 12
    
    for (let month = 0; month < 12; month++) {
      const monthlyFlow = revenueMonthly[month] - costsMonthly[month]
      monthly.push(monthlyFlow)
      cumulative += monthlyFlow
      cumulativeCashFlow.push(cumulative)
      
      if (cumulative > 0 && breakEvenMonth === 12) {
        breakEvenMonth = month + 1
      }
    }
    
    const runwayMonths = Math.max(0, Math.ceil(initialInvestment / (costsMonthly[0] || 1000)))
    
    return {
      monthly,
      cumulativeCashFlow,
      breakEvenMonth,
      runwayMonths
    }
  }

  /**
   * Calculate funding requirement
   */
  private calculateFundingRequirement(cashFlow: any, costs: any, projections: any) {
    const minCashFlow = Math.min(...cashFlow.cumulativeCashFlow)
    const workingCapital = costs.monthly[0] * 2 // 2 months of expenses
    const growthCapital = projections.initialInvestment || 15000
    
    return {
      initialInvestment: Math.abs(minCashFlow),
      workingCapital,
      growthCapital,
      totalRequired: Math.abs(minCashFlow) + workingCapital + growthCapital
    }
  }

  /**
   * Validate the financial model
   */
  private validateModel(model: FinancialModel, businessType: string, businessIdea: string): ModelValidation {
    const issues: any[] = []
    let consistencyScore = 100
    
    // Check LTV:CAC ratio
    if (model.metrics.ltvCacRatio < 2) {
      issues.push({
        type: 'ERROR',
        category: 'METRICS',
        message: `LTV:CAC ratio of ${model.metrics.ltvCacRatio.toFixed(1)} is below healthy threshold`,
        impact: 'HIGH',
        recommendation: 'Increase customer lifetime value or reduce acquisition costs'
      })
      consistencyScore -= 20
    }
    
    // Check break-even period
    if (model.cashFlow.breakEvenMonth > 24) {
      issues.push({
        type: 'WARNING',
        category: 'CASHFLOW',
        message: 'Break-even period exceeds 24 months',
        impact: 'HIGH',
        recommendation: 'Consider reducing costs or improving revenue model'
      })
      consistencyScore -= 15
    }
    
    // Check gross margin
    if (model.metrics.grossMargin < 0.2) {
      issues.push({
        type: 'WARNING',
        category: 'METRICS',
        message: 'Gross margin below 20% may indicate unsustainable pricing',
        impact: 'MEDIUM',
        recommendation: 'Review pricing strategy and cost structure'
      })
      consistencyScore -= 10
    }
    
    // Check runway
    if (model.cashFlow.runwayMonths < 6) {
      issues.push({
        type: 'ERROR',
        category: 'FUNDING',
        message: 'Cash runway less than 6 months is risky',
        impact: 'HIGH',
        recommendation: 'Increase initial funding or reduce burn rate'
      })
      consistencyScore -= 25
    }
    
    return {
      isRealistic: consistencyScore >= 70,
      consistencyScore,
      issues,
      improvements: model
    }
  }

  /**
   * Apply improvements based on validation issues
   */
  private applyImprovements(model: FinancialModel, validation: ModelValidation): FinancialModel {
    const improved = { ...model }
    
    // Fix LTV:CAC ratio if needed
    if (improved.metrics.ltvCacRatio < 2) {
      improved.metrics.cac = improved.metrics.ltv / 3 // Target 3:1 ratio
    }
    
    // Adjust break-even if unrealistic
    if (improved.cashFlow.breakEvenMonth < 1) {
      improved.cashFlow.breakEvenMonth = Math.max(3, Math.ceil(improved.fundingRequirement.initialInvestment / improved.revenue.monthly[0]))
    }
    
    // Improve gross margin if too low
    if (improved.metrics.grossMargin < 0.2) {
      improved.metrics.grossMargin = 0.25 // Set minimum viable margin
    }
    
    return improved
  }

  /**
   * Identify revenue streams based on business idea
   */
  private identifyRevenueStreams(businessIdea: string): string[] {
    const lowerIdea = businessIdea.toLowerCase()
    const streams: string[] = []
    
    if (lowerIdea.includes('subscription') || lowerIdea.includes('saas')) {
      streams.push('Monthly subscriptions', 'Annual subscriptions', 'Premium tiers')
    }
    
    if (lowerIdea.includes('marketplace') || lowerIdea.includes('platform')) {
      streams.push('Transaction fees', 'Listing fees', 'Premium features')
    }
    
    if (lowerIdea.includes('delivery') || lowerIdea.includes('service')) {
      streams.push('Service fees', 'Delivery charges', 'Premium services')
    }
    
    if (lowerIdea.includes('product') || lowerIdea.includes('retail')) {
      streams.push('Product sales', 'Shipping fees', 'Accessories')
    }
    
    if (streams.length === 0) {
      streams.push('Primary service', 'Add-on services', 'Premium features')
    }
    
    return streams
  }
}

export const financialModelEnhancer = new FinancialModelEnhancer()
