import './globals.css'
import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/AuthProvider'
import { PostHogProvider } from '@/components/PostHogProvider'

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
