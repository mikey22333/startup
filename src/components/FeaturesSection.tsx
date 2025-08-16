'use client'

import { Brain, TrendingUp, Shield, Zap, Users, BarChart3, Globe, Clock } from 'lucide-react'

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced algorithms analyze market trends and generate comprehensive business plans.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Data",
      description: "Access live economic indicators and competitor analysis from trusted sources.",
    },
    {
      icon: BarChart3,
      title: "Financial Projections",
      description: "Detailed financial modeling with forecasts and break-even analysis.",
    },
    {
      icon: Globe,
      title: "Global Market Intelligence",
      description: "Comprehensive market analysis covering 195+ countries worldwide.",
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Identify potential risks and mitigation strategies for your business.",
    },
    {
      icon: Users,
      title: "Competitor Analysis",
      description: "Deep insights into your competitive landscape and positioning.",
    },
    {
      icon: Zap,
      title: "Instant Generation",
      description: "Generate professional business plans in minutes, not weeks.",
    },
    {
      icon: Clock,
      title: "Always Up-to-Date",
      description: "Your plans stay current with automatic data updates.",
    }
  ]

  return (
    <section className="py-24 bg-neutral-900">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-normal text-white mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Comprehensive business intelligence powered by real-time market data
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg mb-6">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-semibold text-white mb-1">10,000+</div>
            <div className="text-neutral-400 text-sm">Plans Created</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-white mb-1">95%</div>
            <div className="text-neutral-400 text-sm">Success Rate</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-white mb-1">$2.1B+</div>
            <div className="text-neutral-400 text-sm">Funding Raised</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-white mb-1">150+</div>
            <div className="text-neutral-400 text-sm">Countries</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
