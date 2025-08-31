'use client'

import { useState, useEffect, useCallback, Suspense, useRef, memo, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import PlanCard from '@/components/PlanCard'
import PageTransition from '@/components/PageTransition'
import BusinessAdvisor from '@/components/BusinessAdvisor'
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
  const { user, loading: authLoading } = useAuth()
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false)
  const [isAdvisorMinimized, setIsAdvisorMinimized] = useState(false)
  const [isLoadingExistingPlan, setIsLoadingExistingPlan] = useState(false)
  const hasCalledAPI = useRef(false)

  // Redirect unauthenticated users to login - only after auth loading is complete
  useEffect(() => {
    if (!authLoading && !user && (searchParams.get('idea') || searchParams.get('id'))) {
      window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname + window.location.search)
    }
  }, [user, authLoading, searchParams])

  // Memoize search params
  const searchParamsData = useMemo(() => ({
    id: searchParams.get('id'),
    idea: searchParams.get('idea'),
    location: searchParams.get('location'),
    budget: searchParams.get('budget'),
    timeline: searchParams.get('timeline'),
    businessType: searchParams.get('businessType'),
    currency: searchParams.get('currency')
  }), [searchParams])

  const { id, idea, location, budget, timeline, businessType, currency } = searchParamsData

  // Reset API call flag when key parameters change (for new plan generation)
  // Only reset if we're NOT loading an existing plan by ID
  const parameterKey = useMemo(() => `${idea}-${location}-${budget}-${timeline}-${businessType}`, [idea, location, budget, timeline, businessType])
  const prevParameterKey = useRef<string>('')
  
  useEffect(() => {
    console.log('Parameter key effect:', { id, parameterKey, prevKey: prevParameterKey.current, hasCalledAPI: hasCalledAPI.current, isLoadingExistingPlan })
    
    // If we have an ID or are loading an existing plan, set hasCalledAPI to true immediately
    if (id || isLoadingExistingPlan) {
      console.log('Have ID or loading existing plan, setting hasCalledAPI to true to prevent generation')
      hasCalledAPI.current = true
      return
    }
    
    // Only reset for new plan generation when no ID and parameters changed
    if (!id && !isLoadingExistingPlan && prevParameterKey.current !== parameterKey && parameterKey !== '----') {
      console.log('Resetting hasCalledAPI flag for new parameters')
      hasCalledAPI.current = false
      prevParameterKey.current = parameterKey
    }
  }, [parameterKey, id, isLoadingExistingPlan])

  const generatePlan = useCallback(async () => {
    // This function is now mainly for manual retries
    if (hasCalledAPI.current) {
      console.log('API call already in progress or completed (generatePlan)')
      return
    }
    hasCalledAPI.current = true
    
    try {
      setLoading(true)
      setError(null)

      console.log('Making API call with:', { idea: idea?.substring(0, 50), location, budget, timeline, businessType, currency })

      // Get the session token to send with the request
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // Add authorization header if user is signed in
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/generatePlan', {
        method: 'POST',
        headers,
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
      
      // Update URL with plan ID to enable proper reloading
      if (planData?.id) {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('id', planData.id)
        // Remove generation parameters since we now have an ID
        newUrl.searchParams.delete('idea')
        newUrl.searchParams.delete('location')
        newUrl.searchParams.delete('budget')
        newUrl.searchParams.delete('timeline')
        newUrl.searchParams.delete('businessType')
        window.history.replaceState({}, '', newUrl.toString())
        console.log('Updated URL with plan ID:', planData.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan')
      hasCalledAPI.current = false // Reset on error so user can retry
    } finally {
      setLoading(false)
    }
  }, [idea, location, budget, timeline, businessType, currency])

  // Load existing plan by ID
  useEffect(() => {
    console.log('Load plan effect:', { id, user: !!user, hasCalledAPI: hasCalledAPI.current })
    
    if (!id || !user) {
      setIsLoadingExistingPlan(false)
      return
    }

    // Mark that we're loading an existing plan
    setIsLoadingExistingPlan(true)
    // Mark API as called to prevent generation when loading existing plan
    console.log('Setting hasCalledAPI to true for existing plan loading')
    hasCalledAPI.current = true
    
    const loadPlan = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('business_plans')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (error) {
          throw error
        }

        if (!data) {
          throw new Error('Business plan not found')
        }

        // Set the plan data from the database
        // Parse any JSON strings that might have been serialized
        const parsedPlanData = { ...data.plan_data }
        
        // Helper function to safely parse JSON strings
        const safeParseJSON = (value: any, fieldName: string): any => {
          if (typeof value === 'string' && value.trim()) {
            const trimmed = value.trim()
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
              try {
                return JSON.parse(trimmed)
              } catch (parseError) {
                console.warn(`Failed to parse ${fieldName}:`, parseError)
                return value // Return original string if parsing fails
              }
            }
          }
          return value
        }
        
        // Parse competitive analysis if it's a string
        parsedPlanData.competitiveAnalysis = safeParseJSON(parsedPlanData.competitiveAnalysis, 'competitiveAnalysis')
        
        // Parse other potentially serialized objects
        const fieldsToParseIfString = [
          'businessScope', 'demandValidation', 'valueProposition', 'financialAnalysis',
          'riskAssessment', 'growthStrategy', 'competitiveIntelligence', 'marketIntelligence',
          'gotoMarketStrategy', 'strategicMilestones', 'actionRoadmap', 'resources',
          'marketAnalysis', 'businessModel', 'implementation', 'legal'
        ]
        
        fieldsToParseIfString.forEach(field => {
          if (parsedPlanData[field]) {
            parsedPlanData[field] = safeParseJSON(parsedPlanData[field], field)
          }
        })
        
        console.log('Loaded existing plan from database for ID:', id)
        
        if (parsedPlanData) {
          setPlan(parsedPlanData)
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load business plan')
      } finally {
        setLoading(false)
        setIsLoadingExistingPlan(false)
      }
    }
    
    loadPlan()
  }, [id, user]) // Only depend on id and user, not other params

  // Generate new plan (only when there's no ID)
  useEffect(() => {
    console.log('Generate plan effect:', { id, idea: !!idea, hasCalledAPI: hasCalledAPI.current, user: !!user, isLoadingExistingPlan })
    
    // Skip if we have an ID (loading existing plan) or no idea or no user or currently loading existing plan
    if (id || !idea || !user || isLoadingExistingPlan) {
      console.log('Skipping plan generation:', { hasId: !!id, hasIdea: !!idea, hasUser: !!user, isLoadingExistingPlan })
      if (!id && !idea && user && !isLoadingExistingPlan) {
        setError('No business idea provided')
        setLoading(false)
      }
      return
    }

    // Double-check: if URL has id parameter, absolutely don't generate
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('id')) {
      console.log('URL has ID parameter, aborting plan generation')
      return
    }

    // Prevent duplicate API calls
    if (hasCalledAPI.current) {
      console.log('API call already in progress or completed')
      return
    }

    // Before generating, check if a plan already exists for these parameters
    const checkExistingPlan = async () => {
      try {
        const { data: existingPlans, error } = await supabase
          .from('business_plans')
          .select('id, plan_data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (!error && existingPlans) {
          // Check if any existing plan matches the current idea (simple comparison)
          const ideaLower = idea.toLowerCase().trim()
          for (const existingPlan of existingPlans) {
            const planData = existingPlan.plan_data
            if (planData?.businessIdeaReview?.originalIdea) {
              const existingIdeaLower = planData.businessIdeaReview.originalIdea.toLowerCase().trim()
              if (existingIdeaLower === ideaLower) {
                console.log('Found existing plan for this idea, redirecting to:', existingPlan.id)
                // Redirect to the existing plan
                const newUrl = new URL(window.location.origin + window.location.pathname)
                newUrl.searchParams.set('id', existingPlan.id)
                // Keep currency if it was specified
                if (currency) {
                  newUrl.searchParams.set('currency', currency)
                }
                console.log('Redirecting to existing plan URL:', newUrl.toString())
                window.location.href = newUrl.toString()
                return
              }
            }
          }
        }
      } catch (error) {
        console.log('Error checking existing plans:', error)
        // Continue with generation if check fails
      }

      // No existing plan found, proceed with generation
      doGeneratePlan()
    }

    const doGeneratePlan = async () => {
      hasCalledAPI.current = true
      
      try {
        setLoading(true)
        setError(null)

        console.log('Generating new plan with:', { idea: idea?.substring(0, 50), location, budget, timeline, businessType, currency })

        // Get the session token to send with the request
        const { data: { session } } = await supabase.auth.getSession()
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        
        // Add authorization header if user is signed in
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        const response = await fetch('/api/generatePlan', {
          method: 'POST',
          headers,
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
        
        // Update URL with plan ID to enable proper reloading
        const planId = planData?.id || planData?.databaseId
        if (planId) {
          console.log('Plan generated with ID:', planId)
          const newUrl = new URL(window.location.origin + window.location.pathname)
          newUrl.searchParams.set('id', planId)
          // Keep currency if it was specified
          if (currency) {
            newUrl.searchParams.set('currency', currency)
          }
          console.log('Updating URL to:', newUrl.toString())
          window.history.replaceState({}, '', newUrl.toString())
        } else {
          console.warn('Plan generated but no ID returned:', planData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate plan')
        hasCalledAPI.current = false // Reset on error so user can retry
      } finally {
        setLoading(false)
      }
    }
    
    checkExistingPlan()
  }, [id, idea, location, budget, timeline, businessType, currency, user, isLoadingExistingPlan]) // Include all relevant dependencies

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full">
          {/* Animated Error Icon */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-bounce"></div>
            </div>
          </div>

          {/* Error Content */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {error || "We encountered an unexpected error while loading your business plan. Please try again."}
            </p>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Try Again
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                Go Back
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                If the problem persists, please{' '}
                <a href="/contact" className="text-blue-600 hover:text-blue-700 underline">
                  contact support
                </a>
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PlanCard plan={plan} isLoading={loading} />
      
      {/* Floating AI Advisor Button */}
      <button
        onClick={() => setIsAdvisorOpen(true)}
        className="fixed right-6 bottom-6 w-14 h-14 bg-neutral-800 text-neutral-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-105 z-40"
        title="Ask AI Business Advisor"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Business Advisor Chat */}
      <BusinessAdvisor
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        isMinimized={isAdvisorMinimized}
        onToggleMinimize={() => setIsAdvisorMinimized(!isAdvisorMinimized)}
        planData={plan}
      />
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
