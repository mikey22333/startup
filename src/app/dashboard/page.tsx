'use client'

import { useAuth } from '@/components/AuthProvider'
import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, User, CreditCard, BarChart3, Calendar, Crown, CheckCircle2, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { usageStatus, loading: usageLoading } = useSubscription()
  const router = useRouter()
  const [recentPlans, setRecentPlans] = useState<any[]>([])

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  if (authLoading || usageLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    )
  }

  if (!user) return null

  const getUsageColor = () => {
    if (!usageStatus?.dailyUsage || usageStatus.dailyUsage.limit === 'unlimited') return 'text-green-400'
    const percentage = usageStatus.dailyUsage.used / (usageStatus.dailyUsage.limit as number)
    if (percentage >= 1) return 'text-red-400'
    if (percentage > 0.8) return 'text-yellow-400'
    return 'text-blue-400'
  }

  const getProgressWidth = () => {
    if (!usageStatus?.dailyUsage || usageStatus.dailyUsage.limit === 'unlimited') return '100%'
    return `${Math.min(100, (usageStatus.dailyUsage.used / (usageStatus.dailyUsage.limit as number)) * 100)}%`
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">Dashboard</h1>
                <p className="text-sm text-white/60">Manage your business plans and account</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-medium">
                {user.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm">{user.user_metadata?.full_name || 'User'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Usage Stats */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs px-2 py-1 bg-white/10 rounded-full">
                {usageStatus?.subscriptionTier?.toUpperCase() || 'FREE'}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Daily Usage</h3>
            <p className="text-2xl font-bold mb-2">
              {usageStatus?.dailyUsage?.used || 0} / {usageStatus?.dailyUsage?.limit === 'unlimited' ? '∞' : usageStatus?.dailyUsage?.limit || 1}
            </p>
            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getUsageColor().replace('text-', 'bg-')}`}
                style={{ width: getProgressWidth() }}
              />
            </div>
            <p className="text-xs text-white/60">
              {usageStatus?.dailyUsage?.remaining === 'unlimited' 
                ? 'Unlimited plans available'
                : `${usageStatus?.dailyUsage?.remaining || 0} remaining today`
              }
            </p>
          </div>

          {/* Account Type */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Crown className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">Subscription</h3>
            <p className="text-2xl font-bold mb-2 capitalize">
              {usageStatus?.subscriptionTier || 'Free'}
            </p>
            <p className="text-xs text-white/60">
              {usageStatus?.subscriptionTier === 'free' ? 'Limited features' : 'Premium features'}
            </p>
          </div>

          {/* Account Status */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">Account Status</h3>
            <p className="text-2xl font-bold mb-2">
              {usageStatus?.subscriptionStatus || 'Active'}
            </p>
            <p className="text-xs text-white/60">Account in good standing</p>
          </div>

          {/* Reset Date */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">Usage Reset</h3>
            <p className="text-sm font-medium mb-2">
              {usageStatus?.dailyUsage?.resetDate ? new Date(usageStatus.dailyUsage.resetDate).toLocaleDateString() : 'Daily'}
            </p>
            <p className="text-xs text-white/60">Next reset date</p>
          </div>
        </div>

        {/* Account Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60">Full Name</label>
                <p className="text-white font-medium">{user.user_metadata?.full_name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-white/60">Email Address</label>
                <p className="text-white font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-white/60">Account Created</label>
                <p className="text-white font-medium">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <CreditCard className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold">Subscription Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60">Current Plan</label>
                <p className="text-white font-medium capitalize">
                  {usageStatus?.subscriptionTier || 'Free'} Plan
                </p>
              </div>
              <div>
                <label className="text-sm text-white/60">Daily Limit</label>
                <p className="text-white font-medium">
                  {usageStatus?.dailyUsage?.limit === 'unlimited' ? 'Unlimited' : `${usageStatus?.dailyUsage?.limit || 1} plans per day`}
                </p>
              </div>
              <div>
                <label className="text-sm text-white/60">Status</label>
                <p className="text-white font-medium">{usageStatus?.subscriptionStatus || 'Active'}</p>
              </div>
              
              {usageStatus?.subscriptionTier === 'free' && (
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/pricing')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        {usageStatus?.subscriptionTier === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Maximize Your Free Plan</h3>
                <ul className="text-white/80 space-y-1 text-sm">
                  <li>• Generate up to {usageStatus.dailyUsage?.limit || 1} business plan per day</li>
                  <li>• Export plans to PDF format</li>
                  <li>• Access to AI-powered market analysis</li>
                  <li>• Upgrade to Pro for unlimited plans and advanced features</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
