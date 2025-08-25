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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Panel - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="max-w-sm w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              Idea2Action
            </div>
          </div>

          {/* Sign In Header */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {isSignUp ? 'Create Account' : 'Sign in'}
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleEmailAuth} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder-gray-500"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-800">
                  Remember me
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-white">{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </div>
              ) : (
                <span className="text-white">{isSignUp ? 'Create Account' : 'Sign in'}</span>
              )}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-700">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setFormData({ email: '', password: '', full_name: '' })
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>

            {!isSignUp && (
              <div className="text-center">
                <button type="button" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Forgot Password
                </button>
              </div>
            )}
          </form>

          {/* Social Login */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 bg-white"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-gray-900 font-medium">Continue with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Dark Minimalistic */}
      <div className="flex-1 bg-black flex items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          {/* Simple Logo */}
          <div className="mb-12">
            <div className="w-16 h-16 mx-auto bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <span className="text-xl font-bold">I2A</span>
            </div>
            <h3 className="text-lg font-medium text-white/90">Idea2Action</h3>
          </div>

          {/* Simple Message */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Transform Ideas Into Action</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Create professional business plans with AI assistance and real market data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
