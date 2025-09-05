'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const transactionId = searchParams.get('_ptxn')
    
    if (!transactionId) {
      setError('No transaction ID found')
      setLoading(false)
      return
    }

    // For Paddle, show success immediately since webhook handles backend processing
    const verifySession = async () => {
      try {
        // Paddle webhook handles the backend processing
        // We can show success immediately
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
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 text-red-600">❌</div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.push('/pricing')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Payment Successful! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Welcome to PlanSpark Pro! Your subscription is now active and you have access to all premium features.
        </p>

        {/* What's Next */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">What's Next?</h2>
          
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <h3 className="font-medium text-gray-900">Create Your First Plan</h3>
              <p className="text-sm text-gray-600">Start with your business idea and let our AI generate a comprehensive plan.</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-sm">2</span>
              </div>
              <h3 className="font-medium text-gray-900">Export as PDF</h3>
              <p className="text-sm text-gray-600">Download professional, investor-ready business plans instantly.</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">3</span>
              </div>
              <h3 className="font-medium text-gray-900">Access Premium Features</h3>
              <p className="text-sm text-gray-600">Enjoy unlimited plans, advanced analytics, and priority support.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
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
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}
