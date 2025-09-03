'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { stripe } from '@/lib/stripe'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setError('No session ID found')
      setLoading(false)
      return
    }

    // Verify the session (optional - you could also just show success immediately)
    const verifySession = async () => {
      try {
        // In a real app, you might want to verify this server-side
        // For now, we'll just show the success message
        setLoading(false)
      } catch (err) {
        setError('Failed to verify payment')
        setLoading(false)
      }
    }

    verifySession()
  }, [searchParams])

  const handleContinue = () => {
    router.push('/generate')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification Failed</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => router.push('/pricing')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Pricing
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Welcome to PlanSpark Pro! Your subscription is now active and you can start creating unlimited business plans.
          </p>

          {/* Benefits List */}
          <div className="bg-white rounded-xl p-6 mb-8 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">What's included:</h3>
            <ul className="space-y-2 text-sm text-gray-600 text-left">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Unlimited business plans
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Advanced competitor analysis
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                PDF export functionality
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Priority customer support
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContinue}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              Start Creating Plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            
            <button
              onClick={() => router.push('/workspace')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View My Plans
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 mt-6">
            You can manage your subscription anytime from your account settings.
          </p>
        </div>
      </div>
    </div>
  )
}
