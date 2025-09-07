'use client'

import { useState, memo, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

// Lazy load heavy components
const Beams = lazy(() => import("@/components/Beams"))

export default memo(function ContactPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Memoized beams props
  const beamsProps = {
    beamWidth: 3,
    beamHeight: 30,
    beamNumber: 20,
    lightColor: "#f5f5f5",
    speed: 1.5,
    noiseIntensity: 1,
    scale: 0.1,
    rotation: 30
  }

  return (
    <PageTransition>
      <div className="bg-black relative">
        {/* Desktop Navigation */}
        <nav className="absolute top-6 left-6 right-6 z-20 hidden md:flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/pricing')}
              className="px-6 py-2.5 text-white/95 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-all duration-300 font-medium text-sm border border-white/10 hover:border-white/20 backdrop-blur-md shadow-lg hover:shadow-xl tracking-wide"
            >
              Pricing
            </button>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-2.5 text-white/95 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-all duration-300 font-medium text-sm border border-white/10 hover:border-white/20 backdrop-blur-md shadow-lg hover:shadow-xl tracking-wide"
            >
              Home
            </button>
          </div>
          
          <button 
            onClick={() => {/* TODO: Implement authentication */}}
            className="px-6 py-2.5 text-white/95 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-all duration-300 font-medium text-sm border border-white/10 hover:border-white/20 backdrop-blur-md shadow-lg hover:shadow-xl tracking-wide"
          >
            Sign In
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="fixed top-6 left-6 z-50 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-black/60 transition-all duration-300"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Mobile Slide-out Menu */}
          <div className={`fixed top-0 left-0 h-full w-80 bg-black/90 backdrop-blur-xl border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            {/* Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Menu Items */}
            <div className="pt-20 px-8">
              <nav className="space-y-6">
                <button
                  onClick={() => {
                    router.push('/pricing')
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center w-full text-left text-white/90 hover:text-white text-lg font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  Pricing
                </button>
                
                <button
                  onClick={() => {
                    router.push('/')
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center w-full text-left text-white/90 hover:text-white text-lg font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  Home
                </button>
                
                <button
                  onClick={() => {
                    /* TODO: Implement authentication */
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center w-full text-left text-white/90 hover:text-white text-lg font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  Sign In
                </button>
              </nav>
            </div>
          </div>
        </div>
      
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Beams {...beamsProps} />
      </div>
      
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 relative z-10 min-h-screen flex flex-col justify-center">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
            Get in Touch
          </h1>
          <p className="text-lg text-white/80 font-light max-w-md mx-auto drop-shadow-lg">
            Have questions about PlanSpark? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/20 p-12 shadow-2xl text-center">
          <div className="mb-8">
            <svg className="w-20 h-20 text-white/80 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-3xl font-bold text-white mb-4">Contact Us</h3>
            <p className="text-white/70 text-lg mb-8">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h4 className="text-white font-semibold text-lg mb-3">Email Us</h4>
              <a 
                href="mailto:info@planspark.app"
                className="text-2xl font-mono text-white hover:text-white/80 transition-colors duration-300 underline decoration-white/50 hover:decoration-white/80"
              >
                info@planspark.app
              </a>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h4 className="text-white font-semibold text-lg mb-3">Response Time</h4>
              <p className="text-white/80 text-lg">
                We typically respond within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PageTransition>
  )
})
