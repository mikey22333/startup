'use client'

import { useState, useMemo, useCallback, memo, lazy, Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useSubscription } from '@/hooks/useSubscription'
import { openPaddleCheckout, PADDLE_PRICE_IDS } from '@/lib/paddle'

// Lazy load the Beams component for better performance
const Beams = lazy(() => import("@/components/Beams"))

export const dynamic = 'force-dynamic'

// Memoized pricing plans data
const PRICING_PLANS = [
  {
    name: "Basic",
    subtitle: "Best for personal use.",
    monthlyPrice: "Free",
    yearlyPrice: "Free",
    features: [
      "1 business plan per day",
      "Basic financial projections",
      "Market size analysis",
      "Risk assessment",
      "Essential business tools"
    ],
    limitations: [
      "No competitor analysis",
      "No PDF export"
    ],
    buttonText: "Get Started",
    isPopular: false
  },
  {
    name: "Pro",
    subtitle: "For entrepreneurs & startups.",
    monthlyPrice: "$12.99",
    yearlyPrice: "$129.90",
    yearlyMonthlyEquivalent: "$10.83",
    savings: "16%",
    features: [
      "Everything in Basic",
      "5 business plans per day",
      "PDF export",
      "Advanced competitor analysis",
      "Priority customer support"
    ],
    buttonText: "Get Started",
    isPopular: true
  },
  {
    name: "Pro+",
    subtitle: "For agencies & consultants.",
    monthlyPrice: "$29.99",
    yearlyPrice: "$299.90",
    yearlyMonthlyEquivalent: "$24.99",
    savings: "16%",
    features: [
      "Unlimited business plans",
      "Everything in Pro"
    ],
    buttonText: "Get Started",
    isPopular: false
  }
]

// Memoized pricing card component
const PricingCard = memo(({ 
  plan, 
  onButtonClick, 
  isCurrentPlan, 
  isUpgrade, 
  usageInfo,
  isAnnual = false
}: { 
  plan: typeof PRICING_PLANS[0], 
  onButtonClick: () => void,
  isCurrentPlan?: boolean,
  isUpgrade?: boolean,
  usageInfo?: { used: number, limit: number | 'unlimited' },
  isAnnual?: boolean
}) => {
  const currentPrice = plan.name === 'Basic' 
    ? plan.monthlyPrice 
    : isAnnual 
      ? plan.yearlyPrice 
      : plan.monthlyPrice
  
  const period = plan.name === 'Basic' 
    ? '' 
    : isAnnual 
      ? 'per year' 
      : 'per month'

  return (
  <div
    className={`relative bg-black/70 backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 hover:bg-black/80 hover:scale-105 ${
      plan.isPopular ? 'border-white/30 shadow-2xl' : 'border-white/10'
    } ${isCurrentPlan ? 'border-green-400/50 bg-green-900/20' : ''}`}
  >
    {/* Current Plan Badge */}
    {isCurrentPlan && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-green-500 text-black px-3 py-1 rounded-full text-xs font-medium">
          Current Plan
        </span>
      </div>
    )}

    {/* Popular Badge */}
    {plan.isPopular && (
      <div className="absolute -top-3 right-4">
        <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-medium">
          Most Popular
        </span>
      </div>
    )}

    {/* Icon */}
    <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
      <div className="w-3 h-3 bg-white rounded-full"></div>
    </div>

    {/* Plan Info */}
    <div className="mb-8">
      <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
      <p className="text-white/60 text-sm mb-6">{plan.subtitle}</p>
      
      <div className="mb-2">
        <span className="text-4xl font-bold text-white">{currentPrice}</span>
        {period && <span className="text-white/60 ml-2">{period}</span>}
      </div>

      {/* Show monthly equivalent and savings for annual plans */}
      {isAnnual && plan.name !== 'Basic' && plan.yearlyMonthlyEquivalent && (
        <div className="mb-4">
          <p className="text-green-400 text-sm">
            {plan.yearlyMonthlyEquivalent}/month • Save {plan.savings}
          </p>
        </div>
      )}

      {/* Usage Info for Current Plan */}
      {isCurrentPlan && usageInfo && (
        <div className="mb-6 p-3 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-white/80 text-sm font-medium mb-2">Today's Usage</h4>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">
              {usageInfo.used} / {usageInfo.limit === 'unlimited' ? '∞' : usageInfo.limit} plans
            </span>
            <span className={`font-medium ${
              usageInfo.limit !== 'unlimited' && usageInfo.used >= usageInfo.limit 
                ? 'text-red-400' 
                : 'text-green-400'
            }`}>
              {usageInfo.limit === 'unlimited' 
                ? 'Unlimited' 
                : `${Math.max(0, (usageInfo.limit as number) - usageInfo.used)} left`}
            </span>
          </div>
        </div>
      )}
    </div>

    {/* CTA Button */}
    <button
      onClick={onButtonClick}
      disabled={isCurrentPlan || (plan.name !== 'Basic')} // Disable paid plans temporarily
      className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 mb-8 ${
        isCurrentPlan
          ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
          : plan.name === 'Basic'
          ? plan.isPopular
            ? 'bg-white text-black hover:bg-white/90 shadow-lg'
            : 'bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20'
          : 'bg-gray-600 text-gray-300 cursor-not-allowed' // Disabled state for paid plans
      }`}
    >
      {isCurrentPlan 
        ? 'Current Plan' 
        : plan.buttonText
      }
    </button>

    {/* Features */}
    <div>
      <h4 className="text-white font-medium mb-4">What you will get</h4>
      <ul className="space-y-3">
        {plan.features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-white/70 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      
      {/* Limitations for Basic plan */}
      {plan.name === "Basic" && (plan as any).limitations && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-white/60 font-medium mb-3 text-sm">Limitations</h4>
          <ul className="space-y-2">
            {(plan as any).limitations.map((limitation: string, limitationIndex: number) => (
              <li key={limitationIndex} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border border-red-400/40 flex items-center justify-center">
                  <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                </div>
                <span className="text-red-300/60 text-xs">{limitation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
  )
})

PricingCard.displayName = 'PricingCard'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const { usageStatus, upgradeSubscription, loading: subscriptionLoading } = useSubscription()

  // Memoized handlers
  const handleBack = useCallback(() => {
    router.push('/generate')
  }, [router])

  const handleSetMonthly = useCallback(() => {
    setIsAnnual(false)
  }, [])

  const handleSetAnnual = useCallback(() => {
    setIsAnnual(true)
  }, [])

  const handlePlanSelect = useCallback(async (planName: string) => {
    console.log(`Selected plan: ${planName}`)
    
    if (!user) {
      router.push('/auth')
      return
    }

    // Production Paddle checkout enabled
    try {
      let tierMap: { [key: string]: 'free' | 'pro' | 'pro+' } = {
        'Basic': 'free',
        'Pro': 'pro',
        'Pro+': 'pro+'
      }
      
      const newTier = tierMap[planName]
      if (!newTier) return

      // If selecting free plan, handle differently
      if (newTier === 'free') {
        // For Paddle, direct customers to support for downgrades
        const response = await fetch('/api/paddle/customer-portal', {
          method: 'POST',
        })
        
        if (response.ok) {
          alert('You are already on the free plan!')
        } else {
          const { error, supportEmail } = await response.json()
          alert(error || 'To cancel your subscription, please contact support.')
        }
        return
      }

      // If user is already on this tier or higher, no need to upgrade
      if (usageStatus?.subscriptionTier === newTier) {
        alert(`You're already on the ${planName} plan!`)
        return
      }

      // Map plan names to Paddle price IDs
      const priceMapping: { [key: string]: string } = {
        'Pro': isAnnual 
          ? PADDLE_PRICE_IDS.PRO_YEARLY
          : PADDLE_PRICE_IDS.PRO_MONTHLY,
        'Pro+': isAnnual 
          ? PADDLE_PRICE_IDS.PRO_PLUS_YEARLY
          : PADDLE_PRICE_IDS.PRO_PLUS_MONTHLY
      }

      const priceId = priceMapping[planName]
      if (!priceId) {
        alert('Invalid plan selected')
        return
      }

      // Get checkout data from our API
      const response = await fetch('/api/paddle/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          billingPeriod: isAnnual ? 'yearly' : 'monthly'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to prepare checkout')
      }

      const checkoutData = await response.json()
      
      // Open Paddle checkout
      await openPaddleCheckout({
        priceId: checkoutData.priceId,
        customerId: checkoutData.customerId,
        billingPeriod: checkoutData.billingPeriod,
        userEmail: user?.email || null
      })
      
    } catch (err) {
      console.error('Upgrade failed:', err)
      alert(err instanceof Error ? err.message : 'Upgrade failed')
    }
  }, [user, router, usageStatus, isAnnual])

  // Memoized Beams props
  const beamsProps = useMemo(() => ({
    beamWidth: 3,
    beamHeight: 30,
    beamNumber: 20,
    lightColor: "#f5f5f5",
    speed: 1.5,
    noiseIntensity: 1,
    scale: 0.1,
    rotation: 30
  }), [])

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-60"
        style={{
          backgroundImage: `url('/app/pricing/Screenshot 2025-08-13 183347.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* 3D Background Beams with Suspense */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Beams {...beamsProps} />
        </Suspense>
      </div>

      {/* Simple Back Link - Top Left Corner */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={handleBack}
          className="text-white hover:text-gray-200 transition-colors font-light text-sm tracking-wide flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main Content */}
      <main className="pt-20 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-16">

            <div className="inline-flex items-center space-x-3 mb-6 md:mb-8">
              <div className="w-2 h-2 bg-white/80 rounded-full shadow-lg" />
              <span className="text-white/80 text-sm font-medium tracking-wider uppercase">
                AI-POWERED BUSINESS PLANNING
              </span>
              <div className="w-2 h-2 bg-white/80 rounded-full shadow-lg" />
            </div>
            
            <h1 className="text-3xl md:text-6xl font-light text-white mb-6 md:mb-8 leading-tight drop-shadow-2xl">
              Choose Your Plan<br />
              <span className="block font-normal text-white/90 drop-shadow-xl">Start Building Your Business</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 drop-shadow-md">
              Generate professional business plans with AI. From basic concepts to advanced market analysis - choose the plan that fits your needs.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <button 
                onClick={handleSetMonthly}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
                  !isAnnual ? 'bg-white/90 text-black shadow-lg' : 'text-white/70 hover:text-white bg-white/10'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={handleSetAnnual}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
                  isAnnual ? 'bg-white/90 text-black shadow-lg' : 'text-white/70 hover:text-white bg-white/10'
                }`}
              >
                Annually
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => {
              const tierMap: { [key: string]: 'free' | 'pro' | 'pro+' } = {
                'Basic': 'free',
                'Pro': 'pro',
                'Pro+': 'pro+'
              }
              
              const planTier = tierMap[plan.name]
              const isCurrentPlan = usageStatus?.subscriptionTier === planTier
              const currentTierRank = usageStatus?.subscriptionTier === 'free' ? 0 
                                   : usageStatus?.subscriptionTier === 'pro' ? 1 
                                   : 2
              const planTierRank = planTier === 'free' ? 0 : planTier === 'pro' ? 1 : 2
              const isUpgrade = planTierRank > (currentTierRank || 0)
              
              return (
                <PricingCard
                  key={plan.name}
                  plan={plan}
                  onButtonClick={() => handlePlanSelect(plan.name)}
                  isCurrentPlan={isCurrentPlan}
                  isUpgrade={isUpgrade}
                  usageInfo={isCurrentPlan ? usageStatus?.dailyUsage : undefined}
                  isAnnual={isAnnual}
                />
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
