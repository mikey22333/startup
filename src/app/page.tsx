'use client';

import { useState, useCallback, useMemo, memo, lazy, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useSubscription } from '@/hooks/useSubscription';
import NewPlanModal from '@/components/NewPlanModal';

// Lazy load heavy components
const Beams = lazy(() => import("@/components/Beams"))

// Memoized example prompts data
const EXAMPLE_PROMPTS = [
  "I want to start a car rental business in Texas",
  "I want to build a food delivery app",
  "I want to open a boutique coffee shop in downtown Seattle",
  "I want to create a SaaS tool for project management",
  "I want to start an online fitness coaching business"
]

// Memoized form fields component
const FormField = memo(({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  options 
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  options?: { value: string; label: string }[];
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    {type === "select" && options ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : type === "textarea" ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
      />
    )}
  </div>
))

FormField.displayName = 'FormField'

// Optimized ExamplePrompt component
const ExamplePrompt = memo(({ 
  prompt, 
  onClick 
}: { 
  prompt: string
  onClick: (prompt: string) => void 
}) => (
  <button
    type="button"
    onClick={() => onClick(prompt)}
    className="text-left p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 hover:border-white/40 hover:bg-black/50 transition-all text-sm text-white/90 font-light shadow-lg"
  >
    {prompt}
  </button>
))

ExamplePrompt.displayName = 'ExamplePrompt'

export default memo(function HomePage() {
  const [idea, setIdea] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false)
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { usageStatus } = useSubscription()

  // Debug logging
  useEffect(() => {
    console.log('🔍 User state:', user ? user.email : 'No user')
    console.log('🔍 Usage status:', usageStatus)
  }, [user, usageStatus])

  // Get user's first letter for profile
  const getUserInitial = () => {
    if (!user?.user_metadata?.full_name) return 'U'
    return user.user_metadata.full_name.charAt(0).toUpperCase()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isDropdownOpen && !target.closest('.dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  // Memoized handlers
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user is authenticated
    if (!user) {
      // Show login prompt and redirect to auth page
      if (window.confirm('You need to sign in to generate a business plan. Would you like to sign in now?')) {
        router.push('/auth')
      }
      return
    }
    
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
  }, [idea, location, budget, timeline, businessType, currency, router, user])

  const handleExampleClick = useCallback((prompt: string) => {
    setIdea(prompt)
  }, [])

  const toggleMobileNav = useCallback(() => {
    setIsMobileNavOpen(prev => !prev)
  }, [])

  const closeMobileNav = useCallback(() => {
    setIsMobileNavOpen(false)
  }, [])

  const handleNavigation = useCallback((path: string) => {
    router.push(path)
    closeMobileNav()
  }, [router, closeMobileNav])

  // Memoized options
  const timelineOptions = useMemo(() => [
    { value: '30', label: '30 days' },
    { value: '60', label: '60 days' },
    { value: '90', label: '90 days' },
    { value: '180', label: '6 months' },
    { value: '365', label: '1 year' }
  ], [])

  const businessTypeOptions = useMemo(() => [
    { value: 'startup', label: 'Startup' },
    { value: 'franchise', label: 'Franchise' },
    { value: 'online', label: 'Online Business' },
    { value: 'retail', label: 'Retail Store' },
    { value: 'service', label: 'Service Business' },
    { value: 'consulting', label: 'Consulting' }
  ], [])

  const currencyOptions = useMemo(() => [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD (C$)' },
    { value: 'AUD', label: 'AUD (A$)' }
  ], [])

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

  // Memoized example prompts
  const examplePrompts = useMemo(() => [
    "I want to start a car rental business in Texas",
    "I want to build a food delivery app",
    "I want to open a boutique coffee shop in downtown Seattle",
    "I want to create a SaaS tool for project management",
    "I want to start an online fitness coaching business"
  ], [])

  return (
    <div className="bg-black relative">
      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileNav}
        />
      )}

      {/* Mobile Navigation Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-black/90 backdrop-blur-md border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={closeMobileNav}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Logo/Brand */}
          <div className="mb-8 mt-4">
            <h2 className="text-xl font-bold text-white">PlanSpark</h2>
            <p className="text-white/60 text-sm mt-1">Business Planning</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4">
            {user && (
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="w-full text-left px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => handleNavigation('/workspace')}
              className="w-full text-left px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
            >
              My Workspace
            </button>
            <button
              onClick={() => handleNavigation('/pricing')}
              className="w-full text-left px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavigation('/contact')}
              className="w-full text-left px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
            >
              Contact
            </button>
            {user ? (
              <div className="border-t border-white/10 mt-6 pt-6">
                <div className="flex items-center space-x-3 px-4 py-3 text-white/90">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-medium">
                    {getUserInitial()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs text-white/60">{user.email}</p>
                  </div>
                </div>
                
                {/* Mobile Usage Statistics */}
                {usageStatus?.dailyUsage && (
                  <div className="px-4 py-3 bg-white/5 rounded-lg mx-4 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-xs font-medium">Daily Usage</span>
                      <span className="text-white text-xs font-medium">
                        {usageStatus.subscriptionTier?.toUpperCase() || 'FREE'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-xs">Plans Generated</span>
                      <span className="text-white text-xs font-medium">
                        {usageStatus.dailyUsage.used} / {usageStatus.dailyUsage.limit === 'unlimited' ? '∞' : usageStatus.dailyUsage.limit}
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          usageStatus.dailyUsage.limit === 'unlimited' 
                            ? 'bg-green-400' 
                            : usageStatus.dailyUsage.used >= usageStatus.dailyUsage.limit
                              ? 'bg-red-400' 
                              : usageStatus.dailyUsage.used / (usageStatus.dailyUsage.limit as number) > 0.8
                                ? 'bg-yellow-400'
                                : 'bg-blue-400'
                        }`}
                        style={{
                          width: usageStatus.dailyUsage.limit === 'unlimited' 
                            ? '100%' 
                            : `${Math.min(100, (usageStatus.dailyUsage.used / (usageStatus.dailyUsage.limit as number)) * 100)}%`
                        }}
                      />
                    </div>
                    
                    {usageStatus.dailyUsage.remaining !== 'unlimited' && (
                      <p className="text-white/50 text-xs">
                        {usageStatus.dailyUsage.remaining} remaining today
                      </p>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium mt-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth')}
                className="w-full text-left px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium border-t border-white/10 mt-6 pt-6"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Desktop Navigation - Left Side */}
      <div className="absolute top-6 left-6 z-20 hidden lg:flex items-center space-x-4">
        <button 
          onClick={() => router.push('/workspace')}
          className="px-6 py-2.5 text-white/95 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-all duration-300 font-medium text-sm border border-white/10 hover:border-white/20 backdrop-blur-md shadow-lg hover:shadow-xl tracking-wide"
        >
          My Workspace
        </button>
        <button 
          onClick={() => router.push('/pricing')}
          className="px-6 py-2.5 text-white/95 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-all duration-300 font-medium text-sm border border-white/10 hover:border-white/20 backdrop-blur-md shadow-lg hover:shadow-xl tracking-wide"
        >
          Pricing
        </button>
        <button 
          onClick={() => router.push('/contact')}
          className="px-6 py-2.5 text-white/95 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-all duration-300 font-medium text-sm border border-white/10 hover:border-white/20 backdrop-blur-md shadow-lg hover:shadow-xl tracking-wide"
        >
          Contact
        </button>
      </div>

      {/* Mobile Hamburger Menu */}
      <div className="absolute top-6 left-6 z-20 lg:hidden">
        <button
          onClick={toggleMobileNav}
          className="p-2 text-white/90 hover:text-white bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-md shadow-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Navigation - Profile/Sign In */}
      <div className="absolute top-6 right-6 z-20 hidden lg:block">
        {user ? (
          <div className="relative dropdown-container">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-md shadow-lg hover:shadow-xl flex items-center justify-center text-white font-medium"
            >
              {getUserInitial()}
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 shadow-xl py-2">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-white text-sm font-medium">{user.user_metadata?.full_name || 'User'}</p>
                  <p className="text-white/60 text-xs">{user.email}</p>
                </div>
                
                {/* Usage Statistics */}
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-xs font-medium">Daily Usage</span>
                    <span className="text-white text-xs font-medium">
                      {usageStatus?.subscriptionTier?.toUpperCase() || 'FREE'}
                    </span>
                  </div>
                  
                  {usageStatus?.dailyUsage ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">Plans Generated</span>
                        <span className="text-white text-xs font-medium">
                          {usageStatus.dailyUsage.used} / {usageStatus.dailyUsage.limit === 'unlimited' ? '∞' : usageStatus.dailyUsage.limit}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            usageStatus.dailyUsage.limit === 'unlimited' 
                              ? 'bg-green-400' 
                              : usageStatus.dailyUsage.used >= usageStatus.dailyUsage.limit
                                ? 'bg-red-400' 
                                : usageStatus.dailyUsage.used / (usageStatus.dailyUsage.limit as number) > 0.8
                                  ? 'bg-yellow-400'
                                  : 'bg-blue-400'
                          }`}
                          style={{
                            width: usageStatus.dailyUsage.limit === 'unlimited' 
                              ? '100%' 
                              : `${Math.min(100, (usageStatus.dailyUsage.used / (usageStatus.dailyUsage.limit as number)) * 100)}%`
                          }}
                        />
                      </div>
                      
                      {usageStatus.dailyUsage.remaining !== 'unlimited' && (
                        <p className="text-white/50 text-xs">
                          {usageStatus.dailyUsage.remaining} plans remaining today
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-white/50 text-xs">Loading usage stats...</div>
                  )}
                </div>
                
                <div className="py-1 border-b border-white/10">
                  <button
                    onClick={() => {
                      router.push('/dashboard')
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 transition-colors text-sm"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      router.push('/pricing')
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 transition-colors text-sm"
                  >
                    Upgrade Plan
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    signOut()
                    setIsDropdownOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 transition-colors text-sm"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => router.push('/auth')}
            className="px-6 py-2.5 text-white/95 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-all duration-300 font-medium text-sm border border-white/10 hover:border-white/20 backdrop-blur-md shadow-lg hover:shadow-xl tracking-wide"
          >
            Sign In
          </button>
        )}
      </div>
      
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Beams {...beamsProps} />
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-8 md:py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center space-x-3 mb-6 md:mb-8">
            <div className="w-2 h-2 bg-white/80 rounded-full shadow-lg" />
            <span className="text-xs font-medium text-white/90 tracking-wider uppercase bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">AI-Powered Business Planning</span>
            <div className="w-2 h-2 bg-white/80 rounded-full shadow-lg" />
          </div>
          
          <h1 className="text-3xl md:text-6xl font-light text-white mb-6 md:mb-8 leading-tight drop-shadow-2xl">
            Ignite Your Business Ideas
            <span className="block font-normal text-white/90 drop-shadow-xl">Into Actionable Plans</span>
          </h1>
          <p className="text-base md:text-lg text-white mb-8 md:mb-12 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-xl bg-black/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
            Get a detailed, step-by-step action plan tailored to your specific business idea. 
            Powered by AI with verified industry data and real-time market research.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 md:p-8 mb-8 md:mb-16" suppressHydrationWarning>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="idea" className="block text-left text-lg font-medium text-white mb-3">
                What&apos;s your business idea? <span className="text-red-400">*</span>
              </label>
              <textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your business idea in detail..."
                className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400/50 resize-none h-32 font-light transition-all backdrop-blur-sm shadow-lg"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  outline: 'none'
                }}
                required
                autoComplete="off"
              />
            </div>

            {/* Optional Fields Section */}
            <div className="border-t border-white/20 pt-8">
              <h3 className="text-lg font-medium text-white mb-6">Optional Details (helps create more precise plans)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-left font-semibold text-white mb-2">
                    Location
                  </label>
                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-white/50 font-light text-white transition-all bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#000', color: '#fff' }}>Select location...</option>
                    <optgroup label="United States" style={{ backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold' }}>
                      <option value="New York, NY" style={{ backgroundColor: '#000', color: '#fff' }}>New York, NY</option>
                      <option value="Los Angeles, CA" style={{ backgroundColor: '#000', color: '#fff' }}>Los Angeles, CA</option>
                      <option value="Chicago, IL" style={{ backgroundColor: '#000', color: '#fff' }}>Chicago, IL</option>
                      <option value="Houston, TX" style={{ backgroundColor: '#000', color: '#fff' }}>Houston, TX</option>
                      <option value="Phoenix, AZ" style={{ backgroundColor: '#000', color: '#fff' }}>Phoenix, AZ</option>
                      <option value="Philadelphia, PA" style={{ backgroundColor: '#000', color: '#fff' }}>Philadelphia, PA</option>
                      <option value="San Antonio, TX" style={{ backgroundColor: '#000', color: '#fff' }}>San Antonio, TX</option>
                      <option value="San Diego, CA" style={{ backgroundColor: '#000', color: '#fff' }}>San Diego, CA</option>
                      <option value="Dallas, TX" style={{ backgroundColor: '#000', color: '#fff' }}>Dallas, TX</option>
                      <option value="San Jose, CA" style={{ backgroundColor: '#000', color: '#fff' }}>San Jose, CA</option>
                      <option value="Austin, TX" style={{ backgroundColor: '#000', color: '#fff' }}>Austin, TX</option>
                      <option value="Jacksonville, FL" style={{ backgroundColor: '#000', color: '#fff' }}>Jacksonville, FL</option>
                      <option value="San Francisco, CA" style={{ backgroundColor: '#000', color: '#fff' }}>San Francisco, CA</option>
                      <option value="Columbus, OH" style={{ backgroundColor: '#000', color: '#fff' }}>Columbus, OH</option>
                      <option value="Charlotte, NC" style={{ backgroundColor: '#000', color: '#fff' }}>Charlotte, NC</option>
                      <option value="Fort Worth, TX" style={{ backgroundColor: '#000', color: '#fff' }}>Fort Worth, TX</option>
                      <option value="Indianapolis, IN" style={{ backgroundColor: '#000', color: '#fff' }}>Indianapolis, IN</option>
                      <option value="Seattle, WA" style={{ backgroundColor: '#000', color: '#fff' }}>Seattle, WA</option>
                      <option value="Denver, CO" style={{ backgroundColor: '#000', color: '#fff' }}>Denver, CO</option>
                      <option value="Boston, MA" style={{ backgroundColor: '#000', color: '#fff' }}>Boston, MA</option>
                      <option value="Miami, FL" style={{ backgroundColor: '#000', color: '#fff' }}>Miami, FL</option>
                      <option value="Nashville, TN" style={{ backgroundColor: '#000', color: '#fff' }}>Nashville, TN</option>
                      <option value="Atlanta, GA" style={{ backgroundColor: '#000', color: '#fff' }}>Atlanta, GA</option>
                      <option value="Las Vegas, NV" style={{ backgroundColor: '#000', color: '#fff' }}>Las Vegas, NV</option>
                      <option value="Portland, OR" style={{ backgroundColor: '#000', color: '#fff' }}>Portland, OR</option>
                    </optgroup>
                    <optgroup label="Canada" style={{ backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold' }}>
                      <option value="Toronto, ON" style={{ backgroundColor: '#000', color: '#fff' }}>Toronto, ON</option>
                      <option value="Vancouver, BC" style={{ backgroundColor: '#000', color: '#fff' }}>Vancouver, BC</option>
                      <option value="Montreal, QC" style={{ backgroundColor: '#000', color: '#fff' }}>Montreal, QC</option>
                      <option value="Calgary, AB" style={{ backgroundColor: '#000', color: '#fff' }}>Calgary, AB</option>
                      <option value="Edmonton, AB" style={{ backgroundColor: '#000', color: '#fff' }}>Edmonton, AB</option>
                      <option value="Ottawa, ON" style={{ backgroundColor: '#000', color: '#fff' }}>Ottawa, ON</option>
                    </optgroup>
                    <optgroup label="United Kingdom" style={{ backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold' }}>
                      <option value="London, UK" style={{ backgroundColor: '#000', color: '#fff' }}>London, UK</option>
                      <option value="Manchester, UK" style={{ backgroundColor: '#000', color: '#fff' }}>Manchester, UK</option>
                      <option value="Birmingham, UK" style={{ backgroundColor: '#000', color: '#fff' }}>Birmingham, UK</option>
                      <option value="Edinburgh, UK" style={{ backgroundColor: '#000', color: '#fff' }}>Edinburgh, UK</option>
                      <option value="Glasgow, UK" style={{ backgroundColor: '#000', color: '#fff' }}>Glasgow, UK</option>
                      <option value="Liverpool, UK" style={{ backgroundColor: '#000', color: '#fff' }}>Liverpool, UK</option>
                    </optgroup>
                    <optgroup label="Australia" style={{ backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold' }}>
                      <option value="Sydney, AU" style={{ backgroundColor: '#000', color: '#fff' }}>Sydney, AU</option>
                      <option value="Melbourne, AU" style={{ backgroundColor: '#000', color: '#fff' }}>Melbourne, AU</option>
                      <option value="Brisbane, AU" style={{ backgroundColor: '#000', color: '#fff' }}>Brisbane, AU</option>
                      <option value="Perth, AU" style={{ backgroundColor: '#000', color: '#fff' }}>Perth, AU</option>
                      <option value="Adelaide, AU" style={{ backgroundColor: '#000', color: '#fff' }}>Adelaide, AU</option>
                    </optgroup>
                    <optgroup label="Europe" style={{ backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold' }}>
                      <option value="Paris, France" style={{ backgroundColor: '#000', color: '#fff' }}>Paris, France</option>
                      <option value="Berlin, Germany" style={{ backgroundColor: '#000', color: '#fff' }}>Berlin, Germany</option>
                      <option value="Madrid, Spain" style={{ backgroundColor: '#000', color: '#fff' }}>Madrid, Spain</option>
                      <option value="Rome, Italy" style={{ backgroundColor: '#000', color: '#fff' }}>Rome, Italy</option>
                      <option value="Amsterdam, Netherlands" style={{ backgroundColor: '#000', color: '#fff' }}>Amsterdam, Netherlands</option>
                      <option value="Zurich, Switzerland" style={{ backgroundColor: '#000', color: '#fff' }}>Zurich, Switzerland</option>
                      <option value="Stockholm, Sweden" style={{ backgroundColor: '#000', color: '#fff' }}>Stockholm, Sweden</option>
                      <option value="Copenhagen, Denmark" style={{ backgroundColor: '#000', color: '#fff' }}>Copenhagen, Denmark</option>
                    </optgroup>
                    <optgroup label="Asia" style={{ backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold' }}>
                      <option value="Tokyo, Japan" style={{ backgroundColor: '#000', color: '#fff' }}>Tokyo, Japan</option>
                      <option value="Singapore" style={{ backgroundColor: '#000', color: '#fff' }}>Singapore</option>
                      <option value="Hong Kong" style={{ backgroundColor: '#000', color: '#fff' }}>Hong Kong</option>
                      <option value="Seoul, South Korea" style={{ backgroundColor: '#000', color: '#fff' }}>Seoul, South Korea</option>
                      <option value="Mumbai, India" style={{ backgroundColor: '#000', color: '#fff' }}>Mumbai, India</option>
                      <option value="Delhi, India" style={{ backgroundColor: '#000', color: '#fff' }}>Delhi, India</option>
                      <option value="Shanghai, China" style={{ backgroundColor: '#000', color: '#fff' }}>Shanghai, China</option>
                      <option value="Beijing, China" style={{ backgroundColor: '#000', color: '#fff' }}>Beijing, China</option>
                    </optgroup>
                    <optgroup label="Other" style={{ backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold' }}>
                      <option value="São Paulo, Brazil" style={{ backgroundColor: '#000', color: '#fff' }}>São Paulo, Brazil</option>
                      <option value="Mexico City, Mexico" style={{ backgroundColor: '#000', color: '#fff' }}>Mexico City, Mexico</option>
                      <option value="Dubai, UAE" style={{ backgroundColor: '#000', color: '#fff' }}>Dubai, UAE</option>
                      <option value="Tel Aviv, Israel" style={{ backgroundColor: '#000', color: '#fff' }}>Tel Aviv, Israel</option>
                    </optgroup>
                  </select>
                  <p className="text-xs text-gray-200 mt-1 font-medium drop-shadow-lg">Select your business location for local regulations and market data</p>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-left font-semibold text-white mb-2">
                    Budget Range
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-48 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-white/50 text-sm font-light text-white transition-all bg-black/50 backdrop-blur-sm border border-white/20 shadow-lg"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#ffffff'
                      }}
                    >
                      <option value="USD" style={{ backgroundColor: '#000000', color: '#ffffff' }}>USD - United States</option>
                      <option value="EUR" style={{ backgroundColor: '#000000', color: '#ffffff' }}>EUR - Eurozone</option>
                      <option value="GBP" style={{ backgroundColor: '#000000', color: '#ffffff' }}>GBP - United Kingdom</option>
                      <option value="CAD" style={{ backgroundColor: '#000000', color: '#ffffff' }}>CAD - Canada</option>
                      <option value="AUD" style={{ backgroundColor: '#000000', color: '#ffffff' }}>AUD - Australia</option>
                      <option value="JPY" style={{ backgroundColor: '#000000', color: '#ffffff' }}>JPY - Japan</option>
                      <option value="CHF" style={{ backgroundColor: '#000000', color: '#ffffff' }}>CHF - Switzerland</option>
                      <option value="CNY" style={{ backgroundColor: '#000000', color: '#ffffff' }}>CNY - China</option>
                      <option value="INR" style={{ backgroundColor: '#000000', color: '#ffffff' }}>INR - India</option>
                      <option value="BRL" style={{ backgroundColor: '#000000', color: '#ffffff' }}>BRL - Brazil</option>
                      <option value="MXN" style={{ backgroundColor: '#000000', color: '#ffffff' }}>MXN - Mexico</option>
                      <option value="SGD" style={{ backgroundColor: '#000000', color: '#ffffff' }}>SGD - Singapore</option>
                    </select>
                    <select
                      id="budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-white/50 font-light text-white transition-all bg-black/50 backdrop-blur-sm border border-white/20 shadow-lg"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#ffffff'
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Select budget range...</option>
                      <option value="under-5k" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Under {currency === 'JPY' ? '¥750,000' : currency === 'INR' ? '₹400,000' : currency === 'EUR' ? '€4,500' : currency === 'GBP' ? '£4,000' : currency === 'CAD' ? 'C$6,500' : currency === 'AUD' ? 'A$7,500' : currency === 'CHF' ? 'CHF 4,500' : currency === 'CNY' ? '¥35,000' : currency === 'BRL' ? 'R$25,000' : currency === 'MXN' ? '$90,000' : currency === 'SGD' ? 'S$6,500' : '$5,000'}</option>
                      <option value="5k-10k" style={{ backgroundColor: '#000000', color: '#ffffff' }}>{currency === 'JPY' ? '¥750,000 - ¥1,500,000' : currency === 'INR' ? '₹400,000 - ₹800,000' : currency === 'EUR' ? '€4,500 - €9,000' : currency === 'GBP' ? '£4,000 - £8,000' : currency === 'CAD' ? 'C$6,500 - C$13,000' : currency === 'AUD' ? 'A$7,500 - A$15,000' : currency === 'CHF' ? 'CHF 4,500 - CHF 9,000' : currency === 'CNY' ? '¥35,000 - ¥70,000' : currency === 'BRL' ? 'R$25,000 - R$50,000' : currency === 'MXN' ? '$90,000 - $180,000' : currency === 'SGD' ? 'S$6,500 - S$13,000' : '$5,000 - $10,000'}</option>
                      <option value="10k-25k" style={{ backgroundColor: '#000000', color: '#ffffff' }}>{currency === 'JPY' ? '¥1,500,000 - ¥3,750,000' : currency === 'INR' ? '₹800,000 - ₹2,000,000' : currency === 'EUR' ? '€9,000 - €22,500' : currency === 'GBP' ? '£8,000 - £20,000' : currency === 'CAD' ? 'C$13,000 - C$32,500' : currency === 'AUD' ? 'A$15,000 - A$37,500' : currency === 'CHF' ? 'CHF 9,000 - CHF 22,500' : currency === 'CNY' ? '¥70,000 - ¥175,000' : currency === 'BRL' ? 'R$50,000 - R$125,000' : currency === 'MXN' ? '$180,000 - $450,000' : currency === 'SGD' ? 'S$13,000 - S$32,500' : '$10,000 - $25,000'}</option>
                      <option value="25k-50k" style={{ backgroundColor: '#000000', color: '#ffffff' }}>{currency === 'JPY' ? '¥3,750,000 - ¥7,500,000' : currency === 'INR' ? '₹2,000,000 - ₹4,000,000' : currency === 'EUR' ? '€22,500 - €45,000' : currency === 'GBP' ? '£20,000 - £40,000' : currency === 'CAD' ? 'C$32,500 - C$65,000' : currency === 'AUD' ? 'A$37,500 - A$75,000' : currency === 'CHF' ? 'CHF 22,500 - CHF 45,000' : currency === 'CNY' ? '¥175,000 - ¥350,000' : currency === 'BRL' ? 'R$125,000 - R$250,000' : currency === 'MXN' ? '$450,000 - $900,000' : currency === 'SGD' ? 'S$32,500 - S$65,000' : '$25,000 - $50,000'}</option>
                      <option value="50k-100k" style={{ backgroundColor: '#000000', color: '#ffffff' }}>{currency === 'JPY' ? '¥7,500,000 - ¥15,000,000' : currency === 'INR' ? '₹4,000,000 - ₹8,000,000' : currency === 'EUR' ? '€45,000 - €90,000' : currency === 'GBP' ? '£40,000 - £80,000' : currency === 'CAD' ? 'C$65,000 - C$130,000' : currency === 'AUD' ? 'A$75,000 - A$150,000' : currency === 'CHF' ? 'CHF 45,000 - CHF 90,000' : currency === 'CNY' ? '¥350,000 - ¥700,000' : currency === 'BRL' ? 'R$250,000 - R$500,000' : currency === 'MXN' ? '$900,000 - $1,800,000' : currency === 'SGD' ? 'S$65,000 - S$130,000' : '$50,000 - $100,000'}</option>
                      <option value="100k-250k" style={{ backgroundColor: '#000000', color: '#ffffff' }}>{currency === 'JPY' ? '¥15,000,000 - ¥37,500,000' : currency === 'INR' ? '₹8,000,000 - ₹20,000,000' : currency === 'EUR' ? '€90,000 - €225,000' : currency === 'GBP' ? '£80,000 - £200,000' : currency === 'CAD' ? 'C$130,000 - C$325,000' : currency === 'AUD' ? 'A$150,000 - A$375,000' : currency === 'CHF' ? 'CHF 90,000 - CHF 225,000' : currency === 'CNY' ? '¥700,000 - ¥1,750,000' : currency === 'BRL' ? 'R$500,000 - R$1,250,000' : currency === 'MXN' ? '$1,800,000 - $4,500,000' : currency === 'SGD' ? 'S$130,000 - S$325,000' : '$100,000 - $250,000'}</option>
                      <option value="250k+" style={{ backgroundColor: '#000000', color: '#ffffff' }}>{currency === 'JPY' ? '¥37,500,000+' : currency === 'INR' ? '₹20,000,000+' : currency === 'EUR' ? '€225,000+' : currency === 'GBP' ? '£200,000+' : currency === 'CAD' ? 'C$325,000+' : currency === 'AUD' ? 'A$375,000+' : currency === 'CHF' ? 'CHF 225,000+' : currency === 'CNY' ? '¥1,750,000+' : currency === 'BRL' ? 'R$1,250,000+' : currency === 'MXN' ? '$4,500,000+' : currency === 'SGD' ? 'S$325,000+' : '$250,000+'}</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-200 mt-1 font-medium drop-shadow-lg">Select your preferred currency and budget range</p>
                </div>

                <div>
                  <label htmlFor="timeline" className="block text-left font-semibold text-white mb-2">
                    Timeline to Launch
                  </label>
                  <select
                    id="timeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-white/50 font-light text-white transition-all bg-black/50 backdrop-blur-sm border border-white/20 shadow-lg"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Select timeline...</option>
                    <option value="1-month" style={{ backgroundColor: '#000000', color: '#ffffff' }}>1 month</option>
                    <option value="2-3-months" style={{ backgroundColor: '#000000', color: '#ffffff' }}>2-3 months</option>
                    <option value="3-6-months" style={{ backgroundColor: '#000000', color: '#ffffff' }}>3-6 months</option>
                    <option value="6-12-months" style={{ backgroundColor: '#000000', color: '#ffffff' }}>6-12 months</option>
                    <option value="12-months+" style={{ backgroundColor: '#000000', color: '#ffffff' }}>12+ months</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-left font-semibold text-white mb-2">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-white/50 font-light text-white transition-all bg-black/50 backdrop-blur-sm border border-white/20 shadow-lg"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Auto-detect from idea...</option>
                    <option value="DIGITAL" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Website / App / SaaS</option>
                    <option value="PHYSICAL/SERVICE" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Physical Store / Service Business</option>
                    <option value="HYBRID" style={{ backgroundColor: '#000000', color: '#ffffff' }}>E-commerce with Physical Components</option>
                    <option value="MANUFACTURING" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Manufacturing</option>
                    <option value="CONSULTING" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Consulting / Professional Services</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!idea.trim()}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:bg-white/10 text-white font-medium py-4 px-8 rounded-xl text-lg transition-all border border-white/30 shadow-lg"
            >
              {!user ? 'Sign In to Generate Plan →' : 'Generate My Action Plan →'}
            </button>
          </form>
        </div>

        {/* Example Prompts */}
        <div className="mb-8 md:mb-16">
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-lg font-medium text-white mb-2 drop-shadow-lg">Try these examples:</h3>
            <p className="text-sm text-white/70 font-light">Click any example to get started</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examplePrompts.map((prompt, index) => (
              <ExamplePrompt
                key={index}
                prompt={`"${prompt}"`}
                onClick={handleExampleClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* New Plan Modal */}
      <NewPlanModal
        isOpen={isNewPlanModalOpen}
        onClose={() => setIsNewPlanModalOpen(false)}
      />
    </div>
  )
})
