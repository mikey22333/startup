'use client'

import { Check, ArrowRight } from 'lucide-react'

const PricingSection = () => {
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "",
      description: "Perfect for testing your business idea",
      features: [
        "1 business plan per month",
        "Basic market analysis",
        "Executive summary",
        "PDF export",
        "Email support"
      ],
      buttonText: "Get Started Free",
      popular: false
    },
    {
      name: "Professional",
      price: "29",
      period: "/month",
      description: "For serious entrepreneurs",
      features: [
        "Unlimited business plans",
        "Real-time market data",
        "Competitor analysis",
        "Financial projections",
        "Priority support",
        "Custom branding"
      ],
      buttonText: "Start Professional",
      popular: true
    },
    {
      name: "Enterprise",
      price: "99",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Everything in Professional",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "White-label solutions",
        "Advanced analytics"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ]

  return (
    <section className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-normal text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include our core AI-powered features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className="relative">
              
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`bg-white/5 rounded-2xl border p-8 h-full flex flex-col ${
                plan.popular 
                  ? 'border-blue-600' 
                  : 'border-white/10'
              }`}>
                
                {/* Plan Header */}
                <div className="mb-8">
                  <h3 className="text-xl font-medium text-white mb-2">{plan.name}</h3>
                  <p className="text-neutral-400 text-sm mb-6">{plan.description}</p>
                  
                  <div className="flex items-baseline">
                    <span className="text-4xl font-semibold text-white">${plan.price}</span>
                    {plan.period && <span className="text-neutral-400 ml-1">{plan.period}</span>}
                  </div>
                </div>

                {/* Features */}
                <div className="flex-grow mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button 
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {plan.buttonText} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8">
            <h3 className="text-lg font-medium text-white mb-2">Need something custom?</h3>
            <p className="text-neutral-400 mb-6 max-w-2xl mx-auto">
              Looking for volume discounts or enterprise-grade security? We&apos;d love to help you build the perfect solution.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto">
              Contact Sales <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection
