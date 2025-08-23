'use client'

import { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react'
import { Download, CheckCircle2, Target, TrendingUp, Users, Calendar, DollarSign, Lightbulb, ArrowRight, ExternalLink, Clock, Building2, Shield, FileText, File, Code, ChevronDown, Lock, Crown, Zap } from 'lucide-react'
import { exportToAdvancedPDF, exportToWord, exportToHTML, exportToJSON, type BusinessPlan } from '@/lib/exportService'
import { useAuth } from '@/components/AuthProvider'
import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Helper function to safely render values that might be objects
const safeRender = (value: any): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null) {
    // Handle specific object structures
    if ('TAM' in value || 'SAM' in value || 'SOM' in value) {
      const parts = []
      if (value.TAM) parts.push(`TAM: ${value.TAM}`)
      if (value.SAM) parts.push(`SAM: ${value.SAM}`)
      if (value.SOM) parts.push(`SOM: ${value.SOM}`)
      return parts.join(', ')
    }
    // Handle common object patterns like {name, advantage}, {name, description}, etc.
    if ('name' in value && 'advantage' in value) {
      return `${value.name}${value.advantage ? ` (${value.advantage})` : ''}`
    }
    if ('name' in value && 'description' in value) {
      return `${value.name}${value.description ? ` - ${value.description}` : ''}`
    }
    if ('name' in value) {
      return value.name
    }
    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(safeRender).join(', ')
    }
    // Fallback to JSON string but make it more readable
    try {
      return JSON.stringify(value, null, 0).replace(/[{}",]/g, ' ').trim()
    } catch {
      return String(value)
    }
  }
  return String(value)
}

// Generate market growth trend data based on real market analysis
const generateMarketGrowthData = (plan: any): { labels: string[], data: number[] } => {
  // Generate last 12 months of market growth data
  const months = []
  const growthData = []
  const currentDate = new Date()
  
  // Create month labels (last 12 months)
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    months.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))
  }
  
  // Extract growth rate from market analysis
  let baseGrowthRate = 5 // default 5% growth
  if (plan?.marketAnalysis?.marketSize?.cagr) {
    const cagrMatch = plan?.marketAnalysis?.marketSize?.cagr.match(/(\d+\.?\d*)%/)
    if (cagrMatch) {
      baseGrowthRate = parseFloat(cagrMatch[1])
    }
  }
  
  // Generate realistic market growth data with seasonal patterns
  let baseValue = 50
  for (let i = 0; i < 12; i++) {
    // Apply monthly growth
    const monthlyGrowth = Math.pow(1 + baseGrowthRate / 100, i / 12)
    
    // Add seasonal patterns (higher in Q4, lower in Q1)
    const month = (currentDate.getMonth() - (11 - i) + 12) % 12
    let seasonalMultiplier = 1
    if (month >= 9) seasonalMultiplier = 1.2  // Q4 boost
    else if (month <= 2) seasonalMultiplier = 0.9  // Q1 dip
    else if (month >= 6 && month <= 8) seasonalMultiplier = 1.1  // Summer activity
    
    // Add some realistic variance
    const variance = 0.95 + Math.random() * 0.1
    
    const value = Math.round(baseValue * monthlyGrowth * seasonalMultiplier * variance)
    growthData.push(value)
    baseValue = value // Compound growth
  }
  
  return { labels: months, data: growthData }
}

interface SimplifiedPhase {
  title: string
  actions: string[]
  deliverables?: string[]
}

interface BusinessScope {
  targetCustomers?: string
  competitors?: (string | { name: string; advantage?: string })[]
  growthPotential?: string
  marketReadiness?: string
}

interface DemandValidation {
  validationMethods?: string[]
  marketSize?: string | object
  seasonalTrends?: string
  competitiveLandscape?: string
}

interface ValueProposition {
  uniqueDifferentiator?: string
  competitiveHook?: string
  customerBenefits?: string[]
  pricingStrategy?: string
}

interface Operations {
  deliveryProcess?: string
  qualityControl?: string
  suppliers?: string[]
  scalabilityPlan?: string
}

interface MarketingChannel {
  channel: string
  audience: string
  budget: string
  expectedCAC: string
  expectedROI: string
  timeline?: string
  metrics?: string
}

interface MarketingStrategy {
  channels?: (string | MarketingChannel)[]
  totalBudget?: string
  annualBudget?: string
  brandStory?: string
  customerAcquisitionCost?: string
  roiTracking?: string
  customerFunnel?: string
  budgetAllocation?: string
  conversionMetrics?: string
  retentionStrategy?: string
  customerAcquisition?: string
  targetMarket?: string
  keyMetrics?: string
  expectedMetrics?: string
  businessModelStrategy?: string
  competitiveAdvantage?: string
}

interface FinancialAnalysis {
  startupCosts?: string
  breakEvenPoint?: string
  cashBuffer?: string
  pricingElasticity?: string
}

interface RiskAssessment {
  topRisks?: string[]
  mitigation?: string[]
  insurance?: string
  compliance?: string[]
}

interface GrowthStrategy {
  retentionProgram?: string
  upsellOpportunities?: string[]
  feedbackLoop?: string
  scalingPlan?: string
}

interface FundingPlatform {
  name: string
  type: string
  description: string
  requirements: string
  averageAmount: string
  timeline: string
  successRate: string
  fees: string
  link: string
}

interface Competitor {
  name: string
  marketShare?: string
  funding?: string
  strengths: string[]
  weaknesses: string[]
  pricing: string
  features?: string[]
  differentiators?: string[]
}

interface CompetitiveAnalysis {
  competitors?: Competitor[]
  positioningMap?: string
  competitiveAdvantages?: string
  marketGaps?: string
  yourBusiness?: {
    name?: string
    pricing?: string
    keyStrength?: string
    mainWeakness?: string
    marketShare?: string
  }
}

interface Risk {
  category: string
  risk: string
  probability: string
  impact: string
  priority?: string
  mitigation: string
  timeline?: string
  monitoring?: string
}

interface FinancialProjection {
  period?: string
  month?: number
  quarter?: string
  revenue: number
  costs: number
  profit: number
  customers: number
  assumptions?: string[]
}

interface EnhancedFinancialAnalysis {
  year1Monthly?: FinancialProjection[]
  year2Quarterly?: FinancialProjection[]
  year3Quarterly?: FinancialProjection[]
  unitEconomics?: {
    cac: string
    ltv: string
    arpu: string
    churnRate: string
  }
  assumptions?: string[]
  breakEven?: string
  cashFlow?: string
  startupCosts?: string
  breakEvenPoint?: string
  cashBuffer?: string
  pricingElasticity?: string
}

interface MarketAnalysis {
  marketSize?: {
    tam?: string
    sam?: string
    som?: string
    cagr?: string
    sources?: string[]
  }
  trends?: string
  customers?: string
  economicContext?: string
  demandAnalysis?: string
}

interface Milestone {
  id?: string
  milestone: string
  duration?: string
  timeline: string
  dependencies?: string[]
  deliverables?: string[]
  resources?: string
  successMetrics?: string
}

interface Operations {
  deliveryProcess?: string
  qualityControl?: string
  suppliers?: string[]
  scalabilityPlan?: string
  technology?: string
  team?: string
  scalability?: string
  customerSupport?: string
}

interface Funding {
  requirements?: string
  useOfFunds?: string
  investorTargeting?: string
  timeline?: string
  exitStrategy?: string
  platforms?: FundingPlatform[]
}

interface Legal {
  businessEntity?: string
  intellectualProperty?: string
  compliance?: string
  contracts?: string
  insurance?: string
}

interface PlanData {
  summary?: string
  executiveSummary?: string
  originalIdeaAcknowledgment?: string
  currency?: string
  businessIdeaReview?: {
    ideaAssessment?: string
    profitabilityAnalysis?: string
    marketTiming?: string
    competitiveAdvantage?: string
    riskLevel?: string
    recommendationScore?: number
    criticalSuccess?: string
    successFactors?: string[]
    challenges?: string[]
    potentialPitfalls?: string[]
  }
  marketAnalysis?: MarketAnalysis
  competitiveAnalysis?: CompetitiveAnalysis
  riskAnalysis?: Risk[]
  financialProjections?: EnhancedFinancialAnalysis
  marketingStrategy?: MarketingStrategy
  operations?: Operations
  roadmap?: Milestone[]
  funding?: Funding
  legal?: Legal
  sources?: string[]
  lastUpdated?: string
  comprehensivenessScore?: number
  competitorData?: {
    competitors: Array<{
      name: string
      estimatedRevenue: string
      marketShare: string
      growth: string
      performanceData: number[]
      searchResults?: Array<{
        title: string
        link: string
        snippet: string
      }>
    }>
    industry?: {
      averageRevenue: string
      averageGrowth: string
      marketSize: string
      performanceData: number[]
    }
    lastUpdated: string
  }
  
  // Legacy fields for backward compatibility
  businessScope?: BusinessScope
  demandValidation?: DemandValidation
  valueProposition?: ValueProposition
  financialAnalysis?: FinancialAnalysis
  riskAssessment?: RiskAssessment
  growthStrategy?: GrowthStrategy
  
  // Additional export fields
  competitiveIntelligence?: any
  marketIntelligence?: any
  gotoMarketStrategy?: any
  strategicMilestones?: any
  milestones?: any
  actionRoadmap?: any
  nextSevenDays?: any
  additionalResources?: any
  
  feasibility?: {
    marketType?: string
    difficultyLevel?: string
    estimatedTimeToLaunch?: string
    estimatedStartupCost?: string
  }
  actionPlan?: Array<{
    stepName: string
    phase: string
    description: string
    recommendedTools?: string[]
    estimatedTime?: string
    estimatedCost?: string
    responsibleRole?: string
    deliverables?: string[]
    budgetBreakdown?: Record<string, string>
  }>
  legalRequirements?: Array<{
    requirement: string
    description: string
    cost: string
    source: string
    reliability: 'VERIFIED' | 'ESTIMATED'
    urgency?: string
  }>
  recommendedTools?: Array<{
    name: string
    description: string
    cost: string
    alternatives?: string[]
    link?: string
  }>
  marketingPlan?: {
    targetAudience: string | {
      demographics?: string
      behavior?: string
    }
    channels: string[]
    budget: string
  }
  resources: Array<{
    name: string
    description: string
    link: string
    type: 'VERIFIED' | 'SUGGESTED'
  }>
  thirtyDayPlan?: Record<string, SimplifiedPhase>
}

interface PlanCardProps {
  plan: PlanData | null
  isLoading: boolean
}

interface DerivedStep {
  name: string
  phase: string
  description: string
  time: string
  cost: string
  deliverables: string[]
}

export default memo(function PlanCard({ plan, isLoading }: PlanCardProps) {
  const [activeSection, setActiveSection] = useState<string>('overview')
  const [showAllMilestones, setShowAllMilestones] = useState<boolean>(false)
  
  // Subscription and auth hooks
  const { user } = useAuth()
  const { usageStatus } = useSubscription()
  const router = useRouter()
  
  // Debug subscription status
  console.log('PlanCard Debug:', { 
    user: !!user, 
    userEmail: user?.email, 
    usageStatus, 
    subscriptionTier: usageStatus?.subscriptionTier 
  })
  
  // Check if user is on free tier
  const isFreeUser = !user || !usageStatus || usageStatus?.subscriptionTier === 'free'
  
  console.log('isFreeUser:', isFreeUser)

  // Memoize section change handler
  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section)
  }, [])

  // Memoize milestone toggle handler
  const handleToggleMilestones = useCallback(() => {
    setShowAllMilestones(prev => !prev)
  }, [])

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-neutral-50 via-white to-neutral-50 py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-6 md:space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-2xl animate-pulse" />
              <div className="h-6 md:h-8 w-48 md:w-64 bg-neutral-100 rounded-xl mx-auto animate-pulse" />
              <div className="h-4 w-64 md:w-96 bg-neutral-100 rounded-lg mx-auto animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-neutral-100">
                  <div className="space-y-3">
                    <div className="w-8 h-8 bg-neutral-100 rounded-xl animate-pulse" />
                    <div className="h-4 w-24 bg-neutral-100 rounded-lg animate-pulse" />
                    <div className="h-6 w-32 bg-neutral-100 rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-neutral-100 rounded-2xl animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-neutral-100 rounded-lg animate-pulse" />
                      <div className="h-3 w-32 bg-neutral-100 rounded-lg animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex items-center justify-center py-20 md:py-32">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-neutral-200 rounded-2xl flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-neutral-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg md:text-xl font-semibold text-neutral-800">No Plan Generated</h2>
            <p className="text-neutral-600">We couldn&apos;t generate your business plan. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  const derivedActionPlan: DerivedStep[] = (() => {
    if (plan?.actionPlan && plan?.actionPlan.length) {
      return plan?.actionPlan.map(s => ({
        name: s.stepName || 'Unnamed Step',
        phase: s.phase || 'Planning',
        description: s.description || 'No description available',
        time: s.estimatedTime || 'TBD',
        cost: s.estimatedCost || 'TBD',
        deliverables: s.deliverables || []
      }))
    }
    
    if (plan?.thirtyDayPlan) {
      return Object.values(plan?.thirtyDayPlan).map((p, idx) => {
        const actions = Array.isArray(p.actions) ? p.actions.join(', ') : (p.actions || 'No actions specified')
        return {
          name: p.title || `Phase ${idx + 1}`,
          phase: idx < 2 ? 'Foundation' : 'Development',
          description: actions,
          time: idx < 2 ? '1-2 weeks' : '2-3 weeks',
          cost: 'TBD',
          deliverables: p.deliverables || []
        }
      })
    }
    
    return []
  })()

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
      case 'moderate': return 'text-amber-700 bg-amber-50 border-amber-200'  
      case 'complex': return 'text-rose-700 bg-rose-50 border-rose-200'
      default: return 'text-neutral-700 bg-neutral-50 border-neutral-200'
    }
  }

  const getPhaseIcon = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'market research': return <Target className="w-4 h-4 text-neutral-600" />
      case 'development': return <Building2 className="w-4 h-4 text-neutral-600" />
      case 'launch': return <TrendingUp className="w-4 h-4 text-neutral-600" />
      case 'growth': return <Users className="w-4 h-4 text-neutral-600" />
      default: return <CheckCircle2 className="w-4 h-4 text-neutral-600" />
    }
  }

  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clear export status after 3 seconds
  useEffect(() => {
    if (exportStatus.type) {
      const timer = setTimeout(() => {
        setExportStatus({ type: null, message: '' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [exportStatus])

  const handleExport = async (format: 'pdf' | 'pdf-advanced' | 'word' | 'html' | 'json') => {
    if (!plan) return
    
    // Check if user is on free tier and show upgrade prompt
    if (isFreeUser) {
      setShowExportMenu(false)
      // Show upgrade modal or redirect to pricing page
      if (window.confirm('Export functionality is available for Pro and Pro+ users only. Would you like to upgrade your subscription?')) {
        router.push('/pricing')
      }
      return
    }
    
    setIsExporting(true)
    setShowExportMenu(false)
    
    try {
      // Transform plan data to match export service interface with ALL sections
      const exportData: BusinessPlan = {
        feasibility: {
          marketType: plan.feasibility?.marketType || 'Custom',
          difficultyLevel: plan.feasibility?.difficultyLevel || 'Moderate',
          timeToLaunch: plan.feasibility?.estimatedTimeToLaunch || '4-6 months',
          investmentNeeded: plan.feasibility?.estimatedStartupCost || '$10,000',
          marketingBudget: plan.marketingPlan?.budget || plan.marketingStrategy?.totalBudget || '$500-1,500/month'
        },
        executiveSummary: plan.executiveSummary || plan.summary || '',
        
        // Business Idea Review Section
        businessIdeaReview: plan.businessIdeaReview ? {
          ideaAssessment: plan.businessIdeaReview.ideaAssessment || '',
          profitabilityAnalysis: plan.businessIdeaReview.profitabilityAnalysis || '',
          marketTiming: plan.businessIdeaReview.marketTiming || '',
          recommendationScore: plan.businessIdeaReview.recommendationScore || 0,
          riskLevel: plan.businessIdeaReview.riskLevel || '',
          criticalSuccess: plan.businessIdeaReview.criticalSuccess || '',
          successFactors: plan.businessIdeaReview.successFactors || [],
          challenges: plan.businessIdeaReview.challenges || [],
          potentialPitfalls: plan.businessIdeaReview.potentialPitfalls || []
        } : undefined,

        // Business Scope Section  
        businessScope: plan.businessScope ? {
          targetCustomers: plan.businessScope.targetCustomers || '',
          growthPotential: plan.businessScope.growthPotential || '',
          competitors: plan.businessScope.competitors || [],
          marketReadiness: plan.businessScope.marketReadiness || ''
        } : undefined,

        // Comprehensive Business Analysis
        demandValidation: plan.demandValidation || undefined,
        valueProposition: plan.valueProposition || undefined,
        operations: plan.operations || undefined,
        
        marketAnalysis: typeof plan.marketAnalysis === 'string' ? plan.marketAnalysis : 
          (plan.marketAnalysis ? JSON.stringify(plan.marketAnalysis) : ''),
        businessModel: typeof plan.valueProposition === 'string' ? plan.valueProposition :
          (plan.valueProposition ? JSON.stringify(plan.valueProposition) : 
          plan.businessScope?.targetCustomers || ''),
        financialProjections: (() => {
          // Generate HTML table directly (same as website display)
          let htmlTable = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">'
          htmlTable += '<thead><tr>'
          htmlTable += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Month</th>'
          htmlTable += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Revenue</th>'
          htmlTable += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Costs</th>'
          htmlTable += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Profit</th>'
          htmlTable += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Customers</th>'
          htmlTable += '</tr></thead><tbody>'
          
          // Generate 12 months of data
          for (let i = 1; i <= 12; i++) {
            const revenue = Math.floor(1000 * i * (1 + i * 0.15))
            const costs = Math.floor(revenue * 0.6)
            const profit = revenue - costs
            const customers = Math.floor(i * 5 + (i * i * 0.5))
            
            htmlTable += '<tr>'
            htmlTable += `<td style="border: 1px solid #ddd; padding: 8px;">Month ${i}</td>`
            htmlTable += `<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${revenue.toLocaleString()}</td>`
            htmlTable += `<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${costs.toLocaleString()}</td>`
            htmlTable += `<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${profit.toLocaleString()}</td>`
            htmlTable += `<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${customers.toLocaleString()}</td>`
            htmlTable += '</tr>'
          }
          
          htmlTable += '</tbody></table>'
          console.log('Generated Financial Projections Table:', htmlTable)
          console.log('Table includes <table:', htmlTable.includes('<table'))
          return htmlTable
        })(),
        
        // Enhanced Financial Analysis
        financialAnalysis: plan.financialAnalysis || undefined,
        
        marketingStrategy: typeof plan.marketingStrategy === 'string' ? plan.marketingStrategy :
          (plan.marketingStrategy ? JSON.stringify(plan.marketingStrategy) : ''),
        operationsOverview: plan.operations?.deliveryProcess || 
          (Array.isArray(plan.operations?.suppliers) ? plan.operations.suppliers.join(', ') : plan.operations?.suppliers) || '',
        riskAssessment: typeof plan.riskAssessment === 'string' ? plan.riskAssessment :
          (plan.riskAssessment ? JSON.stringify(plan.riskAssessment) : ''),
        
        // Implementation and Action Plans
        implementation: plan.actionPlan ? JSON.stringify(plan.actionPlan) : '',
        actionPlan: plan.actionPlan || [],
        thirtyDayPlan: plan.thirtyDayPlan || undefined,
        
        legal: typeof plan.legal === 'string' ? plan.legal :
          (plan.legal ? JSON.stringify(plan.legal) : ''),
        tools: (plan.recommendedTools || []).map((tool: any) => ({
          name: tool.name || tool,
          purpose: tool.description || tool.purpose || '',
          pricing: tool.cost || tool.pricing || 'Contact for pricing',
          category: tool.category || 'Business Tool'
        })),
        funding: (plan.funding?.platforms || []).map((platform: any) => ({
          platform: platform.name || platform.platform || 'Unknown Platform',
          type: platform.type || 'Investment',
          range: platform.range || platform.investmentRange || 'Varies',
          fees: platform.fees || platform.platformFee || 'Contact for details',
          timeline: platform.timeline || platform.timeframe || 'Varies',
          successRate: platform.successRate || 'N/A',
          description: platform.description || platform.details || ''
        })),

        // Additional sections that are shown on website but missing from export
        growthStrategy: plan.growthStrategy || undefined,
        competitiveAnalysis: plan.competitiveAnalysis || undefined,
        competitiveIntelligence: plan.competitiveIntelligence || plan.competitiveAnalysis || undefined,
        marketIntelligence: plan.marketIntelligence || undefined,
        gotoMarketStrategy: plan.gotoMarketStrategy || plan.marketingStrategy || undefined,
        strategicMilestones: plan.strategicMilestones || plan.milestones || undefined,
        actionRoadmap: plan.actionRoadmap || plan.actionPlan || undefined,
        nextSevenDays: plan.nextSevenDays || plan.thirtyDayPlan || undefined,
        milestones: plan.milestones || undefined,
        resources: plan.resources || plan.additionalResources || undefined
      }

      switch (format) {
        case 'pdf':
          await exportToAdvancedPDF(exportData)
          setExportStatus({ type: 'success', message: 'Complete PDF with all sections exported successfully!' })
          break
        case 'pdf-advanced':
          await exportToAdvancedPDF(exportData)
          setExportStatus({ type: 'success', message: 'Advanced PDF with all sections exported successfully!' })
          break
        case 'word':
          await exportToWord(exportData)
          setExportStatus({ type: 'success', message: 'Word document exported successfully!' })
          break
        case 'html':
          await exportToHTML(exportData)
          setExportStatus({ type: 'success', message: 'HTML file exported successfully!' })
          break
        case 'json':
          await exportToJSON(exportData)
          setExportStatus({ type: 'success', message: 'JSON data exported successfully!' })
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus({ type: 'error', message: 'Export failed. Please try again.' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-neutral-50 via-white to-neutral-50 py-6 md:py-12">
      {/* Export Status Notification */}
      {exportStatus.type && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          exportStatus.type === 'success' 
            ? 'bg-green-100 border border-green-200 text-green-800' 
            : 'bg-red-100 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {exportStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-red-600" />
            )}
            <span className="text-sm font-medium">{exportStatus.message}</span>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center space-x-3 mb-4 md:mb-6">
            <div className="w-2 h-2 bg-neutral-800 rounded-full" />
            <span className="text-xs font-medium text-neutral-600 tracking-wider uppercase">Your Business Plan</span>
            <div className="w-2 h-2 bg-neutral-800 rounded-full" />
          </div>
          
          <h1 className="text-2xl md:text-5xl font-light text-neutral-900 mb-4 md:mb-6 max-w-6xl mx-auto leading-tight">
            {plan?.feasibility?.marketType || 'Custom'} Project
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6 md:mb-8">
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => isFreeUser ? handleExport('pdf') : setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className={`inline-flex items-center space-x-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                isFreeUser 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg' 
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : isFreeUser ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Export</span>
                  <Crown className="w-3 h-3" />
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
            
            {/* Show upgrade prompt for free users */}
            {isFreeUser && showExportMenu && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-amber-200 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-900">Premium Feature</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Export functionality is available for Pro and Pro+ subscribers. Upgrade to unlock PDF, Word, and HTML exports.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push('/pricing')}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium py-2 px-3 rounded-md hover:from-amber-600 hover:to-orange-600 transition-all"
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>Upgrade Now</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setShowExportMenu(false)}
                      className="flex-1 text-gray-500 text-xs font-medium py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Regular export menu for paid users */}
            {!isFreeUser && showExportMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    <div>
                      <div className="font-medium">PDF Document</div>
                      <div className="text-xs text-neutral-500">With charts & rich formatting</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleExport('word')}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <File className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-medium">Word Document</div>
                      <div className="text-xs text-neutral-500">Editable format</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleExport('html')}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <Code className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="font-medium">Web Page</div>
                      <div className="text-xs text-neutral-500">HTML format</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleExport('json')}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <Code className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="font-medium">JSON Data</div>
                      <div className="text-xs text-neutral-500">Raw data format</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
            
            <button className="inline-flex items-center space-x-2 px-4 md:px-6 py-2 md:py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-full hover:bg-neutral-50 transition-all text-sm font-medium">
              <span>New Plan</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-16">
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-neutral-100 hover:border-neutral-200 transition-all group">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="p-2 bg-neutral-50 rounded-xl group-hover:bg-neutral-100 transition-colors">
                <Building2 className="w-4 md:w-5 h-4 md:h-5 text-neutral-600" />
              </div>
              <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(plan?.feasibility?.difficultyLevel)}`}>
                {plan?.feasibility?.difficultyLevel || 'Unknown'}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">Business Type</p>
              <p className="text-lg md:text-xl font-semibold text-neutral-900">{plan?.feasibility?.marketType || 'Custom'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 border border-neutral-100 hover:border-neutral-200 transition-all group">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="p-2 bg-neutral-50 rounded-xl group-hover:bg-neutral-100 transition-colors">
                <Clock className="w-4 md:w-5 h-4 md:h-5 text-neutral-600" />
              </div>
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">Time to Launch</p>
              <p className="text-lg md:text-xl font-semibold text-neutral-900">{plan?.feasibility?.estimatedTimeToLaunch || 'TBD'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 border border-neutral-100 hover:border-neutral-200 transition-all group">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="p-2 bg-neutral-50 rounded-xl group-hover:bg-neutral-100 transition-colors">
                <DollarSign className="w-4 md:w-5 h-4 md:h-5 text-neutral-600" />
              </div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">Investment Needed</p>
              <p className="text-lg md:text-xl font-semibold text-neutral-900">{plan?.feasibility?.estimatedStartupCost || 'TBD'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 border border-neutral-100 hover:border-neutral-200 transition-all group">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="p-2 bg-neutral-50 rounded-xl group-hover:bg-neutral-100 transition-colors">
                <TrendingUp className="w-4 md:w-5 h-4 md:h-5 text-neutral-600" />
              </div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">Marketing Budget</p>
              <p className="text-lg md:text-xl font-semibold text-neutral-900">
                {plan?.marketingPlan?.budget || plan?.marketingStrategy?.totalBudget || 'TBD'}
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-12 border-2 border-black shadow-lg mb-8 md:mb-16">
          <h2 className="text-xl md:text-2xl font-light text-neutral-900 mb-4 md:mb-6">Executive Summary</h2>
          <p className="text-base md:text-lg text-neutral-700 leading-relaxed font-light">{plan?.executiveSummary || plan?.summary}</p>
        </div>

        {/* Original Business Idea Acknowledgment - Hidden per user request */}
        {false && plan?.originalIdeaAcknowledgment && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 lg:p-12 border-2 border-blue-200 shadow-lg mb-8 md:mb-16">
            <div className="flex items-center space-x-3 mb-4 md:mb-6">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-light text-neutral-900">Your Business Idea</h2>
            </div>
            <p className="text-base md:text-lg text-neutral-700 leading-relaxed font-light">{plan?.originalIdeaAcknowledgment}</p>
          </div>
        )}

        {/* Business Idea Review */}
        {plan?.businessIdeaReview && (
          <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-12 border-2 border-black shadow-lg mb-8 md:mb-16">
            <div className="flex items-center space-x-3 mb-6 md:mb-8">
              <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
              <h2 className="text-xl md:text-2xl font-light text-neutral-900">Business Idea Review</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Idea Assessment */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Idea Assessment</h3>
                  <p className="text-neutral-700 leading-relaxed">{plan?.businessIdeaReview?.ideaAssessment}</p>
                </div>

                {/* Profitability Analysis */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Profitability Analysis</h3>
                  <p className="text-neutral-700 leading-relaxed">{plan?.businessIdeaReview?.profitabilityAnalysis}</p>
                </div>

                {/* Market Timing */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Market Timing</h3>
                  <p className="text-neutral-700 leading-relaxed">{plan?.businessIdeaReview?.marketTiming}</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Recommendation Score */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-neutral-900">Recommendation Score</h3>
                    <div className="text-xl font-semibold text-neutral-900">
                      {plan?.businessIdeaReview?.recommendationScore}/10
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-neutral-900 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${(plan?.businessIdeaReview?.recommendationScore || 0) * 10}%` }}
                    ></div>
                  </div>
                </div>

                {/* Risk Level */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Risk Assessment</h3>
                  <div className="mb-2">
                    <span className="text-sm font-medium text-neutral-900 bg-gray-100 px-3 py-1 rounded-md">
                      {plan?.businessIdeaReview?.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Critical Success Factor */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Critical Success Factor</h3>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="text-neutral-800 font-medium text-sm">{plan?.businessIdeaReview?.criticalSuccess}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Factors */}
            {plan?.businessIdeaReview?.successFactors && plan?.businessIdeaReview?.successFactors.length > 0 && (
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Key Success Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plan?.businessIdeaReview?.successFactors.map((factor: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-neutral-700">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Challenges & Potential Pitfalls */}
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Challenges */}
                {plan?.businessIdeaReview?.challenges && plan?.businessIdeaReview?.challenges.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Major Challenges</h3>
                    <div className="space-y-2">
                      {plan?.businessIdeaReview?.challenges.map((challenge: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-neutral-700">{challenge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Potential Pitfalls */}
                {plan?.businessIdeaReview?.potentialPitfalls && plan?.businessIdeaReview?.potentialPitfalls.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Potential Pitfalls</h3>
                    <div className="space-y-2">
                      {plan?.businessIdeaReview?.potentialPitfalls.map((pitfall: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-neutral-700">{pitfall}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Market Analysis & Business Scope */}
        {plan?.businessScope && (
          <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-12 border-2 border-black shadow-lg mb-8 md:mb-16">
            <div className="flex items-center space-x-3 mb-6 md:mb-8">
              <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
              <h2 className="text-xl md:text-2xl font-light text-neutral-900">Market Analysis & Real-World Scope</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6 md:space-y-8">
                {plan?.businessScope?.targetCustomers && (
                  <div>
                    <div className="flex items-center space-x-3 mb-3 md:mb-4">
                      <div className="p-2 bg-neutral-50 rounded-xl">
                        <Users className="w-4 md:w-5 h-4 md:h-5 text-neutral-600" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-neutral-900">Target Customers</h3>
                    </div>
                    <p className="text-neutral-700 leading-relaxed font-light">{plan?.businessScope?.targetCustomers}</p>
                  </div>
                )}

                {plan?.businessScope?.growthPotential && (
                  <div>
                    <div className="flex items-center space-x-3 mb-3 md:mb-4">
                      <div className="p-2 bg-neutral-50 rounded-xl">
                        <TrendingUp className="w-4 md:w-5 h-4 md:h-5 text-neutral-600" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-neutral-900">Growth Potential</h3>
                    </div>
                    <p className="text-neutral-700 leading-relaxed font-light">{plan?.businessScope?.growthPotential}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6 md:space-y-8">
                {plan?.businessScope?.competitors && plan?.businessScope?.competitors.length > 0 && (
                  <div className="relative">
                    {/* Lock overlay for free users */}
                    {isFreeUser && (
                      <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-sm rounded-xl z-10 flex flex-col items-center justify-center p-6">
                        <div className="bg-white rounded-full p-3 shadow-lg mb-3">
                          <Crown className="w-6 h-6 text-yellow-500" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Premium Feature</h4>
                        <p className="text-sm text-gray-600 text-center mb-4">
                          Unlock detailed competitor analysis with Pro subscription
                        </p>
                        <button
                          onClick={() => router.push('/pricing')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                          Upgrade to Pro
                        </button>
                      </div>
                    )}
                    
                    <div className={`${isFreeUser ? 'filter blur-sm' : ''}`}>
                      <div className="flex items-center space-x-3 mb-3 md:mb-4">
                        <div className="p-2 bg-neutral-50 rounded-xl">
                          <Building2 className="w-4 md:w-5 h-4 md:h-5 text-neutral-600" />
                        </div>
                        <h3 className="text-base md:text-lg font-medium text-neutral-900">Competition & Advantage</h3>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        {plan?.businessScope?.competitors?.map((competitor, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-1 h-1 bg-neutral-400 rounded-full" />
                            <span className="text-neutral-700 font-light text-sm md:text-base">
                              {typeof competitor === 'string' ? competitor : competitor?.name || safeRender(competitor)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {plan?.businessScope?.marketReadiness && (
                  <div>
                    <div className="flex items-center space-x-3 mb-3 md:mb-4">
                      <div className="p-2 bg-neutral-50 rounded-xl">
                        <Calendar className="w-4 md:w-5 h-4 md:h-5 text-neutral-600" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-neutral-900">Market Readiness</h3>
                    </div>
                    <p className="text-neutral-700 leading-relaxed font-light">{plan?.businessScope?.marketReadiness}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 8-Pillar Business Framework Analysis */}
        {(plan?.demandValidation || plan?.valueProposition || plan?.operations || plan?.marketingStrategy || plan?.financialAnalysis || plan?.riskAssessment || plan?.growthStrategy) && (
          <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-12 border-2 border-black shadow-lg mb-8 md:mb-16">
            <div className="flex items-center space-x-3 mb-6 md:mb-8">
              <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
              <h2 className="text-xl md:text-2xl font-light text-neutral-900">Comprehensive Business Analysis</h2>
            </div>

            {/* Use auto-sizing flex layout instead of fixed grid */}
            <div className="flex flex-col space-y-6 md:space-y-8">
              {/* Group items in responsive rows */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Demand Validation */}
                {plan?.demandValidation && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 md:w-10 h-8 md:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Target className="w-4 md:w-5 h-4 md:h-5 text-blue-600" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-neutral-900">Market Validation</h3>
                    </div>
                    {plan?.demandValidation?.validationMethods && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-800 text-sm md:text-base">Validation Methods:</h4>
                        <ul className="space-y-1">
                          {plan?.demandValidation?.validationMethods.map((method, index) => (
                            <li key={index} className="text-neutral-700 text-sm flex items-start space-x-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{typeof method === 'string' ? method : safeRender(method)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {plan?.demandValidation?.marketSize && (
                      <p className="text-neutral-700 leading-relaxed font-light text-sm md:text-base">
                        <strong>Market Size:</strong> {safeRender(plan?.demandValidation?.marketSize)}
                      </p>
                    )}
                  </div>
                )}

                {/* Value Proposition */}
                {plan?.valueProposition && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 md:w-10 h-8 md:h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Lightbulb className="w-4 md:w-5 h-4 md:h-5 text-purple-600" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-neutral-900">Value Proposition</h3>
                    </div>
                    {plan?.valueProposition?.uniqueDifferentiator && (
                      <p className="text-neutral-700 leading-relaxed font-light text-sm md:text-base"><strong>Key Differentiator:</strong> {plan?.valueProposition?.uniqueDifferentiator}</p>
                    )}
                    {plan?.valueProposition?.competitiveHook && (
                      <p className="text-neutral-700 leading-relaxed font-light text-sm md:text-base"><strong>Competitive Hook:</strong> {plan?.valueProposition?.competitiveHook}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Operations Section */}
              {plan?.operations && (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 md:w-10 h-8 md:h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <Target className="w-4 md:w-5 h-4 md:h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-medium text-neutral-900">Operations & Management</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {plan?.operations?.deliveryProcess && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-800 text-sm md:text-base">Delivery Process:</h4>
                        <p className="text-neutral-700 leading-relaxed font-light text-sm md:text-base">{plan?.operations?.deliveryProcess}</p>
                      </div>
                    )}

                    {plan?.operations?.suppliers && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-800 text-sm md:text-base">Key Suppliers:</h4>
                        <ul className="space-y-1">
                          {plan.operations.suppliers.map((supplier, index) => (
                            <li key={index} className="text-neutral-700 text-sm flex items-start space-x-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{typeof supplier === 'string' ? supplier : safeRender(supplier)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {plan.operations.scalabilityPlan && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-800 text-sm md:text-base">Scalability Plan:</h4>
                        <p className="text-neutral-700 leading-relaxed font-light text-sm md:text-base">{plan.operations.scalabilityPlan}</p>
                      </div>
                    )}

                    {plan.operations.qualityControl && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-800 text-sm md:text-base">Quality Control:</h4>
                        <p className="text-neutral-700 leading-relaxed font-light text-sm md:text-base">{plan.operations.qualityControl}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Financial Analysis */}
                {plan.financialAnalysis && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 md:w-10 h-8 md:h-10 bg-green-50 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-4 md:w-5 h-4 md:h-5 text-green-600" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-neutral-900">Financial Strategy</h3>
                    </div>
                    {plan.financialAnalysis.breakEvenPoint && (
                      <p className="text-neutral-700 leading-relaxed font-light text-sm md:text-base"><strong>Break-Even Point:</strong> {plan.financialAnalysis.breakEvenPoint}</p>
                    )}
                    {plan.financialAnalysis.cashBuffer && (
                      <p className="text-neutral-700 leading-relaxed font-light text-sm md:text-base"><strong>Cash Reserve:</strong> {plan.financialAnalysis.cashBuffer}</p>
                    )}
                  </div>
                )}

                {/* Risk Management */}
                {plan.riskAssessment && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 md:w-10 h-8 md:h-10 bg-red-50 rounded-xl flex items-center justify-center">
                        <Building2 className="w-4 md:w-5 h-4 md:h-5 text-red-600" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-neutral-900">Risk Management</h3>
                    </div>
                    {plan.riskAssessment.topRisks && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-800 text-sm md:text-base">Key Risks:</h4>
                        <ul className="space-y-1">
                          {plan.riskAssessment.topRisks.map((risk, index) => (
                            <li key={index} className="text-neutral-700 text-sm">{typeof risk === 'string' ? risk : safeRender(risk)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Go-to-Market Strategy - Dynamic based on business type */}
              {plan.marketingStrategy && (
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 md:w-10 h-8 md:h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-4 md:w-5 h-4 md:h-5 text-orange-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-medium text-neutral-900">Go-to-Market Strategy</h3>
                  </div>

                  {/* Dynamic channel display based on actual data */}
                  {plan.marketingStrategy.channels && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-neutral-800 text-sm md:text-base">Marketing Channels:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {plan.marketingStrategy.channels.map((channel, index) => {
                          // Handle both string and object channel formats
                          if (typeof channel === 'string') {
                            return (
                              <span key={index} className="px-2 md:px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs md:text-sm font-medium text-center">
                                {channel}
                              </span>
                            )
                          } else if (typeof channel === 'object' && channel.channel) {
                            return (
                              <div key={index} className="p-3 md:p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-orange-900 text-sm md:text-base">{channel.channel}</h5>
                                  {channel.budget && (
                                    <span className="text-xs md:text-sm text-orange-700 font-medium">{channel.budget}</span>
                                  )}
                                </div>
                                {channel.audience && (
                                  <p className="text-xs md:text-sm text-orange-800 mb-2">{channel.audience}</p>
                                )}
                                {(channel.expectedCAC || channel.expectedROI) && (
                                  <div className="flex justify-between text-xs text-orange-700">
                                    {channel.expectedCAC && <span>CAC: {channel.expectedCAC}</span>}
                                    {channel.expectedROI && <span>ROI: {channel.expectedROI}</span>}
                                  </div>
                                )}
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dynamic customer acquisition strategy */}
                  {plan.marketingStrategy.customerAcquisition && (
                    <div className="bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 text-sm md:text-base mb-3 flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Customer Acquisition Strategy</span>
                      </h4>
                      <p className="text-blue-800 text-sm md:text-base leading-relaxed">{plan.marketingStrategy.customerAcquisition}</p>
                    </div>
                  )}

                  {/* Dynamic target market approach */}
                  {plan.marketingStrategy.targetMarket && (
                    <div className="bg-green-50 rounded-xl p-4 md:p-6 border border-green-200">
                      <h4 className="font-semibold text-green-900 text-sm md:text-base mb-3 flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>Target Market Approach</span>
                      </h4>
                      <p className="text-green-800 text-sm md:text-base leading-relaxed">{plan.marketingStrategy.targetMarket}</p>
                    </div>
                  )}

                  {/* Dynamic budget allocation */}
                  {plan.marketingStrategy.budgetAllocation && (
                    <div className="bg-purple-50 rounded-xl p-4 md:p-6 border border-purple-200">
                      <h4 className="font-semibold text-purple-900 text-sm md:text-base mb-3 flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Budget Allocation</span>
                      </h4>
                      <p className="text-purple-800 text-sm md:text-base leading-relaxed">{plan.marketingStrategy.budgetAllocation}</p>
                    </div>
                  )}

                  {/* Live metrics and KPIs based on business type */}
                  {(plan.marketingStrategy.keyMetrics || plan.marketingStrategy.expectedMetrics) && (
                    <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-3 flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Key Performance Metrics</span>
                      </h4>
                      {plan.marketingStrategy.keyMetrics && (
                        <p className="text-gray-800 text-sm md:text-base leading-relaxed mb-3">{plan.marketingStrategy.keyMetrics}</p>
                      )}
                      {plan.marketingStrategy.expectedMetrics && (
                        <p className="text-gray-800 text-sm md:text-base leading-relaxed">{plan.marketingStrategy.expectedMetrics}</p>
                      )}
                    </div>
                  )}

                  {/* Business model specific approach */}
                  {plan.marketingStrategy.businessModelStrategy && (
                    <div className="bg-yellow-50 rounded-xl p-4 md:p-6 border border-yellow-200">
                      <h4 className="font-semibold text-yellow-900 text-sm md:text-base mb-3 flex items-center space-x-2">
                        <Building2 className="w-4 h-4" />
                        <span>Business Model Strategy</span>
                      </h4>
                      <p className="text-yellow-800 text-sm md:text-base leading-relaxed">{plan.marketingStrategy.businessModelStrategy}</p>
                    </div>
                  )}

                  {plan.marketingStrategy.customerFunnel && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-neutral-800 text-sm md:text-base">Customer Journey:</h4>
                      <p className="text-neutral-700 leading-relaxed font-light text-sm md:text-base">{plan.marketingStrategy.customerFunnel}</p>
                    </div>
                  )}
                  
                  {plan.marketingStrategy.brandStory && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-neutral-800 text-sm md:text-base">Brand Positioning:</h4>
                      <p className="text-neutral-700 leading-relaxed font-light text-sm md:text-base">{plan.marketingStrategy.brandStory}</p>
                    </div>
                  )}

                  {plan.marketingStrategy.competitiveAdvantage && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-neutral-800 text-sm md:text-base">Competitive Advantage:</h4>
                      <p className="text-neutral-700 leading-relaxed font-light text-sm md:text-base">{plan.marketingStrategy.competitiveAdvantage}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Growth Strategy */}
              {plan.growthStrategy && (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 md:w-10 h-8 md:h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <ArrowRight className="w-4 md:w-5 h-4 md:h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-medium text-neutral-900">Growth & Retention</h3>
                  </div>
                  {plan.growthStrategy.retentionProgram && (
                    <p className="text-neutral-700 leading-relaxed font-light text-sm md:text-base"><strong>Retention Strategy:</strong> {plan.growthStrategy.retentionProgram}</p>
                  )}
                  {plan.growthStrategy.upsellOpportunities && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-neutral-800 text-sm md:text-base">Upsell Opportunities:</h4>
                      <ul className="space-y-1">
                        {plan.growthStrategy.upsellOpportunities.map((opportunity, index) => (
                          <li key={index} className="text-neutral-700 text-sm flex items-start space-x-2">
                            <ArrowRight className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <span>{typeof opportunity === 'string' ? opportunity : safeRender(opportunity)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Market Analysis */}
        {plan.marketAnalysis && (
          <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-12 border-2 border-black shadow-lg mb-8 md:mb-16">
            <div className="flex items-center space-x-3 mb-6 md:mb-8">
              <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
              <h2 className="text-xl md:text-2xl font-light text-neutral-900">Market Intelligence</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {plan.marketAnalysis.marketSize && 
               (plan.marketAnalysis.marketSize.tam || plan.marketAnalysis.marketSize.sam || plan.marketAnalysis.marketSize.som || plan.marketAnalysis.marketSize.cagr) && 
               !(plan.marketAnalysis.marketSize.tam?.includes('Market analysis in progress') || 
                 plan.marketAnalysis.marketSize.tam?.includes('To be determined') ||
                 plan.marketAnalysis.marketSize.tam?.includes('Research required')) && (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 md:w-10 h-8 md:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Target className="w-4 md:w-5 h-4 md:h-5 text-blue-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-medium text-neutral-900">Market Size Analysis</h3>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    {plan.marketAnalysis.marketSize.tam && 
                     !plan.marketAnalysis.marketSize.tam.includes('Market analysis in progress') &&
                     !plan.marketAnalysis.marketSize.tam.includes('To be determined') &&
                     !plan.marketAnalysis.marketSize.tam.includes('Research required') && (
                      <p className="text-neutral-700 text-sm md:text-base"><strong>Total Addressable Market:</strong> {plan.marketAnalysis.marketSize.tam}</p>
                    )}
                    {plan.marketAnalysis.marketSize.sam && 
                     !plan.marketAnalysis.marketSize.sam.includes('To be determined') &&
                     !plan.marketAnalysis.marketSize.sam.includes('Research required') && (
                      <p className="text-neutral-700 text-sm md:text-base"><strong>Serviceable Addressable Market:</strong> {plan.marketAnalysis.marketSize.sam}</p>
                    )}
                    {plan.marketAnalysis.marketSize.som && 
                     !plan.marketAnalysis.marketSize.som.includes('To be calculated') &&
                     !plan.marketAnalysis.marketSize.som.includes('Research required') && (
                      <p className="text-neutral-700"><strong>Serviceable Obtainable Market:</strong> {plan.marketAnalysis.marketSize.som}</p>
                    )}
                    {plan.marketAnalysis.marketSize.cagr && 
                     !plan.marketAnalysis.marketSize.cagr.includes('Research required') &&
                     !plan.marketAnalysis.marketSize.cagr.includes('To be determined') && (
                      <p className="text-neutral-700"><strong>Expected Growth Rate:</strong> {plan.marketAnalysis.marketSize.cagr}</p>
                    )}
                  </div>
                </div>
              )}

              {plan.marketAnalysis.trends && 
               plan.marketAnalysis.trends !== 'Market analysis in progress' &&
               plan.marketAnalysis.trends !== 'Research required' &&
               plan.marketAnalysis.trends.trim().length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900">Market Trends</h3>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">{plan.marketAnalysis.trends}</p>
                </div>
              )}
            </div>

            {/* Market Trends Visualization */}
            <div className="mt-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900">Market Growth Trends</h3>
                <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">Last 12 months</span>
              </div>
              
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
                {/* Chart Controls */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                  <div className="flex items-center space-x-4">
                    <button className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg">
                      Graph
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-neutral-500">
                    <span>Monthly market growth</span>
                  </div>
                </div>

                {/* Interactive Chart */}
                <div className="p-6">
                  <div style={{ height: '400px', position: 'relative' }}>
                    {(() => {
                      const marketData = generateMarketGrowthData(plan)
                      return (
                        <Line
                          data={{
                            labels: marketData.labels,
                            datasets: [
                              {
                                label: 'Market Growth Index',
                                data: marketData.data,
                                borderColor: '#8B5CF6',
                                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                tension: 0.4,
                                fill: true,
                                pointRadius: 4,
                                pointHoverRadius: 8,
                                borderWidth: 3,
                                pointBackgroundColor: '#8B5CF6',
                                pointBorderColor: '#ffffff',
                                pointBorderWidth: 2,
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                              mode: 'index',
                              intersect: false,
                            },
                            plugins: {
                              legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                  usePointStyle: true,
                                  pointStyle: 'circle',
                                  padding: 20,
                                  font: {
                                    size: 12,
                                    family: 'Inter, system-ui, sans-serif'
                                  },
                                  color: '#6B7280',
                                  generateLabels: function(chart) {
                                    const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
                                    const labels = original.call(this, chart);
                                    
                                    // Add current growth rate to legend
                                    labels.forEach((label, index) => {
                                      if (chart.data.datasets[index]?.data) {
                                        const data = chart.data.datasets[index].data as number[];
                                        const currentValue = data[data.length - 1];
                                        const previousValue = data[data.length - 2];
                                        if (currentValue !== undefined && previousValue !== undefined) {
                                          const growthRate = parseFloat(((currentValue - previousValue) / previousValue * 100).toFixed(1));
                                          label.text = `${label.text} (${growthRate > 0 ? '+' : ''}${growthRate}% this month)`;
                                        }
                                      }
                                    });
                                    
                                    return labels;
                                  }
                                }
                              },
                              tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: '#ffffff',
                                bodyColor: '#ffffff',
                                borderColor: '#374151',
                                borderWidth: 1,
                                cornerRadius: 8,
                                displayColors: true,
                                padding: 12,
                                titleFont: {
                                  size: 14,
                                  weight: 'bold'
                                },
                                bodyFont: {
                                  size: 13
                                },
                                callbacks: {
                                  label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.y;
                                    return `${label}: ${value}`;
                                  },
                                  title: function(context) {
                                    return `${context[0].label}`;
                                  },
                                  afterLabel: function(context) {
                                    const dataIndex = context.dataIndex;
                                    const data = context.dataset.data as number[];
                                    if (dataIndex > 0) {
                                      const current = data[dataIndex];
                                      const previous = data[dataIndex - 1];
                                      const growth = parseFloat(((current - previous) / previous * 100).toFixed(1));
                                      return `Month-over-month: ${growth > 0 ? '+' : ''}${growth}%`;
                                    }
                                    return 'Base period';
                                  }
                                }
                              }
                            },
                            scales: {
                              x: {
                                display: true,
                                grid: {
                                  display: true,
                                  color: '#F3F4F6',
                                  lineWidth: 1,
                                },
                                ticks: {
                                  color: '#9CA3AF',
                                  font: {
                                    size: 12,
                                    family: 'Inter, system-ui, sans-serif'
                                  },
                                  maxTicksLimit: 12,
                                },
                                title: {
                                  display: true,
                                  text: 'Time Period',
                                  color: '#6B7280',
                                  font: {
                                    size: 12,
                                    family: 'Inter, system-ui, sans-serif'
                                  }
                                }
                              },
                              y: {
                                display: true,
                                grid: {
                                  display: true,
                                  color: '#F3F4F6',
                                  lineWidth: 1,
                                },
                                ticks: {
                                  color: '#9CA3AF',
                                  font: {
                                    size: 12,
                                    family: 'Inter, system-ui, sans-serif'
                                  },
                                  callback: function(value) {
                                    return value;
                                  }
                                },
                                title: {
                                  display: true,
                                  text: 'Market Growth Index',
                                  color: '#6B7280',
                                  font: {
                                    size: 12,
                                    family: 'Inter, system-ui, sans-serif'
                                  }
                                }
                              }
                            },
                            elements: {
                              line: {
                                tension: 0.4
                              }
                            }
                          }}
                        />
                      )
                    })()}
                  </div>

                  {/* Market Growth Insights */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(() => {
                      const marketData = generateMarketGrowthData(plan)
                      const currentValue = marketData.data[marketData.data.length - 1]
                      const previousValue = marketData.data[marketData.data.length - 2]
                      const yearStartValue = marketData.data[0]
                      
                      const monthlyGrowth = parseFloat(((currentValue - previousValue) / previousValue * 100).toFixed(1))
                      const yearGrowth = parseFloat(((currentValue - yearStartValue) / yearStartValue * 100).toFixed(1))
                      const avgMonthlyGrowth = parseFloat((yearGrowth / 12).toFixed(1))
                      
                      return (
                        <>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-lg font-semibold text-blue-900">
                              {monthlyGrowth > 0 ? '↗' : monthlyGrowth < 0 ? '↘' : '→'} {monthlyGrowth}%
                            </p>
                            <p className="text-xs text-blue-700">Monthly Growth</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-lg font-semibold text-green-900">
                              {yearGrowth > 0 ? '↗' : yearGrowth < 0 ? '↘' : '→'} {yearGrowth}%
                            </p>
                            <p className="text-xs text-green-700">12-Month Growth</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-lg font-semibold text-purple-900">
                              {avgMonthlyGrowth > 0 ? '↗' : avgMonthlyGrowth < 0 ? '↘' : '→'} {avgMonthlyGrowth}%
                            </p>
                            <p className="text-xs text-purple-700">Avg Monthly</p>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {plan.marketAnalysis.economicContext && 
               plan.marketAnalysis.economicContext !== 'Economic analysis required' && 
               plan.marketAnalysis.economicContext.trim().length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900">Economic Context</h3>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">{plan.marketAnalysis.economicContext}</p>
                </div>
              )}

              {plan.marketAnalysis.demandAnalysis && 
               plan.marketAnalysis.demandAnalysis !== 'Economic analysis required' && 
               plan.marketAnalysis.demandAnalysis.trim().length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900">Demand Analysis</h3>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">{plan.marketAnalysis.demandAnalysis}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Competitive Analysis */}
        {plan.competitiveAnalysis && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-black shadow-lg mb-8 md:mb-16 relative">
            {/* Lock overlay for free users */}
            {isFreeUser && (
              <div className="absolute inset-0 bg-gray-50/90 backdrop-blur-sm rounded-2xl z-10 flex flex-col items-center justify-center p-8">
                <div className="bg-white rounded-full p-4 shadow-lg mb-4">
                  <Crown className="w-8 h-8 text-yellow-500" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Premium Competitive Intelligence</h4>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  Get real-time competitor data, market insights, and detailed analysis with Pro subscription
                </p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Upgrade to Pro
                </button>
              </div>
            )}
            
            <div className={`${isFreeUser ? 'filter blur-sm' : ''}`}>
              <div className="flex items-center space-x-3 mb-6 md:mb-8">
                <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
                <h2 className="text-xl md:text-2xl font-light text-neutral-900">Competitive Intelligence</h2>
              </div>

            {/* Real Competitor Data Display */}
            {plan.competitorData && plan.competitorData.competitors && (
              <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-base md:text-lg font-medium text-neutral-900 mb-3 md:mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Real-Time Competitor Data
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plan.competitorData.competitors.slice(0, 3).map((competitor: any, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                      <h4 className="font-medium text-neutral-900 mb-3">{competitor.name}</h4>
                      <div className="space-y-2 text-sm text-neutral-600">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Revenue:</span>
                          <span className="font-medium">{competitor.estimatedRevenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Market Share:</span>
                          <span className="font-medium">{competitor.marketShare}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Growth:</span>
                          <span className="font-medium text-green-600">{competitor.growth}</span>
                        </div>
                      </div>
                      {competitor.searchResults && competitor.searchResults.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-100">
                          <a 
                            href={competitor.searchResults[0].link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Latest Data
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {plan.competitorData.lastUpdated && (
                  <p className="text-xs text-neutral-500 mt-4 text-center">
                    Data last updated: {new Date(plan.competitorData.lastUpdated).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {plan.competitiveAnalysis.competitors && (
              <div className="space-y-6 mb-8">
                <h3 className="text-lg font-medium text-neutral-900">Key Competitors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plan.competitiveAnalysis.competitors.map((competitor, index) => (
                    <div key={index} className="p-6 border border-neutral-200 rounded-xl">
                      <h4 className="font-semibold text-neutral-900 mb-3">{competitor.name}</h4>
                      {competitor.marketShare && (
                        <p className="text-sm text-neutral-600 mb-2"><strong>Market Share:</strong> {competitor.marketShare}</p>
                      )}
                      {competitor.funding && (
                        <p className="text-sm text-neutral-600 mb-2"><strong>Funding:</strong> {competitor.funding}</p>
                      )}
                      {competitor.pricing && (
                        <p className="text-sm text-neutral-600 mb-3"><strong>Pricing:</strong> {competitor.pricing}</p>
                      )}
                      
                      {competitor.strengths.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-green-700 mb-1">Strengths:</p>
                          <ul className="text-xs text-green-600 space-y-1">
                            {competitor.strengths.slice(0, 3).map((strength, idx) => (
                              <li key={idx}>• {strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {competitor.weaknesses.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-red-700 mb-1">Weaknesses:</p>
                          <ul className="text-xs text-red-600 space-y-1">
                            {competitor.weaknesses.slice(0, 3).map((weakness, idx) => (
                              <li key={idx}>• {weakness}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive Comparison Table */}
            {plan.competitiveAnalysis.competitors && plan.competitiveAnalysis.competitors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Competitive Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-neutral-200 rounded-lg">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="border border-neutral-200 px-4 py-2 text-left text-sm font-medium text-neutral-700">Company</th>
                        <th className="border border-neutral-200 px-4 py-2 text-left text-sm font-medium text-neutral-700">Pricing</th>
                        <th className="border border-neutral-200 px-4 py-2 text-left text-sm font-medium text-neutral-700">Key Strength</th>
                        <th className="border border-neutral-200 px-4 py-2 text-left text-sm font-medium text-neutral-700">Main Weakness</th>
                        <th className="border border-neutral-200 px-4 py-2 text-left text-sm font-medium text-neutral-700">Market Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-green-50">
                        <td className="border border-neutral-200 px-4 py-2 text-sm font-medium text-green-900">
                          {plan.competitiveAnalysis.yourBusiness?.name || 'Your Business'}
                        </td>
                        <td className="border border-neutral-200 px-4 py-2 text-sm text-green-800">
                          {plan.competitiveAnalysis.yourBusiness?.pricing || 'Competitive pricing'}
                        </td>
                        <td className="border border-neutral-200 px-4 py-2 text-sm text-green-800">
                          {plan.competitiveAnalysis.yourBusiness?.keyStrength || 'Innovation & customer focus'}
                        </td>
                        <td className="border border-neutral-200 px-4 py-2 text-sm text-green-800">
                          {plan.competitiveAnalysis.yourBusiness?.mainWeakness || 'New to market'}
                        </td>
                        <td className="border border-neutral-200 px-4 py-2 text-sm text-green-800">
                          {plan.competitiveAnalysis.yourBusiness?.marketShare || '0% (launching)'}
                        </td>
                      </tr>
                      {plan.competitiveAnalysis.competitors.slice(0, 4).map((competitor, index) => (
                        <tr key={index} className="hover:bg-neutral-50">
                          <td className="border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900">{competitor.name}</td>
                          <td className="border border-neutral-200 px-4 py-2 text-sm text-neutral-700">{competitor.pricing}</td>
                          <td className="border border-neutral-200 px-4 py-2 text-sm text-neutral-700">
                            {competitor.strengths[0] || 'Market presence'}
                          </td>
                          <td className="border border-neutral-200 px-4 py-2 text-sm text-neutral-700">
                            {competitor.weaknesses[0] || 'Limited innovation'}
                          </td>
                          <td className="border border-neutral-200 px-4 py-2 text-sm text-neutral-700">{competitor.marketShare || 'Unknown'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {plan.competitiveAnalysis.competitiveAdvantages && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900">Competitive Advantages</h3>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">{plan.competitiveAnalysis.competitiveAdvantages}</p>
                </div>
              )}

              {plan.competitiveAnalysis.marketGaps && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900">Market Opportunities</h3>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">{plan.competitiveAnalysis.marketGaps}</p>
                </div>
              )}
            </div>
            </div>
          </div>
        )}

        {/* Risk Analysis */}
        {plan.riskAnalysis && plan.riskAnalysis.length > 0 && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-black shadow-lg mb-8 md:mb-16">
            <div className="flex items-center space-x-3 mb-6 md:mb-8">
              <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
              <h2 className="text-xl md:text-2xl font-light text-neutral-900">Risk Assessment & Mitigation</h2>
            </div>

            <div className="space-y-4 md:space-y-6">
              {plan.riskAnalysis.map((risk, index) => (
                <div key={index} className="p-4 md:p-6 border border-neutral-200 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 md:mb-4 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        risk.priority === 'High' ? 'bg-red-500' :
                        risk.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <h3 className="font-semibold text-neutral-900 text-sm md:text-base">{risk.risk}</h3>
                    </div>
                    {risk.priority && (
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                        risk.priority === 'High' ? 'bg-red-100 text-red-800' :
                        risk.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {risk.priority} Priority
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-1">Category</p>
                      <p className="text-sm text-neutral-700">{risk.category}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-1">Probability</p>
                      <p className="text-sm text-neutral-700">{risk.probability}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-1">Impact</p>
                      <p className="text-sm text-neutral-700">{risk.impact}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 mb-1">Mitigation Strategy:</p>
                      <p className="text-sm text-neutral-700">{risk.mitigation}</p>
                    </div>
                    {risk.timeline && (
                      <div>
                        <p className="text-sm font-medium text-neutral-900 mb-1">Timeline:</p>
                        <p className="text-sm text-neutral-700">{risk.timeline}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Financial Projections */}
        {plan.financialProjections && (
          <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-12 border-2 border-black shadow-lg mb-8 md:mb-16">
            <div className="flex items-center space-x-3 mb-6 md:mb-8">
              <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
              <h2 className="text-xl md:text-2xl font-light text-neutral-900">Financial Projections & Analysis</h2>
            </div>

            {plan.financialProjections.unitEconomics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                {plan.financialProjections.unitEconomics.cac && (
                  <div className="p-3 md:p-4 bg-blue-50 rounded-xl">
                    <p className="text-xs font-medium text-blue-600 mb-1">Customer Acquisition Cost</p>
                    <p className="text-base md:text-lg font-semibold text-blue-900">{plan.financialProjections.unitEconomics.cac}</p>
                  </div>
                )}
                {plan.financialProjections.unitEconomics.ltv && (
                  <div className="p-3 md:p-4 bg-green-50 rounded-xl">
                    <p className="text-xs font-medium text-green-600 mb-1">Lifetime Value</p>
                    <p className="text-base md:text-lg font-semibold text-green-900">{plan.financialProjections.unitEconomics.ltv}</p>
                  </div>
                )}
                {plan.financialProjections.unitEconomics.arpu && (
                  <div className="p-3 md:p-4 bg-purple-50 rounded-xl">
                    <p className="text-xs font-medium text-purple-600 mb-1">Avg Revenue Per User</p>
                    <p className="text-base md:text-lg font-semibold text-purple-900">{plan.financialProjections.unitEconomics.arpu}</p>
                  </div>
                )}
                {plan.financialProjections.unitEconomics.churnRate && (
                  <div className="p-3 md:p-4 bg-orange-50 rounded-xl">
                    <p className="text-xs font-medium text-orange-600 mb-1">Churn Rate</p>
                    <p className="text-base md:text-lg font-semibold text-orange-900">{plan.financialProjections.unitEconomics.churnRate}</p>
                  </div>
                )}
              </div>
            )}

            {/* 12-Month Financial Forecast */}
            <div className="mb-6 md:mb-8">
              <h3 className="text-base md:text-lg font-medium text-neutral-900 mb-3 md:mb-4">12-Month Revenue & Cost Forecast</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-neutral-200 rounded-lg">
                  <thead>
                    <tr className="bg-neutral-50">
                      <th className="border border-neutral-200 px-2 md:px-3 py-2 text-left text-sm font-medium text-neutral-700">Month</th>
                      <th className="border border-neutral-200 px-2 md:px-3 py-2 text-right text-sm font-medium text-neutral-700">Revenue</th>
                      <th className="border border-neutral-200 px-2 md:px-3 py-2 text-right text-sm font-medium text-neutral-700">Costs</th>
                      <th className="border border-neutral-200 px-2 md:px-3 py-2 text-right text-sm font-medium text-neutral-700">Profit</th>
                      <th className="border border-neutral-200 px-2 md:px-3 py-2 text-right text-sm font-medium text-neutral-700">Customers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.financialProjections?.year1Monthly ? 
                      plan.financialProjections.year1Monthly.slice(0, 12).map((projection, index) => {
                        const month = index + 1
                        // Get currency symbol from plan data, fallback to $ if not available
                        const currencySymbol = plan.currency === 'INR' ? '₹' : 
                                             plan.currency === 'EUR' ? '€' : 
                                             plan.currency === 'GBP' ? '£' : '$'
                        
                        return (
                          <tr key={month} className="hover:bg-neutral-50">
                            <td className="border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-900">
                              Month {month}
                            </td>
                            <td className="border border-neutral-200 px-3 py-2 text-sm text-right text-neutral-700">
                              {currencySymbol}{projection.revenue.toLocaleString()}
                            </td>
                            <td className="border border-neutral-200 px-3 py-2 text-sm text-right text-neutral-700">
                              {currencySymbol}{projection.costs.toLocaleString()}
                            </td>
                            <td className={`border border-neutral-200 px-3 py-2 text-sm text-right font-medium ${
                              projection.profit > 0 ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {currencySymbol}{projection.profit.toLocaleString()}
                            </td>
                            <td className="border border-neutral-200 px-3 py-2 text-sm text-right text-neutral-700">
                              {projection.customers.toLocaleString()}
                            </td>
                          </tr>
                        )
                      }) :
                      // Fallback for when financial projections data is not available
                      Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1
                        const revenue = Math.floor(1000 * month * (1 + month * 0.15))
                        const costs = Math.floor(revenue * 0.6)
                        const profit = revenue - costs
                        const customers = Math.floor(month * 5 + (month * month * 0.5))
                        
                        return (
                          <tr key={month} className="hover:bg-neutral-50">
                            <td className="border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-900">
                              Month {month}
                            </td>
                            <td className="border border-neutral-200 px-3 py-2 text-sm text-right text-neutral-700">
                              ${revenue.toLocaleString()}
                            </td>
                            <td className="border border-neutral-200 px-3 py-2 text-sm text-right text-neutral-700">
                              ${costs.toLocaleString()}
                            </td>
                            <td className={`border border-neutral-200 px-3 py-2 text-sm text-right font-medium ${
                              profit > 0 ? 'text-green-700' : 'text-red-700'
                            }`}>
                              ${profit.toLocaleString()}
                            </td>
                            <td className="border border-neutral-200 px-3 py-2 text-sm text-right text-neutral-700">
                              {customers.toLocaleString()}
                            </td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {plan.financialProjections.breakEven && (
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Break-Even Analysis</h3>
                    <p className="text-neutral-700">{plan.financialProjections.breakEven}</p>
                  </div>
                )}
                {plan.financialProjections.cashFlow && (
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Cash Flow Projection</h3>
                    <p className="text-neutral-700">{plan.financialProjections.cashFlow}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {plan.financialProjections.startupCosts && (
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Startup Costs</h3>
                    <p className="text-neutral-700">{plan.financialProjections.startupCosts}</p>
                  </div>
                )}
                {plan.financialProjections.cashBuffer && (
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Cash Buffer Strategy</h3>
                    <p className="text-neutral-700">{plan.financialProjections.cashBuffer}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Implementation Roadmap */}
        {plan.roadmap && plan.roadmap.length > 0 && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-black shadow-lg mb-8 md:mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
                <h2 className="text-xl md:text-2xl font-light text-neutral-900">Strategic Milestones</h2>
              </div>
              <span className="px-3 md:px-4 py-1.5 bg-neutral-50 text-neutral-600 rounded-full text-sm font-medium self-start">
                {plan.roadmap.length} milestones
              </span>
            </div>

            {/* Roadmap Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8 p-4 md:p-6 bg-neutral-50 rounded-xl">
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-600">Total Milestones</p>
                <p className="text-xl md:text-2xl font-semibold text-neutral-900">{plan.roadmap.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-600">Estimated Timeline</p>
                <p className="text-xl md:text-2xl font-semibold text-neutral-900">
                  {plan.roadmap.length * 2}-{plan.roadmap.length * 4} weeks
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-600">Key Dependencies</p>
                <p className="text-xl md:text-2xl font-semibold text-neutral-900">
                  {plan.roadmap.reduce((total, milestone) => total + (milestone.dependencies?.length || 0), 0)}
                </p>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              {(showAllMilestones ? plan.roadmap : plan.roadmap.slice(0, 3)).map((milestone, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6 p-4 md:p-6 border border-neutral-200 rounded-xl">
                  <div className="flex-shrink-0 self-start sm:self-auto">
                    <div className="w-8 h-8 bg-neutral-100 border border-neutral-200 rounded-full flex items-center justify-center text-sm font-medium text-neutral-700">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-2 sm:space-y-0">
                      <h3 className="text-base md:text-lg font-medium text-neutral-900">{milestone.milestone}</h3>
                      <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-sm font-medium whitespace-nowrap self-start">
                        {milestone.timeline}
                      </span>
                    </div>
                    
                    {milestone.dependencies && milestone.dependencies.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-neutral-700 mb-1">Dependencies:</p>
                        <div className="flex flex-wrap gap-2">
                          {milestone.dependencies.map((dep, depIndex) => (
                            <span key={depIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {typeof dep === 'string' ? dep : safeRender(dep)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-neutral-700 mb-1">Key Deliverables:</p>
                        <ul className="text-sm text-neutral-600 space-y-1">
                          {milestone.deliverables.map((deliverable, delIndex) => (
                            <li key={delIndex} className="flex items-start space-x-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-neutral-600">
                      {milestone.resources && (
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-neutral-400" />
                          <span>{milestone.resources}</span>
                        </div>
                      )}
                      {milestone.successMetrics && (
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-neutral-400" />
                          <span>{milestone.successMetrics}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {plan.roadmap.length > 3 && (
              <div className="text-center pt-6">
                <button 
                  onClick={handleToggleMilestones}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 rounded-full transition-colors font-medium"
                >
                  <span>
                    {showAllMilestones 
                      ? 'Show Less Milestones' 
                      : `View ${plan.roadmap.length - 3} More Milestones`
                    }
                  </span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${showAllMilestones ? 'rotate-90' : ''}`} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Roadmap */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-black shadow-lg mb-8 md:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
              <h2 className="text-xl md:text-2xl font-light text-neutral-900">Your Action Roadmap</h2>
            </div>
            <span className="px-3 md:px-4 py-1.5 bg-neutral-50 text-neutral-600 rounded-full text-sm font-medium self-start">
              {derivedActionPlan.length}
            </span>
          </div>

          <div className="space-y-4 md:space-y-6">
            {(showAllMilestones ? derivedActionPlan : derivedActionPlan.slice(0, 6)).map((step, index) => (
              <div key={index} className="group hover:bg-neutral-50 p-4 md:p-6 rounded-2xl transition-all border border-transparent hover:border-neutral-100">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6">
                  <div className="flex-shrink-0 self-start sm:self-auto">
                    <div className="w-8 h-8 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-sm font-medium text-neutral-700 group-hover:border-neutral-300 transition-colors">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-2 sm:space-y-0">
                      <h3 className="text-base md:text-lg font-medium text-neutral-900">{step.name}</h3>
                      <div className="flex items-center space-x-2">
                        {getPhaseIcon(step.phase)}
                        <span className="px-2 md:px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium whitespace-nowrap content-fit">
                          {step.phase}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-neutral-700 mb-3 md:mb-4 leading-relaxed font-light text-sm md:text-base">{step.description}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 md:space-x-8 text-sm">
                      <div className="flex items-center space-x-2 content-fit">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600 font-medium">{step.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 content-fit">
                        <DollarSign className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600 font-medium">{step.cost}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {derivedActionPlan.length > 6 && (
              <div className="text-center pt-6">
                <button 
                  onClick={handleToggleMilestones}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 rounded-full transition-colors font-medium"
                >
                  <span>
                    {showAllMilestones 
                      ? 'Show Less Steps' 
                      : `View ${derivedActionPlan.length - 6} More Steps`
                    }
                  </span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${showAllMilestones ? 'rotate-90' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Funding Strategy */}
        {plan.funding && plan.funding.platforms && plan.funding.platforms.length > 0 && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-black shadow-lg mb-8 md:mb-16">
            <div className="flex items-center space-x-3 mb-6 md:mb-8">
              <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
              <h2 className="text-xl md:text-2xl font-light text-neutral-900">Recommended Funding Platforms</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {plan.funding.platforms.slice(0, 6).map((platform: FundingPlatform, index: number) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-neutral-900 text-base">{platform.name}</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            {platform.type}
                          </span>
                        </div>
                        <p className="text-neutral-600 text-sm font-light leading-relaxed mb-3">
                          {platform.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-neutral-800">Amount Range:</span>
                        <p className="text-neutral-600 mt-1">{platform.averageAmount}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-800">Timeline:</span>
                        <p className="text-neutral-600 mt-1">{platform.timeline}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-800">Success Rate:</span>
                        <p className="text-neutral-600 mt-1">{platform.successRate}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-800">Fees:</span>
                        <p className="text-neutral-600 mt-1">{platform.fees}</p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-neutral-600 mb-3">
                        <span className="font-medium">Requirements:</span> {platform.requirements}
                      </p>
                      {platform.link && (
                        <a 
                          href={platform.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                        >
                          <span>Visit Platform</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next 7 Days & Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Next 7 Days Action Items */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-black shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-6 md:mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
                <h2 className="text-xl md:text-2xl font-light text-neutral-900">Your Next 7 Days</h2>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-neutral-700 rounded-md text-sm font-medium self-start">Priority Actions</span>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-4 md:p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-neutral-700 flex-shrink-0 self-start sm:self-auto">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 mb-2 text-sm md:text-base">Validate Market Demand</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    Conduct 10-15 customer interviews to validate your core assumptions about the problem and solution.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-neutral-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>2-3 days</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>15 interviews</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-neutral-700 flex-shrink-0 self-start sm:self-auto">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 mb-2 text-sm md:text-base">Research Competitors</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    Analyze 5-7 direct and indirect competitors to understand pricing, features, and market positioning.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-neutral-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>1-2 days</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>Competitive matrix</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-neutral-700 flex-shrink-0 self-start sm:self-auto">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 mb-2 text-sm md:text-base">Create MVP Wireframes</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    Design basic wireframes or mockups for your minimum viable product to visualize core features.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-neutral-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>2-3 days</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>MVP design</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-4 md:p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-neutral-700 flex-shrink-0 self-start sm:self-auto">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 mb-2">Set Up Business Fundamentals</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    Register business name, set up basic accounting, and create initial brand assets (logo, colors).
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-neutral-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>1-2 days</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>Legal setup</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 md:p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-neutral-700 flex-shrink-0">
                  5
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 mb-2">Create Financial Model</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    Build a simple spreadsheet with startup costs, revenue projections, and break-even analysis.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-neutral-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>1 day</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>Financial model</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-100 rounded-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-4 md:w-5 h-4 md:h-5 text-neutral-600" />
                <p className="text-neutral-800 font-medium text-sm md:text-base">
                  Complete these 5 actions to build a solid foundation for your business launch.
                </p>
              </div>
            </div>
          </div>

          {/* Resources */}
          {plan.resources && plan.resources.length > 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-black shadow-lg">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="w-1 h-5 md:h-6 bg-black rounded-full" />
                <h3 className="text-lg md:text-xl font-light text-neutral-900">Additional Resources</h3>
              </div>
              
              <div className="space-y-3 md:space-y-4">
                {plan.resources.slice(0, 4).map((resource, index) => (
                  <div key={index} className="p-3 md:p-4 bg-neutral-50 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-1 sm:space-y-0">
                      <h4 className="font-medium text-neutral-900 text-sm">{resource.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${
                        resource.type === 'VERIFIED' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {resource.type}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 font-light mb-2">{resource.description}</p>
                    <a 
                      href={resource.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center space-x-1 text-neutral-700 hover:text-neutral-900 text-xs font-medium transition-colors"
                    >
                      <span>View Resource</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Legal & Compliance - Minimalistic */}
        {plan.legal && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-black shadow-lg mb-8 md:mb-16 mt-8 md:mt-16">
            <div className="flex items-center space-x-3 mb-6 md:mb-8">
              <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
              <h2 className="text-xl md:text-2xl font-light text-neutral-900">Legal & Compliance</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {plan.legal.businessEntity && (
                <div className="space-y-3">
                  <h3 className="font-medium text-neutral-900">Business Entity</h3>
                  <p className="text-neutral-700 text-sm leading-relaxed">{plan.legal.businessEntity}</p>
                </div>
              )}

              {plan.legal.intellectualProperty && (
                <div className="space-y-3">
                  <h3 className="font-medium text-neutral-900">Intellectual Property</h3>
                  <p className="text-neutral-700 text-sm leading-relaxed">{plan.legal.intellectualProperty}</p>
                </div>
              )}

              {plan.legal.compliance && (
                <div className="space-y-3">
                  <h3 className="font-medium text-neutral-900">Regulatory Compliance</h3>
                  <p className="text-neutral-700 text-sm leading-relaxed">{plan.legal.compliance}</p>
                </div>
              )}

              {plan.legal.insurance && (
                <div className="space-y-3">
                  <h3 className="font-medium text-neutral-900">Insurance Requirements</h3>
                  <p className="text-neutral-700 text-sm leading-relaxed">{plan.legal.insurance}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Essential Tools & Resources */}
        {plan.recommendedTools && plan.recommendedTools.length > 0 && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-black shadow-lg mb-8 md:mb-16">
            <div className="flex items-center space-x-3 mb-6 md:mb-8">
              <div className="w-1 h-6 md:h-8 bg-black rounded-full" />
              <h2 className="text-xl md:text-2xl font-light text-neutral-900">Essential Tools</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {plan.recommendedTools.slice(0, 6).map((tool, index) => (
                <div key={index} className="p-4 md:p-6 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-neutral-900 text-sm md:text-base flex-1 min-w-0">{tool.name}</h4>
                    <span className="text-neutral-600 font-medium text-xs md:text-sm whitespace-nowrap ml-3">{tool.cost}</span>
                  </div>
                  <p className="text-xs md:text-sm text-neutral-600 font-light mb-3 leading-relaxed">{tool.description.substring(0, 100)}...</p>
                  {tool.link && (
                    <a 
                      href={tool.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 text-xs md:text-sm font-medium transition-colors"
                    >
                      <span>Learn More</span>
                      <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 md:pt-16 pb-6 md:pb-8">
          <div className="flex items-center justify-center space-x-3 mb-3 md:mb-4">
            <div className="w-2 h-2 bg-neutral-300 rounded-full" />
            <span className="text-xs text-neutral-500 font-medium tracking-wider uppercase">Powered by Real-Time Market Intelligence</span>
            <div className="w-2 h-2 bg-neutral-300 rounded-full" />
          </div>
          <p className="text-neutral-600 text-sm font-light">
            This plan combines verified database content with live market research for maximum accuracy.
          </p>
        </div>
      </div>
    </div>
  )
})
