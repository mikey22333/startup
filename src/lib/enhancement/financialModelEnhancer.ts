import { BusinessPlan } from '@/lib/exportService'

interface EnhancedFinancialData {
  revenueProjections: number[]
  expenses: number[]
  profitMargins: number[]
  cashFlow: number[]
  breakEvenMonth: number
  fundingRequirement: number
  keyMetrics: {
    customerAcquisitionCost: number
    lifetimeValue: number
    churnRate: number
    grossMargin: number
  }
}

interface IndustryBenchmarks {
  averageGrossMargin: number
  typicalGrowthRate: number
  averageCustomerAcquisitionCost: number
  industryMultiples: {
    revenueMultiple: number
    ebitdaMultiple: number
  }
}

const industryBenchmarks: Record<string, IndustryBenchmarks> = {
  'technology': {
    averageGrossMargin: 0.75,
    typicalGrowthRate: 0.25,
    averageCustomerAcquisitionCost: 500,
    industryMultiples: {
      revenueMultiple: 8,
      ebitdaMultiple: 15
    }
  },
  'retail': {
    averageGrossMargin: 0.45,
    typicalGrowthRate: 0.15,
    averageCustomerAcquisitionCost: 150,
    industryMultiples: {
      revenueMultiple: 2,
      ebitdaMultiple: 8
    }
  },
  'healthcare': {
    averageGrossMargin: 0.65,
    typicalGrowthRate: 0.20,
    averageCustomerAcquisitionCost: 800,
    industryMultiples: {
      revenueMultiple: 4,
      ebitdaMultiple: 12
    }
  },
  'education': {
    averageGrossMargin: 0.60,
    typicalGrowthRate: 0.18,
    averageCustomerAcquisitionCost: 300,
    industryMultiples: {
      revenueMultiple: 3,
      ebitdaMultiple: 10
    }
  },
  'default': {
    averageGrossMargin: 0.55,
    typicalGrowthRate: 0.20,
    averageCustomerAcquisitionCost: 400,
    industryMultiples: {
      revenueMultiple: 4,
      ebitdaMultiple: 10
    }
  }
}

export function enhanceFinancialModel(plan: BusinessPlan): EnhancedFinancialData {
  try {
    const businessType = detectBusinessType(plan.executiveSummary)
    const benchmarks = industryBenchmarks[businessType] || industryBenchmarks.default
    
    // Enhanced revenue projections with realistic growth patterns
    const revenueProjections = buildRevenueProjections(plan, benchmarks)
    
    // Detailed expense modeling
    const expenses = buildExpenseModel(revenueProjections, benchmarks)
    
    // Calculate profit margins
    const profitMargins = revenueProjections.map((revenue, index) => {
      const expense = expenses[index] || 0
      return revenue > 0 ? ((revenue - expense) / revenue) : 0
    })
    
    // Build cash flow model
    const cashFlow = buildCashFlowModel(revenueProjections, expenses)
    
    // Calculate break-even point
    const breakEvenMonth = findBreakEvenPoint(cashFlow)
    
    // Determine funding requirement
    const fundingRequirement = calculateFundingRequirement(cashFlow, expenses)
    
    // Calculate key business metrics
    const keyMetrics = calculateKeyMetrics(plan, benchmarks, revenueProjections)
    
    return {
      revenueProjections,
      expenses,
      profitMargins,
      cashFlow,
      breakEvenMonth,
      fundingRequirement,
      keyMetrics
    }
  } catch (error) {
    console.error('Error enhancing financial model:', error)
    // Return safe defaults if enhancement fails
    return {
      revenueProjections: [0, 0, 0, 0, 0],
      expenses: [0, 0, 0, 0, 0],
      profitMargins: [0, 0, 0, 0, 0],
      cashFlow: [0, 0, 0, 0, 0],
      breakEvenMonth: 12,
      fundingRequirement: 100000,
      keyMetrics: {
        customerAcquisitionCost: 0,
        lifetimeValue: 0,
        churnRate: 0.05,
        grossMargin: 0.5
      }
    }
  }
}

function detectBusinessType(businessIdea: string): string {
  const idea = businessIdea.toLowerCase()
  
  if (idea.includes('tech') || idea.includes('software') || idea.includes('app') || idea.includes('platform') || idea.includes('saas')) {
    return 'technology'
  }
  if (idea.includes('retail') || idea.includes('store') || idea.includes('shop') || idea.includes('marketplace')) {
    return 'retail'
  }
  if (idea.includes('health') || idea.includes('medical') || idea.includes('wellness') || idea.includes('fitness')) {
    return 'healthcare'
  }
  if (idea.includes('education') || idea.includes('learning') || idea.includes('school') || idea.includes('course')) {
    return 'education'
  }
  
  return 'default'
}

function buildRevenueProjections(plan: BusinessPlan, benchmarks: IndustryBenchmarks): number[] {
  const projections: number[] = []
  
  // Extract initial revenue estimate from plan
  const initialRevenue = extractInitialRevenue(plan)
  const growthRate = benchmarks.typicalGrowthRate / 12 // Monthly growth rate
  
  for (let year = 0; year < 5; year++) {
    let yearlyRevenue = initialRevenue * Math.pow(1 + benchmarks.typicalGrowthRate, year)
    
    // Add some market-realistic constraints
    if (year === 0) yearlyRevenue *= 0.5 // First year is typically slower
    if (year === 1) yearlyRevenue *= 0.8 // Second year builds momentum
    
    projections.push(Math.round(yearlyRevenue))
  }
  
  return projections
}

function extractInitialRevenue(plan: BusinessPlan): number {
  // Try to extract revenue figures from the plan text
  const revenueMatch = plan.financialProjections?.match(/\$?([\d,]+)/) 
  if (revenueMatch) {
    return parseInt(revenueMatch[1].replace(/,/g, ''))
  }
  
  // Default based on business complexity
  return 250000 // Conservative default
}

function buildExpenseModel(revenueProjections: number[], benchmarks: IndustryBenchmarks): number[] {
  return revenueProjections.map((revenue, year) => {
    let totalExpenses = 0
    
    // Cost of Goods Sold (variable with revenue)
    const cogs = revenue * (1 - benchmarks.averageGrossMargin)
    
    // Fixed operating expenses
    const baseOperatingCosts = 150000 + (year * 25000) // Growing fixed costs
    
    // Sales and marketing (percentage of revenue)
    const salesMarketing = revenue * 0.25
    
    // R&D (for tech companies, lower for others)
    const rdCosts = revenue * 0.15
    
    totalExpenses = cogs + baseOperatingCosts + salesMarketing + rdCosts
    
    return Math.round(totalExpenses)
  })
}

function buildCashFlowModel(revenueProjections: number[], expenses: number[]): number[] {
  const cashFlow: number[] = []
  let cumulativeCash = -200000 // Initial investment/startup costs
  
  for (let i = 0; i < revenueProjections.length; i++) {
    const netIncome = (revenueProjections[i] || 0) - (expenses[i] || 0)
    cumulativeCash += netIncome
    cashFlow.push(Math.round(cumulativeCash))
  }
  
  return cashFlow
}

function findBreakEvenPoint(cashFlow: number[]): number {
  for (let i = 0; i < cashFlow.length; i++) {
    if (cashFlow[i] >= 0) {
      return (i + 1) * 12 // Convert to months
    }
  }
  return 60 // Default to 5 years if not found
}

function calculateFundingRequirement(cashFlow: number[], expenses: number[]): number {
  const minCashFlow = Math.min(...cashFlow)
  const operatingBuffer = Math.max(...expenses) * 0.5 // 6 months operating expenses
  
  return Math.max(Math.abs(minCashFlow) + operatingBuffer, 100000)
}

function calculateKeyMetrics(plan: BusinessPlan, benchmarks: IndustryBenchmarks, revenueProjections: number[]) {
  return {
    customerAcquisitionCost: benchmarks.averageCustomerAcquisitionCost,
    lifetimeValue: benchmarks.averageCustomerAcquisitionCost * 3, // Conservative 3x CAC
    churnRate: 0.05, // 5% monthly churn
    grossMargin: benchmarks.averageGrossMargin
  }
}
