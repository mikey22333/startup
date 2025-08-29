'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function HomePage() {
  const [idea, setIdea] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [currency, setCurrency] = useState('USD')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (idea.trim()) {
      const params = new URLSearchParams({
        idea: idea.trim(),
        ...(location.trim() && { location: location.trim() }),
        ...(budget && { budget }),
        ...(timeline && { timeline }),
        ...(businessType && { businessType }),
        ...(currency && { currency })
      })
      router.push(`/plan?${params.toString()}`)
    }
  }

  const examplePrompts = [
    "I want to start a car rental business in Texas",
    "I want to build a food delivery app",
    "I want to open a boutique coffee shop in downtown Seattle",
    "I want to create a SaaS tool for project management",
    "I want to start an online fitness coaching business"
  ]

  return (
    <div className="bg-gradient-to-br from-neutral-50 via-white to-neutral-50 relative min-h-screen">
      {/* Navigation */}
      <div className="relative z-10 p-6">
        <Link 
          href="/pricing"
          className="inline-flex items-center space-x-2 text-white/90 hover:text-white transition-all bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:border-white/40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Pricing</span>
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-600 bg-clip-text text-transparent mb-8">
            PlanSpark
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Transform your business idea into a detailed, actionable 30-60-90 day plan. 
            Get expert insights, market analysis, and step-by-step guidance to turn your vision into reality.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your business idea... (e.g., 'I want to start a car rental business in Texas')"
                className="w-full p-6 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white/90 backdrop-blur-sm"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (optional)"
                className="p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none transition-all bg-white/80 backdrop-blur-sm"
              />
              
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none transition-all bg-white/80 backdrop-blur-sm"
              >
                <option value="">Business Type (optional)</option>
                <option value="e-commerce">E-commerce</option>
                <option value="saas">SaaS/Software</option>
                <option value="restaurant">Restaurant/Food</option>
                <option value="retail">Retail</option>
                <option value="service">Service Business</option>
                <option value="consulting">Consulting</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="p-4 rounded-l-xl border border-r-0 border-gray-200 focus:border-blue-500 focus:outline-none transition-all bg-white/80 backdrop-blur-sm"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Budget"
                  className="flex-1 p-4 rounded-r-xl border border-gray-200 focus:border-blue-500 focus:outline-none transition-all bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none transition-all bg-white/80 backdrop-blur-sm md:col-span-2"
              >
                <option value="">Timeline (optional)</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6-12 months">6-12 months</option>
                <option value="1+ years">1+ years</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-8 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
            >
              Generate My Business Plan
            </button>
          </form>
          
          <div className="mt-12">
            <p className="text-gray-500 mb-4">Try these example prompts:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setIdea(prompt)}
                  className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-full transition-all duration-200 border border-blue-200 hover:border-blue-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
