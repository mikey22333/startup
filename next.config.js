/** @type {import('next').NextConfig} */

// Comprehensive permissions policy values for live deployment
const PERMISSIONS_POLICY = 'payment=(*), publickey-credentials-get=(*), web-share=(*), clipboard-write=(*), clipboard-read=(*), camera=(), microphone=(), geolocation=()';
const FEATURE_POLICY = 'payment *; publickey-credentials-get *; web-share *; clipboard-write *; clipboard-read *';

const nextConfig = {
  // Optimize for Render deployment
  output: 'standalone',
  
  // Force dynamic rendering to fix useSearchParams errors
  experimental: {
    forceSwcTransforms: true,
  },

  // Skip static generation for pages with dynamic content
  trailingSlash: false,
  
  // ESLint configuration for production builds
  eslint: {
    // Only run ESLint on these directories during builds
    dirs: ['src'],
    // Allow production builds to complete even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration
  typescript: {
    // Disable type checking during builds if needed
    ignoreBuildErrors: false,
  },
  
  // Image optimization
  images: {
    domains: [],
    unoptimized: true, // For Render free tier compatibility
  },
  
  // Disable source maps in production for smaller builds
  productionBrowserSourceMaps: false,
  
  // Optimize bundle size
  swcMinify: true,
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' https://*.paddle.com https://buy.paddle.com https://cdn.paddle.com https://us.i.posthog.com https://app.posthog.com https://us-assets.i.posthog.com https://*.supabase.co",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.paddle.com https://cdn.paddle.com https://us.i.posthog.com https://us-assets.i.posthog.com https://public.profitwell.com",
              "style-src 'self' 'unsafe-inline' https://*.paddle.com https://cdn.paddle.com",
              "style-src-elem 'self' 'unsafe-inline' https://*.paddle.com https://cdn.paddle.com",
              "connect-src 'self' https://*.paddle.com https://checkout-service.paddle.com https://buy.paddle.com https://us.i.posthog.com https://app.posthog.com https://us-assets.i.posthog.com https://*.supabase.co https://public.profitwell.com https://*.m2pfintech.com",
              "frame-src 'self' https://buy.paddle.com https://*.paddle.com https://*.m2pfintech.com https://checkout-service.paddle.com",
              "frame-ancestors 'self' http://localhost:* https://*.paddle.com https://checkout-service.paddle.com",
              "img-src 'self' data: https://*.paddle.com"
            ].join('; ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: PERMISSIONS_POLICY
          },
          {
            key: 'Feature-Policy',
            value: FEATURE_POLICY
          }
        ]
      }
    ]
  }
};

module.exports = nextConfig;
