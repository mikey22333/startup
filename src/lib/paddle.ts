import { initializePaddle, Paddle } from '@paddle/paddle-js'

// Paddle configuration
const paddleEnvironment = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN

// Paddle instance
let paddleInstance: Paddle | null = null

export const getPaddle = async (): Promise<Paddle | null> => {
  if (!paddleClientToken) {
    console.warn('Paddle client token not found')
    return null
  }

  if (!paddleInstance) {
    try {
      // CRITICAL: Set environment to sandbox FIRST - this is required!
      if (paddleEnvironment === 'sandbox') {
        console.log('🏖️ Setting Paddle environment to sandbox')
        // @ts-ignore - Paddle.Environment exists on window.Paddle
        if (typeof window !== 'undefined' && (window as any).Paddle) {
          (window as any).Paddle.Environment.set('sandbox')
        }
      }

      console.log('🔧 Initializing Paddle with:', { environment: paddleEnvironment, token: paddleClientToken.substring(0, 10) + '...' })
      
      const result = await initializePaddle({
        environment: paddleEnvironment as 'production' | 'sandbox',
        token: paddleClientToken,
      })
      
      // Set environment again after initialization to be sure
      if (paddleEnvironment === 'sandbox' && result) {
        console.log('🏖️ Confirming sandbox environment after init')
        // @ts-ignore
        if ((window as any).Paddle?.Environment) {
          (window as any).Paddle.Environment.set('sandbox')
        }
      }
      
      paddleInstance = result || null
      console.log('✅ Paddle initialized successfully:', !!paddleInstance)
    } catch (error) {
      console.error('❌ Failed to initialize Paddle:', error)
      return null
    }
  }

  return paddleInstance
}

// Paddle price IDs - Replace these with your actual Paddle price IDs from dashboard
export const PADDLE_PRICE_IDS = {
  PRO_MONTHLY: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID || 'pri_01j123456789',
  PRO_YEARLY: process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID || 'pri_01j987654321',
  PRO_PLUS_MONTHLY: process.env.NEXT_PUBLIC_PADDLE_PRO_PLUS_MONTHLY_PRICE_ID || 'pri_01k123456789',
  PRO_PLUS_YEARLY: process.env.NEXT_PUBLIC_PADDLE_PRO_PLUS_YEARLY_PRICE_ID || 'pri_01k987654321',
}

// Helper function to open Paddle checkout
export const openPaddleCheckout = async ({
  priceId,
  customerId,
  billingPeriod = 'monthly',
  userEmail
}: {
  priceId: string
  customerId?: string | null
  billingPeriod?: 'monthly' | 'yearly'
  userEmail?: string | null
}) => {
  console.log('🚀 Starting Paddle checkout process...')
  
  const paddle = await getPaddle()
  
  if (!paddle) {
    console.error('❌ Paddle not initialized')
    throw new Error('Payment system not available')
  }

  console.log('✅ Paddle instance obtained:', paddle)
  console.log('🔍 Paddle instance methods:', Object.keys(paddle))
  console.log('🔍 Paddle Checkout methods:', paddle.Checkout ? Object.keys(paddle.Checkout) : 'No Checkout object')

  try {
    console.log('Opening Paddle checkout with:', { priceId, customerId, billingPeriod })
    
    // Test if Paddle.Checkout.open exists and is a function
    if (!paddle.Checkout || typeof paddle.Checkout.open !== 'function') {
      console.error('❌ Paddle.Checkout.open is not available')
      console.error('Paddle.Checkout:', paddle.Checkout)
      throw new Error('Paddle checkout method not available')
    }

    console.log('✅ Paddle.Checkout.open is available')

    // First test if the price exists using PricePreview
    console.log('🔍 Testing price with PricePreview API...')
    try {
      const pricePreview = await paddle.PricePreview({
        items: [{
          priceId: priceId,
          quantity: 1
        }]
      })
      console.log('✅ Price preview successful:', pricePreview)
    } catch (priceError) {
      console.error('❌ Price preview failed:', priceError)
      
      // Show user-friendly error
      alert(`Price ID "${priceId}" does not exist in Paddle. Please create the product in your Paddle dashboard first.`)
      throw new Error(`Invalid price ID: ${priceId}`)
    }
    
    // Enhanced checkout options with settings to prevent 400 errors
    const checkoutOptions: any = {
      items: [{ 
        priceId: priceId,
        quantity: 1 
      }],
      customer: {
        email: userEmail || 'test@example.com' // Use actual user email if provided
      },
      settings: {
        displayMode: 'overlay',
        theme: 'light',
        locale: 'en',
        allowLogout: false,
        successUrl: `${window.location.origin}/pricing?success=true`,
        showAddDiscounts: false,
        showAddTaxId: false
      }
    }

    // Add customer info if available (override test email)
    if (customerId) {
      checkoutOptions.customerId = customerId
    }

    console.log('Checkout options being sent to Paddle:', JSON.stringify(checkoutOptions, null, 2))
    console.log('Price ID being used:', priceId)
    console.log('Window origin:', window.location.origin)

    const result = paddle.Checkout.open(checkoutOptions)
    console.log('Paddle checkout result:', result)
    return result
  } catch (error) {
    console.error('Failed to open Paddle checkout:', error)
    throw error
  }
}
