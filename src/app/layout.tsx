import './globals.css'
import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/AuthProvider'
import { PostHogProvider } from '@/components/PostHogProvider'

// Force dynamic rendering for all pages to prevent useSearchParams errors
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'PlanSpark - Ignite Your Business Ideas',
  description: 'Generate detailed, actionable 30-60-90 day business plans from your ideas using AI',
  // Enables automatic insertion of the Google verification meta tag by Next.js
  verification: {
    google: 'Fr9_HEnZtTppqv_yTBpPnT_F7Ph1wLmbQ_jVs_WNLTo'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Direct meta tag (explicit) - safe to keep alongside metadata.verification */}
        <meta name="google-site-verification" content="Fr9_HEnZtTppqv_yTBpPnT_F7Ph1wLmbQ_jVs_WNLTo" />
        {/* Permissions Policy for Payment API - Allows payment processing */}
        <meta httpEquiv="Permissions-Policy" content="payment=*, publickey-credentials-get=*, web-share=*" />
        {/* Favicon: use the logo from the public folder */}
        <link rel="icon" href="/Gemini_Generated_Image_q3lht8q3lht8q3lh.png" />
        <link rel="apple-touch-icon" href="/Gemini_Generated_Image_q3lht8q3lht8q3lh.png" />
      </head>
      <body className="bg-black">
        <PostHogProvider>
          <AuthProvider>
            <div className="min-h-screen">
              {children}
            </div>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
