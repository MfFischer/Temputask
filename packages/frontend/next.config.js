const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Always use static export for production builds
  ...(process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_EXPORT === 'true' ? {
    output: 'export',
    distDir: 'out',
    images: {
      unoptimized: true,
    },
    trailingSlash: true,
    // Add this to ensure proper static HTML generation
    generateStaticParams: true,
  } : {
    // Development settings (no static export)
    images: {
      domains: ['localhost'],
    },
  }),
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to import these modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        pg: false,
      };
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': path.resolve(__dirname, '../shared/src'),
      '@tempos-ai/shared': path.resolve(__dirname, '../shared/src'),
    };
    
    return config;
  },
  transpilePackages: ['@tempos-ai/shared'],
};

module.exports = nextConfig;