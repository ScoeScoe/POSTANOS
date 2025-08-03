/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for Cloudflare Pages (disabled during development for Clerk)
  // output: 'export',
  
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lob-assets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'r2.cloudflarestorage.com',
        pathname: '/**',
      },
    ],
  },
  
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Experimental features
  experimental: {
    // Enable server actions (if needed in the future)
    // serverActions: true,
  },
  
  // Custom webpack configuration
  webpack: (config, { isServer }) => {
    // Handle Cloudflare Workers types
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;