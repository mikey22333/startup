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
  const [lastRefresh, setLastRefresh] = useState<number>(0)

  const fetchUsageStatus = async (forceRefresh = false) => {
    if (!user || authLoading) return

    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Fetching usage status for user:', user.email)
      
      // Add cache busting for force refresh
      const timestamp = forceRefresh ? Date.now() : Math.floor(Date.now() / 60000) // 1 minute cache
      
      // Get user profile directly from Supabase (client-side with auth session)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Profile fetch error:', profileError)
        throw new Error('Failed to fetch user profile')
      }

      let userProfile = profile

      // If no profile exists, create one
      if (!userProfile) {
        console.log('📝 Creating new user profile')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            subscription_tier: 'free',
            subscription_status: 'active',
            daily_plans_used: 0,
            daily_plans_reset_date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single()

        if (createError) {
          console.error('❌ Failed to create profile:', createError)
          throw new Error('Failed to create user profile')
        }

        userProfile = newProfile
        console.log('✅ New profile created:', newProfile)
      }

      console.log('✅ Profile fetched:', userProfile)

      // Check if daily usage needs reset
      const today = new Date().toISOString().split('T')[0]
      let currentUsage = userProfile.daily_plans_used || 0
      
      if (userProfile.daily_plans_reset_date !== today) {
        // Reset daily usage
        const { error: resetError } = await supabase
          .from('profiles')
          .update({
            daily_plans_used: 0,
            daily_plans_reset_date: today
          })
          .eq('id', user.id)
        
        if (!resetError) {
          currentUsage = 0
          console.log('✅ Daily usage reset for new day')
        }
      }

      // Calculate limits based on subscription tier
      const tier = userProfile.subscription_tier || 'free'
      const dailyLimit = tier === 'free' ? 1 
                       : tier === 'pro' ? 5 
                       : Number.MAX_SAFE_INTEGER // pro+ gets unlimited

      const remaining = dailyLimit === Number.MAX_SAFE_INTEGER 
                       ? 'unlimited' 
                       : Math.max(0, dailyLimit - currentUsage)

      const usageData: UsageStatus = {
        userId: user.id,
        email: user.email || '',
        subscriptionTier: tier as 'free' | 'pro' | 'pro+',
        subscriptionStatus: userProfile.subscription_status || 'active',
        dailyUsage: {
          used: currentUsage,
          limit: dailyLimit === Number.MAX_SAFE_INTEGER ? 'unlimited' : dailyLimit,
          remaining,
          resetDate: today
        }
      }

      console.log('✅ Usage status calculated:', usageData)
      setUsageStatus(usageData)
    } catch (err) {
      console.error('❌ Usage status fetch error:', err)
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
      await fetchUsageStatus(true) // Force refresh after upgrade
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade subscription')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Manual refresh function
  const refreshUsageStatus = async (forceRefresh = true) => {
    return await fetchUsageStatus(forceRefresh)
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

  // Set up periodic refresh every 30 seconds to catch webhook updates
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchUsageStatus(true)
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [user])

  return {
    usageStatus,
    loading,
    error,
    refreshUsageStatus,
    upgradeSubscription
  }
}
