import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

export interface UsageStatus {
  userId: string
  email: string
  subscriptionTier: 'free' | 'pro' | 'pro+'
  subscriptionStatus: string
  dailyUsage: {
    used: number
    limit: number | 'unlimited'
    remaining: number | 'unlimited'
    resetDate: string
  }
}

export function useSubscription() {
  const { user, loading: authLoading } = useAuth()
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsageStatus = async () => {
    if (!user || authLoading) return

    try {
      setLoading(true)
      setError(null)

      // Check if user is authenticated
      if (!user) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/subscription/status')

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch status' }))
        throw new Error(errorData.error || 'Failed to fetch usage status')
      }

      const data = await response.json()
      setUsageStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch usage status')
    } finally {
      setLoading(false)
    }
  }

  const upgradeSubscription = async (newTier: 'free' | 'pro' | 'pro+') => {
    if (!user) throw new Error('Not authenticated')

    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ newTier })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upgrade failed' }))
        throw new Error(errorData.error || 'Failed to upgrade subscription')
      }

      const data = await response.json()
      
      // Refresh usage status after upgrade
      await fetchUsageStatus()
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade subscription')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch when auth is loaded and user exists
    if (!authLoading && user) {
      fetchUsageStatus()
    } else if (!authLoading && !user) {
      // Clear usage status when user logs out
      setUsageStatus(null)
      setError(null)
    }
  }, [user, authLoading])

  return {
    usageStatus,
    loading,
    error,
    refreshUsageStatus: fetchUsageStatus,
    upgradeSubscription
  }
}
