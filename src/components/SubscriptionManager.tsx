'use client'

import { useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/components/AuthProvider'
import { CreditCard, Calendar, ArrowRight, Loader2 } from 'lucide-react'

export default function SubscriptionManager() {
  const { user } = useAuth()
  const { usageStatus, loading } = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true)
      
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to access customer portal')
      }

      const { url } = await response.json()
      window.location.href = url

    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open customer portal. Please contact support.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!usageStatus) return null

  const isFreePlan = usageStatus.subscriptionTier === 'free'
  const isPaidPlan = ['pro', 'pro+'].includes(usageStatus.subscriptionTier)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Subscription</h3>
            <p className="text-sm text-gray-500">Manage your plan and billing</p>
          </div>
        </div>
        
        {/* Plan Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          usageStatus.subscriptionTier === 'free' 
            ? 'bg-gray-100 text-gray-700'
            : usageStatus.subscriptionTier === 'pro'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-purple-100 text-purple-700'
        }`}>
          {usageStatus.subscriptionTier.toUpperCase()}
        </div>
      </div>

      {/* Current Plan Info */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Current Plan</span>
          <span className="font-medium text-gray-900">
            {usageStatus.subscriptionTier === 'free' ? 'Basic (Free)' 
             : usageStatus.subscriptionTier === 'pro' ? 'Pro' 
             : 'Pro+'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`font-medium ${
            usageStatus.subscriptionStatus === 'active' ? 'text-green-600' : 'text-red-600'
          }`}>
            {usageStatus.subscriptionStatus.charAt(0).toUpperCase() + usageStatus.subscriptionStatus.slice(1)}
          </span>
        </div>

        {/* Usage Info */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Daily Usage</span>
          <span className="font-medium text-gray-900">
            {usageStatus.dailyUsage.used} / {
              usageStatus.dailyUsage.limit === 'unlimited' ? '∞' : usageStatus.dailyUsage.limit
            } plans
          </span>
        </div>

        {/* Progress Bar */}
        {usageStatus.dailyUsage.limit !== 'unlimited' && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                usageStatus.dailyUsage.used >= (usageStatus.dailyUsage.limit as number) 
                  ? 'bg-red-500' 
                  : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min(100, (usageStatus.dailyUsage.used / (usageStatus.dailyUsage.limit as number)) * 100)}%`
              }}
            />
          </div>
        )}

        {/* Reset Date */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Usage Resets</span>
          <span className="text-sm text-gray-900">{usageStatus.dailyUsage.resetDate}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {isFreePlan ? (
          <button
            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            Upgrade Plan
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {portalLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening Portal...
              </>
            ) : (
              <>
                Manage Subscription
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        )}
        
        {isPaidPlan && (
          <p className="text-xs text-gray-500 text-center">
            You can update payment methods, view invoices, or cancel your subscription in the customer portal.
          </p>
        )}
      </div>
    </div>
  )
}
