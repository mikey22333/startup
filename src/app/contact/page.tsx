'use client'

import { useState, memo, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

// Lazy load heavy components
const Beams = lazy(() => import("@/components/Beams"))

export default memo(function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission (no actual backend implementation)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    }, 3000)
  }

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
            Have questions about Idea2Action? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="w-16 h-16 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">Message Sent!</h3>
              <p className="text-white/70">Thank you for reaching out. We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm resize-none"
                  placeholder="Tell us about your question or feedback..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim()}
                className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:bg-white/10 text-white font-medium py-4 px-8 rounded-xl text-lg transition-all border border-white/30 shadow-lg disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Alternative Contact Info */}
        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-white/70">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">hello@idea2action.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">Response within 24 hours</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PageTransition>
  )
})
