'use client'

import { useState, useMemo, useCallback, memo, lazy, Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Lazy load the Beams component for better performance
const Beams = lazy(() => import("@/components/Beams"))

export const dynamic = 'force-dynamic'

// Memoized pricing plans data
const PRICING_PLANS = [
  {
    name: "Basic",
    subtitle: "Best for personal use.",
    price: "Free",
    features: [
      "Employee directory",
      "Task management", 
      "Calendar integration",
      "File storage",
      "Communication tools",
      "Reporting and analytics"
    ],
    buttonText: "Get Started",
    isPopular: false
  },
  {
    name: "Enterprise",
    subtitle: "For large teams & corporations.",
    price: "$20",
    period: "per month",
    features: [
      "Advanced employee directory",
      "Project management",
      "Resource scheduling",
      "Version control",
      "Team collaboration", 
      "Advanced analytics"
    ],
    buttonText: "Get Started",
    isPopular: true
  },
  {
    name: "Business",
    subtitle: "Best for business owners.",
    price: "$120",
    period: "per month",
    features: [
      "Customizable employee directory",
      "Client project management",
      "Client meeting schedule",
      "Compliance tracking",
      "Client communication",
      "Create custom reports tailored"
    ],
    buttonText: "Get Started",
    isPopular: false
  }
]

// Memoized pricing card component
const PricingCard = memo(({ plan, onButtonClick }: { 
  plan: typeof PRICING_PLANS[0], 
  onButtonClick: () => void 
}) => (
  <div
    className={`relative bg-black/70 backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 hover:bg-black/80 hover:scale-105 ${
      plan.isPopular ? 'border-white/30 shadow-2xl' : 'border-white/10'
    }`}
  >
    {/* Icon */}
    <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
      <div className="w-3 h-3 bg-white rounded-full"></div>
    </div>

    {/* Plan Info */}
    <div className="mb-8">
      <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
      <p className="text-white/60 text-sm mb-6">{plan.subtitle}</p>
      
      <div className="mb-8">
        <span className="text-4xl font-bold text-white">{plan.price}</span>
        {plan.period && <span className="text-white/60 ml-2">{plan.period}</span>}
      </div>
    </div>

    {/* CTA Button */}
    <button
      onClick={onButtonClick}
      className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 mb-8 ${
        plan.isPopular
          ? 'bg-white text-black hover:bg-white/90 shadow-lg'
          : 'bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20'
      }`}
    >
      {plan.buttonText}
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
    </div>
  </div>
))

PricingCard.displayName = 'PricingCard'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const router = useRouter()

  // Memoized handlers
  const handleBack = useCallback(() => {
    router.push('/')
  }, [router])

  const handleSetMonthly = useCallback(() => {
    setIsAnnual(false)
  }, [])

  const handleSetAnnual = useCallback(() => {
    setIsAnnual(true)
  }, [])

  const handlePlanSelect = useCallback((planName: string) => {
    console.log(`Selected plan: ${planName}`)
    // Add plan selection logic here
  }, [])

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
              Discover Products<br />
              <span className="block font-normal text-white/90 drop-shadow-xl">With the Best Pricing</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 drop-shadow-md">
              Select from best plan, ensuring a perfect match. Need more or less? Customize your subscription for a seamless fit!
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
            {PRICING_PLANS.map((plan) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                onButtonClick={() => handlePlanSelect(plan.name)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
