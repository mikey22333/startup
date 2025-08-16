'use client'

import { ArrowRight, Play, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const HeroSection = () => {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/')
  }

  return (
    <section className="min-h-screen bg-black flex items-center">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">
        
        {/* Left Content */}
        <div>
          <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2 text-sm text-neutral-300 mb-8">
            ⭐⭐⭐⭐⭐ Trusted by 10,000+ entrepreneurs
          </div>

          <h1 className="text-5xl md:text-6xl font-normal text-white leading-tight mb-6">
            Create professional{' '}
            <span className="text-blue-400">business plans</span>{' '}
            in minutes
          </h1>
          
          <p className="text-xl text-neutral-400 leading-relaxed mb-8">
            AI-powered platform that combines market intelligence with real-time data to create investor-ready business plans.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              Create Plan <ArrowRight className="w-4 h-4" />
            </button>
            
            <button className="flex items-center justify-center gap-3 text-neutral-300 hover:text-white transition-colors">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 ml-0.5" />
              </div>
              Watch Demo
            </button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Real-time data
            </div>
          </div>
        </div>

        {/* Right Content - Simple Dashboard Preview */}
        <div className="relative">
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-medium">Market Intelligence</h3>
                <p className="text-neutral-400 text-sm">Real-time insights</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-xl font-semibold text-blue-400">98.2%</div>
                <div className="text-neutral-400 text-sm">Success Rate</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-xl font-semibold text-green-400">$2.1M</div>
                <div className="text-neutral-400 text-sm">Avg Funding</div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-end gap-1 h-16 mb-2">
                {[40, 60, 80, 50, 70, 30].map((height, i) => (
                  <div 
                    key={i} 
                    className="bg-blue-400/60 rounded-sm flex-1" 
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="text-neutral-400 text-sm">Market Growth</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
