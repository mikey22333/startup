/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for Render deployment
  output: 'standalone',
  
  // Performance optimizations
  experimental: {
    forceSwcTransforms: true,
  },
  
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
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
};

module.exports = nextConfig;
