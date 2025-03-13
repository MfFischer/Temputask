/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: [
        'via.placeholder.com',
        'localhost'
      ],
    },
    env: {
      APP_NAME: 'Tempu Task',
    },
    experimental: {
      outputFileTracingExcludes: {
        '*': [
          'node_modules/@swc/core-linux-x64-gnu',
          'node_modules/@swc/core-linux-x64-musl',
          'node_modules/@esbuild/linux-x64',
        ],
      },
    },
  }
  
  module.exports = nextConfig