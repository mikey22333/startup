'use client'

import { useState, memo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, ArrowRight } from 'lucide-react'

const Navigation = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleCreatePlan = useCallback(() => {
    router.push('/')
  }, [router])

  const handlePricingClick = useCallback(() => {
    router.push('/pricing')
  }, [router])

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }, [])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Pricing Link - Top Left Corner */}
          <button 
            onClick={handlePricingClick}
            className="text-neutral-300 hover:text-white transition-colors font-medium"
          >
            Pricing
          </button>

          {/* Logo - Center */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-white">PlanGen</span>
          </div>

          {/* Desktop CTA - Right */}
          <div className="flex items-center gap-4">
            <button className="text-neutral-300 hover:text-white transition-colors">
              Sign In
            </button>
            <button 
              onClick={handleCreatePlan}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Create Plan <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 text-neutral-300 hover:text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="space-y-4">
              <button 
                onClick={handlePricingClick}
                className="block w-full text-left text-neutral-300 hover:text-white py-2"
              >
                Pricing
              </button>
              <div className="pt-4 border-t border-white/10 space-y-3">
                <button className="block w-full text-left text-neutral-300 hover:text-white py-2">
                  Sign In
                </button>
                <button 
                  onClick={handleCreatePlan}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  Create Plan <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
})

Navigation.displayName = 'Navigation'

export default Navigation