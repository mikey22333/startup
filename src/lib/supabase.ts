import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
}

// Database types
export interface Industry {
  id: number
  name: string
  type: 'DIGITAL' | 'PHYSICAL/SERVICE'
  keywords: string[]
  created_at: string
}

export interface LegalRequirement {
  id: number
  industry_id: number
  location: string
  requirement: string
  description: string
  cost_estimate?: string
  created_at: string
}

export interface AvgStartupCost {
  id: number
  industry_id: number
  location: string
  cost_range_min: number
  cost_range_max: number
  description: string
  created_at: string
}

export interface CommonTool {
  id: number
  industry_id: number
  name: string
  description: string
  cost: string
  link?: string
  category: string
  created_at: string
}
