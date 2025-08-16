'use client'

import { useState, useEffect, useCallback, Suspense, useRef, memo, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import PlanCard from '@/components/PlanCard'
import PageTransition from '@/components/PageTransition'
import dynamic from 'next/dynamic'

// Dynamically import Beams to avoid SSR issues
const Beams = dynamic(() => import('@/components/Beams'), { ssr: false })

interface BusinessScope {
  targetCustomers?: string
  competitors?: string[]
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

interface MarketingStrategy {
  channels?: string[]
  brandStory?: string
  customerAcquisitionCost?: string
  roiTracking?: string
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

interface SimplifiedPhase {
  title: string
  actions: string[]
  deliverables?: string[]
}

interface PlanData {
  summary: string
  businessScope?: BusinessScope
  demandValidation?: DemandValidation
  valueProposition?: ValueProposition
  operations?: Operations
  marketingStrategy?: MarketingStrategy
  financialAnalysis?: FinancialAnalysis
  riskAssessment?: RiskAssessment
  growthStrategy?: GrowthStrategy
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

const PlanPageContent = memo(() => {
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasCalledAPI = useRef(false)

  // Memoize search params
  const searchParamsData = useMemo(() => ({
    idea: searchParams.get('idea'),
    location: searchParams.get('location'),
    budget: searchParams.get('budget'),
    timeline: searchParams.get('timeline'),
    businessType: searchParams.get('businessType'),
    currency: searchParams.get('currency')
  }), [searchParams])

  const { idea, location, budget, timeline, businessType, currency } = searchParamsData

  const generatePlan = useCallback(async () => {
    // Prevent duplicate API calls
    if (hasCalledAPI.current) {
      console.log('API call already in progress or completed (generatePlan)')
      return
    }
    hasCalledAPI.current = true
    
    try {
      setLoading(true)
      setError(null)

      console.log('Making API call with:', { idea: idea?.substring(0, 50), location, budget, timeline, businessType, currency })

      const response = await fetch('/api/generatePlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea,
          location,
          budget,
          timeline,
          businessType,
          currency,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Server error: ${response.statusText}` }))
        throw new Error(errorData.error || `Failed to generate plan: ${response.statusText}`)
      }

      const planData = await response.json()
      setPlan(planData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan')
      hasCalledAPI.current = false // Reset on error so user can retry
    } finally {
      setLoading(false)
    }
  }, [idea, location, budget, timeline, businessType, currency])

  // Stable hash for current parameter set
  const paramHash = JSON.stringify({ idea, location, budget, timeline, businessType, currency })

  useEffect(() => {
    if (!idea) {
      setError('No business idea provided')
      setLoading(false)
      return
    }

    // Reset flag when params change
    hasCalledAPI.current = false
    generatePlan()
  }, [paramHash, generatePlan, idea])

  const exportToPDF = async () => {
    if (!plan) return

    try {
      const response = await fetch('/api/exportPDF', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })

      if (!response.ok) throw new Error('Failed to export PDF')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'business-action-plan.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="bg-black relative overflow-hidden">
        {/* Add the same 3D animated background with homepage settings */}
        <div className="fixed inset-0 w-full h-full z-0">
          <Beams
            beamWidth={3}
            beamHeight={30}
            beamNumber={20}
            lightColor="#f5f5f5"
            speed={1.5}
            noiseIntensity={1}
            scale={0.1}
            rotation={30}
          />
        </div>
        
        {/* Minimalistic loading content */}
        <div className="relative z-10 flex items-center justify-center p-4 py-20 md:py-32">
          <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-8 md:p-12 max-w-2xl text-center">
            
            {/* Simple elegant loading indicator */}
            <div className="mb-8 md:mb-12">
              <div className="w-12 h-12 mx-auto mb-6 md:mb-8">
                <div className="w-full h-full border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
              </div>
            </div>

            {/* Clean typography */}
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-2xl md:text-3xl font-light text-white tracking-wide">
                Crafting Your Success Blueprint
              </h2>
              
              {/* Subtle progress text */}
              <p className="text-white/70 text-base md:text-lg font-light">
                Analyzing your idea and gathering verified industry data
              </p>

              {/* Minimalist progress bar */}
              <div className="w-48 md:w-64 mx-auto">
                <div className="h-0.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/60 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: '60%',
                      animation: 'smoothProgress 2s ease-in-out infinite alternate'
                    }}
                  ></div>
                </div>
              </div>

              {/* Premium quote */}
              <p className="text-white/60 text-sm font-light italic mt-8 md:mt-12">
                &ldquo;Every successful business started with a great plan&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Minimal CSS animations */}
        <style jsx>{`
          @keyframes smoothProgress {
            0% { width: 30%; }
            100% { width: 70%; }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 md:py-32">
        <div className="text-center">
          <div className="text-red-500 text-4xl md:text-6xl mb-4">⚠</div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6 md:mb-8">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PlanCard plan={plan} isLoading={loading} />
    </div>
  )
})

PlanPageContent.displayName = 'PlanPageContent'

export default memo(function PlanPage() {
  return (
    <PageTransition>
      <Suspense fallback={<div />}>
        <PlanPageContent />
      </Suspense>
    </PageTransition>
  )
})
