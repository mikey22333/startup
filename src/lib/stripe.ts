import Stripe from 'stripe'

// Only initialize Stripe if the secret key is available
// This prevents build errors when environment variables aren't set
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'PlanSpark',
    version: '1.0.0',
  },
}) : null

// Stripe price IDs - Replace these with your actual Stripe price IDs
export const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_1234567890',
  pro_plus_monthly: process.env.STRIPE_PRO_PLUS_MONTHLY_PRICE_ID || 'price_0987654321',
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_yearly_pro',
  pro_plus_yearly: process.env.STRIPE_PRO_PLUS_YEARLY_PRICE_ID || 'price_yearly_pro_plus',
} as const

// Subscription tier mapping
export const SUBSCRIPTION_TIERS = {
  [PRICE_IDS.pro_monthly]: 'pro',
  [PRICE_IDS.pro_plus_monthly]: 'pro+',
  [PRICE_IDS.pro_yearly]: 'pro',
  [PRICE_IDS.pro_plus_yearly]: 'pro+',
} as const

export type SubscriptionTier = 'free' | 'pro' | 'pro+'
