/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the experimental appDir as it's default in Next.js 14
  output: 'standalone',
  experimental: {
    forceSwcTransforms: true,
  },
};

module.exports = nextConfig;
