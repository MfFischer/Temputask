const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove static export for development only
  // output: 'export',
  // distDir: 'out',
  images: {
    // No need for unoptimized in dev mode
  },
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