const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enables React Strict Mode for better debugging
  output: 'export', // Configures Next.js to generate a static site
  distDir: 'out', // Specifies the output directory for static files
  images: {
    unoptimized: true, // Disables Next.js image optimization (required for static export with Amplify unless using an external service)
  },
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'], // Limits page files to specific extensions, ignoring API routes for static export
  webpack: (config, { isServer }) => {
    // Client-side fallback for modules not needed in static export
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // File system module not needed client-side
        net: false, // Network module not needed
        tls: false, // TLS module not needed
        dns: false, // DNS module not needed
        pg: false, // PostgreSQL module not needed (if using Supabase or similar)
      };
    }

    // Aliases for monorepo shared package
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': path.resolve(__dirname, '../shared/src'),
      '@tempos-ai/shared': path.resolve(__dirname, '../shared/src'),
    };

    return config;
  },
  transpilePackages: ['@tempos-ai/shared'], // Transpiles the shared package for use in Next.js
  // Optional: Add custom headers or redirects if needed
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;