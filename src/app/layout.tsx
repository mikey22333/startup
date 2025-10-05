import './globals.css'
import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/AuthProvider'
import { PostHogProvider } from '@/components/PostHogProvider'
import Script from 'next/script'
import { getPermissionsPolicyHeader, getFeaturePolicyHeader } from '@/utils/permissions-fix'

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
        {/* Permissions Policy for Payment API - Allows payment processing with wildcard syntax */}
        <meta httpEquiv="Permissions-Policy" content={getPermissionsPolicyHeader()} />
        {/* Feature Policy for older browsers */}
        <meta httpEquiv="Feature-Policy" content={getFeaturePolicyHeader()} />
        {/* Favicon: use the logo from the public folder */}
        <link rel="icon" href="/Gemini_Generated_Image_q3lht8q3lht8q3lh.png" />
        <link rel="apple-touch-icon" href="/Gemini_Generated_Image_q3lht8q3lht8q3lh.png" />
        {/* Ahrefs Web Analytics */}
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="8fKpsbt/9Pkf4pDF1W5Txg" async></script>
      </head>
      <body className="bg-black">
        {/* Runtime permissions policy fix */}
        <Script
          id="permissions-fix"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                try {
                  // Apply permissions policy meta tags
                  if (!document.querySelector('meta[http-equiv="Permissions-Policy"]')) {
                    const meta = document.createElement('meta');
                    meta.httpEquiv = 'Permissions-Policy';
                    meta.content = 'payment=(*), publickey-credentials-get=(*), web-share=(*), clipboard-write=(*), clipboard-read=(*), camera=(), microphone=(), geolocation=()';
                    document.head.appendChild(meta);
                  }
                  if (!document.querySelector('meta[http-equiv="Feature-Policy"]')) {
                    const featureMeta = document.createElement('meta');
                    featureMeta.httpEquiv = 'Feature-Policy';
                    featureMeta.content = 'payment *; publickey-credentials-get *; web-share *; clipboard-write *; clipboard-read *';
                    document.head.appendChild(featureMeta);
                  }
                  
                  // Enhanced iframe permissions for Paddle checkout
                  const originalCreateElement = document.createElement;
                  document.createElement = function(tagName) {
                    const element = originalCreateElement.call(this, tagName);
                    if (tagName.toLowerCase() === 'iframe') {
                      element.setAttribute('allow', 'payment *; publickey-credentials-get *; web-share *; clipboard-write *; clipboard-read *');
                      element.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
                    }
                    return element;
                  };
                  
                  console.log('✅ Runtime permissions policy and iframe fix applied');
                } catch (e) { console.warn('Permissions fix failed:', e); }
              }
            `
          }}
        />
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
