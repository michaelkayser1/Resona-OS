/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },

  // API route configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-QOTE-Version, Content-Type, Authorization' },
        ],
      },
    ];
  },

  // Environment variables validation
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    QOTE_API_VERSION: process.env.QOTE_API_VERSION || '1',
  },

  // TypeScript config
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint config
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
