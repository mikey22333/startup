'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/auth'

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  })
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return
    }

    if (isSignUp && !formData.full_name) {
      setError('Please enter your full name')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      if (isSignUp) {
        const result = await signUpWithEmail({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name
        })
        
        // Check if user is immediately confirmed (email verification disabled)
        if (result.user && result.user.email_confirmed_at) {
          // User is confirmed, redirect to home
          router.push('/')
        } else if (result.user && !result.user.email_confirmed_at) {
          // Email verification required
          setError('Please check your email to verify your account before signing in.')
          setIsSignUp(false)
          // Clear form data except email for convenience
          setFormData(prev => ({ ...prev, password: '', full_name: '' }))
        }
      } else {
        await signInWithEmail({
          email: formData.email,
          password: formData.password
        })
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await signInWithGoogle()
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign in')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left Side - Dark Form */}
      <div className="flex-1 flex items-center justify-center px-8 lg:px-16 relative">
        {/* Ambient lighting effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10 max-w-sm w-full space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isSignUp ? 'Join PlanSpark to start building' : 'Welcome back to PlanSpark'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleEmailAuth}>
            {isSignUp && (
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="full_name"
                    type="text"
                    name="full_name"
                    required={isSignUp}
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter your full name"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter password"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {!isSignUp && (
              <div className="text-right">
                <button type="button" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 focus:ring-1 focus:ring-blue-500/30 transition-all duration-300 disabled:opacity-50 text-white backdrop-blur-sm transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Toggle */}
            <div className="text-center pt-4">
              <span className="text-gray-400 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              {' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setFormData({ email: '', password: '', full_name: '' })
                }}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - AI-Generated Visual */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Geometric pattern background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          {/* Triangular mesh pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="triangles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <polygon points="20,5 35,30 5,30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                  <polygon points="20,35 5,10 35,10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#triangles)"/>
            </svg>
          </div>
          
          {/* Hexagonal overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="hexagons" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                  <polygon points="30,2 52,15 52,37 30,50 8,37 8,15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexagons)"/>
            </svg>
          </div>
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-24 w-16 h-16 border border-white/20 rotate-45 animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-blue-500/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-16 w-8 h-8 bg-purple-500/20 rotate-12 animate-pulse delay-500"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-20">
          <div className="max-w-md">
            <div className="mb-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
                AI POWERED
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 leading-tight">
                A new way to experience business planning
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                in the infinite virtual space of possibilities.
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-sm">AI-driven market analysis</span>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                <span className="text-sm">Real-time competitive intelligence</span>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm">Automated financial projections</span>
              </div>
            </div>

          </div>
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/20"></div>
      </div>
    </div>
  )
}
